import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import type { LongRunningOperationAdapter } from '../../src/lib/generation-worker-core';
import { httpError, workerHarness } from '../fixtures/generation-worker-harness';

type FakeOptions = {
  pollsUntilDone?: number;
  submitOutcomes?: Array<'ok' | 'crash' | Error>;
  crashOnFirstPoll?: boolean;
  finalState?: 'succeeded' | 'failed';
  idempotentSubmit?: boolean;
};

/** Synthetic long-running provider: no network, no paid calls. */
function fakeVideoProvider(options: FakeOptions = {}) {
  const submissions: string[] = [];
  const polls: string[] = [];
  const submitOutcomes = [...(options.submitOutcomes ?? [])];
  let crashedPoll = false;
  const adapter = (): LongRunningOperationAdapter => ({
    name: 'synthetic-video',
    idempotentSubmit: options.idempotentSubmit ?? false,
    async submit(_job, submissionKey) {
      const outcome = submitOutcomes.shift() ?? 'ok';
      if (outcome instanceof Error) throw outcome;
      submissions.push(submissionKey);
      if (outcome === 'crash') return new Promise<never>(() => undefined); // accepted, then the instance died
      return { providerRequestId: `operations/video-${submissions.length}` };
    },
    async poll(_job, id) {
      if (options.crashOnFirstPoll && !crashedPoll) { crashedPoll = true; return new Promise<never>(() => undefined); }
      polls.push(id);
      if (polls.length < (options.pollsUntilDone ?? 1)) return { state: 'pending' };
      if (options.finalState === 'failed') return { state: 'failed', error: httpError(400, 'content rejected') };
      return { state: 'succeeded', result: { videoUrl: 'https://r2.invalid/generated/videos/u/j.mp4', assetKey: 'generated/videos/u/j.mp4' } };
    },
  });
  return { adapter, submissions, polls };
}

function videoHarness(provider: ReturnType<typeof fakeVideoProvider>, extra: Partial<Parameters<typeof workerHarness>[0]> = {}) {
  return workerHarness({ kind: 'video', provider: 'veo', adapter: provider.adapter, pollIntervalMs: 20_000, pollBudgetMs: 40_000, ...extra });
}

test('video submits once, persists providerRequestId before polling, and finalizes', async () => {
  const provider = fakeVideoProvider({ pollsUntilDone: 2 });
  const h = videoHarness(provider);
  const result = await h.deliver();
  assert.equal(result?.status, 'completed');
  assert.equal(provider.submissions.length, 1);
  assert.equal(h.job.providerRequestId, 'operations/video-1');
  const op = h.job.providerOperation as Record<string, unknown>;
  assert.equal(op.status, 'succeeded');
  assert.equal(op.provider, 'veo');
  assert.equal(op.submissionKey, 'gen-key-1');
  assert.equal(op.pollCount, 2);
  assert.ok(op.submittedAt instanceof Date && op.completedAt instanceof Date);
  assert.equal(h.job.assetRef, 'generated/videos/u/j.mp4');
  assert.equal(h.count('capture'), 1);
});

test('a long render releases the worker and resumes by delayed delivery without consuming attempts', async () => {
  const provider = fakeVideoProvider({ pollsUntilDone: 12 });
  const h = videoHarness(provider, { maxAttempts: 3 });
  let deliveries = 0;
  for (;;) {
    const result = await h.deliver();
    deliveries += 1;
    if (result?.status !== 'queued') { assert.equal(result?.status, 'completed'); break; }
    assert.equal(h.job.attempts, 0, 'polling cycles do not burn provider attempts');
    assert.equal(h.job.lockToken, null, 'worker released the job');
    h.untilNextAttempt();
    assert.ok(deliveries < 20);
  }
  assert.ok(deliveries > 3, 'more poll cycles than maxAttempts');
  assert.equal(provider.submissions.length, 1, 'never re-submitted');
  assert.deepEqual(h.followUps.map(f => f.reason), Array(deliveries - 1).fill('poll'));
  assert.equal(new Set(h.followUps.map(f => f.deliveryKey)).size, h.followUps.length, 'unique task names per poll');
  assert.equal(h.count('capture'), 1);
});

test('restart while polling resumes the same providerRequestId (no second video)', async () => {
  const provider = fakeVideoProvider({ crashOnFirstPoll: true, pollsUntilDone: 1 });
  const h = videoHarness(provider);
  void h.deliver(); // dies mid-poll after the id was persisted
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(h.job.providerRequestId, 'operations/video-1');
  h.advance(5 * 60_000);
  assert.equal((await h.deliver())?.status, 'completed');
  assert.equal(provider.submissions.length, 1);
  assert.deepEqual(provider.polls, ['operations/video-1']);
});

test('crash between provider acceptance and persisting the id is never re-submitted (non-idempotent provider)', async () => {
  const provider = fakeVideoProvider({ submitOutcomes: ['crash'] });
  const h = videoHarness(provider);
  void h.deliver();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal((h.job.providerOperation as Record<string, unknown>).status, 'submitting');
  h.advance(5 * 60_000);
  const result = await h.deliver();
  assert.equal(result?.status, 'dead_letter');
  assert.equal(provider.submissions.length, 1, 'ambiguous submit is not repeated');
  assert.equal(h.job.retryable, false);
  assert.equal(h.count('refund'), 1);
  assert.equal(h.count('capture'), 0);
});

test('an idempotent provider may be re-submitted with the same submission key after an ambiguous crash', async () => {
  const provider = fakeVideoProvider({ submitOutcomes: ['crash', 'ok'], idempotentSubmit: true });
  const h = videoHarness(provider);
  void h.deliver();
  await new Promise(resolve => setImmediate(resolve));
  h.advance(5 * 60_000);
  assert.equal((await h.deliver())?.status, 'completed');
  assert.deepEqual(provider.submissions, ['gen-key-1', 'gen-key-1']);
});

test('a definite submit rejection (429) is retried and submitted again', async () => {
  const provider = fakeVideoProvider({ submitOutcomes: [httpError(429)] });
  const h = videoHarness(provider);
  assert.equal((await h.deliver())?.status, 'queued');
  assert.equal(h.job.providerOperation, null, 'nothing pending at the provider');
  h.untilNextAttempt();
  assert.equal((await h.deliver())?.status, 'completed');
  assert.equal(provider.submissions.length, 1, 'only the accepted submit counts');
  assert.equal(h.count('capture'), 1);
});

test('provider-side video failure dead-letters and refunds exactly once', async () => {
  const provider = fakeVideoProvider({ finalState: 'failed' });
  const h = videoHarness(provider);
  assert.equal((await h.deliver())?.status, 'dead_letter');
  assert.equal((h.job.providerOperation as Record<string, unknown>).status, 'failed');
  assert.equal(await h.deliver(), null);
  assert.equal(h.count('refund'), 1);
});

test('operation exceeding its max duration is closed, refunded once, and keeps the id for reconciliation', async () => {
  const provider = fakeVideoProvider({ pollsUntilDone: 10_000 });
  const h = videoHarness(provider, { maxOperationMs: 5 * 60_000 });
  let result;
  for (let i = 0; i < 50; i += 1) {
    result = await h.deliver();
    if (result?.status !== 'queued') break;
    h.untilNextAttempt();
  }
  assert.equal(result?.status, 'dead_letter');
  assert.equal((h.job.failureMetadata as Record<string, unknown>).code, 'VIDEO_OPERATION_EXPIRED');
  assert.equal(h.job.providerRequestId, 'operations/video-1');
  assert.equal(h.count('refund'), 1);
  assert.equal(provider.submissions.length, 1);
});

test('legacy backend keeps the existing synchronous video path', async () => {
  const provider = fakeVideoProvider();
  const h = videoHarness(provider, { executionBackend: 'legacy', outcomes: ['ok'] });
  assert.equal((await h.deliver())?.status, 'completed');
  assert.equal(provider.submissions.length, 0);
  assert.equal(h.providerExecutions.length, 1);
});

test('Veo adapter uses submit/poll, stores the video in R2 and never logs secrets', () => {
  const source = readFileSync('src/lib/video-operation-adapters.ts', 'utf8');
  assert.match(source, /ai\.models\.generateVideos\(/);
  assert.match(source, /ai\.operations\.getVideosOperation\(/);
  assert.match(source, /putR2Object\(/);
  assert.match(source, /idempotentSubmit: false/);
  assert.doesNotMatch(source, /console\./);
});
