import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyGenerationError } from '../../src/lib/generation-worker-core';
import { generationRetryDecision } from '../../src/lib/generation-retry-policy';
import { httpError, networkError, workerHarness as harness, type Outcome } from '../fixtures/generation-worker-harness';

test('duplicate concurrent delivery executes the provider at most once and captures once', async () => {
  const h = harness({ outcomes: ['ok'] });
  const [first, second] = await Promise.all([h.deliver(), h.deliver()]);
  assert.deepEqual([first?.status, second], ['completed', null]);
  const third = await h.deliver(); // late duplicate after completion
  assert.equal(third, null);
  assert.equal(h.providerExecutions.length, 1);
  assert.equal(h.count('capture'), 1);
  assert.equal(h.count('refund'), 0);
  assert.equal(h.job.status, 'completed');
});

test('a job pinned to another backend is never claimed', async () => {
  const h = harness({ outcomes: ['ok'], executionBackend: 'gcp' });
  h.job.executionBackend = 'legacy';
  assert.equal(await h.deliver(), null);
  assert.equal(h.providerCalls.length, 0);
});

test('crash before provider submission is retried safely after the lease expires', async () => {
  const h = harness({ outcomes: ['ok'] });
  // Simulate the worker dying right after the claim (before calling the provider).
  h.job.status = 'processing'; h.job.attempts = 1; h.job.lockToken = 'dead-worker'; h.job.leaseExpiresAt = new Date(Date.parse('2026-10-03T00:05:00Z'));
  assert.equal(await h.deliver(), null, 'lease still held by the dead worker');
  h.advance(5 * 60_000);
  const result = await h.deliver();
  assert.equal(result?.status, 'completed');
  assert.equal(h.providerExecutions.length, 1);
  assert.equal(h.count('capture'), 1);
});

test('crash after provider submission resumes with the same submission key (no second generation)', async () => {
  const h = harness({ outcomes: ['crash'] });
  void h.deliver(); // never settles: the instance died after the provider accepted the work
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.providerExecutions.length, 1);
  h.advance(5 * 60_000); // lease expiry
  const resumed = await h.deliver();
  assert.equal(resumed?.status, 'completed');
  assert.deepEqual(h.providerCalls, ['gen-key-1', 'gen-key-1'], 'same idempotency key on resume');
  assert.equal(h.providerExecutions.length, 1, 'provider replayed instead of generating twice');
  assert.equal(h.job.providerRequestId, 'req-1');
  assert.equal(h.count('capture'), 1);
});

for (const [label, error] of [['429', httpError(429)], ['503', httpError(503)], ['502', httpError(502)], ['network', networkError()], ['timeout', new Error('request timeout')]] as const) {
  test(`${label} is retried with backoff via one follow-up delivery on the same backend`, async () => {
    const h = harness({ outcomes: [error, 'ok'] });
    const first = await h.deliver();
    assert.equal(first?.status, 'queued');
    assert.equal(h.job.retryable, true);
    assert.equal(h.followUps.length, 1);
    assert.equal(h.followUps[0].deliveryKey, 'attempt-2');
    assert.ok(h.job.nextAttemptAt.getTime() >= Date.parse('2026-10-03T00:01:00Z'), 'backoff >= 60s');
    assert.equal(await h.deliver(), null, 'early redelivery (transport retry) does nothing before nextAttemptAt');
    h.untilNextAttempt();
    assert.equal((await h.deliver())?.status, 'completed');
    assert.equal(h.count('capture'), 1);
    assert.equal(h.count('refund'), 0);
  });
}

for (const [label, error, category] of [
  ['400', httpError(400), 'bad_request'],
  ['401', httpError(401), 'auth_or_permission'],
  ['403', httpError(403), 'auth_or_permission'],
  ['validation', httpError(422), 'validation_error'],
  ['configuration', Object.assign(new Error('missing key'), { code: 'CREDENTIAL_MISSING' }), 'configuration_error'],
  ['501', httpError(501), 'provider_error'],
] as const) {
  test(`${label} is not retried: dead-lettered and refunded exactly once`, async () => {
    const h = harness({ outcomes: [error] });
    const result = await h.deliver();
    assert.equal(result?.status, 'dead_letter');
    assert.equal(h.job.errorCategory, category);
    assert.equal(h.job.retryable, false);
    assert.equal(h.followUps.length, 0, 'no automatic retry');
    assert.equal(h.count('refund'), 1);
    assert.equal(h.count('capture'), 0);
  });
}

test('legacy jobs keep their existing retry path (no cloud follow-up)', async () => {
  const h = harness({ outcomes: [httpError(429), 'ok'], executionBackend: 'legacy' });
  assert.equal((await h.deliver())?.status, 'queued');
  assert.equal(h.followUps.length, 0);
});

test('terminal failure after exhausting attempts refunds exactly once', async () => {
  const h = harness({ outcomes: [httpError(503), httpError(503), httpError(503)], maxAttempts: 3 });
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    assert.equal((await h.deliver())?.status, 'queued');
    h.untilNextAttempt();
  }
  assert.equal((await h.deliver())?.status, 'dead_letter');
  assert.equal(h.job.retryable, true, 'retryable category, but out of attempts');
  assert.equal(h.count('refund'), 1);
  assert.equal(h.providerCalls.length, 3);
});

test('DLQ / duplicate redelivery after a terminal state never charges or refunds again', async () => {
  const h = harness({ outcomes: [httpError(400)] });
  await h.deliver();
  for (let i = 0; i < 3; i += 1) assert.equal(await h.deliver(), null);
  h.advance(60 * 60_000);
  assert.equal(await h.deliver(), null);
  assert.deepEqual(h.ledger, [{ jobId: h.job._id, op: 'refund' }]);
});

test('worker lost on its last attempt: recovery closes the job and refunds once, never re-runs the provider', async () => {
  const h = harness({ outcomes: [] , maxAttempts: 3 });
  Object.assign(h.job, { status: 'processing', attempts: 3, lockToken: 'dead', leaseExpiresAt: new Date(Date.parse('2026-10-03T00:00:00Z')) });
  const result = await h.deliver();
  assert.equal(result?.status, 'failed');
  assert.equal(h.providerCalls.length, 0);
  assert.equal(await h.deliver(), null);
  assert.equal(h.count('refund'), 1);
  assert.equal(h.count('capture'), 0);
});

test('success and terminal failure are mutually exclusive in the ledger', async () => {
  for (const outcomes of [['ok'], [httpError(401)], [httpError(429), 'ok']] as Outcome[][]) {
    const h = harness({ outcomes, maxAttempts: 2 });
    await h.deliver();
    h.untilNextAttempt();
    await h.deliver();
    assert.ok(!(h.count('capture') > 0 && h.count('refund') > 0));
    assert.ok(h.count('capture') <= 1 && h.count('refund') <= 1);
  }
});

test('error classification: network/eligible 5xx retry; 4xx, config and 501 do not', () => {
  const retryable = (error: unknown) => generationRetryDecision({ category: classifyGenerationError(error).category, attempt: 1, maxAttempts: 3 }).action === 'retry';
  assert.equal(classifyGenerationError(networkError()).code, 'NETWORK_ECONNRESET');
  for (const error of [httpError(429), httpError(500), httpError(502), httpError(503), httpError(504), networkError(), new Error('socket hang up')]) assert.equal(retryable(error), true);
  for (const error of [httpError(400), httpError(401), httpError(403), httpError(404), httpError(422), httpError(501), httpError(505), Object.assign(new Error('x'), { code: 'CREDENTIAL_MISSING' })]) assert.equal(retryable(error), false);
});
