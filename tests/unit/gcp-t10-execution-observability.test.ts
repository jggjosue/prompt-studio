import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGenerationExecutionRecord, emitGenerationExecutionRecord, redactSecrets } from '../../src/lib/generation-execution-log';
import type { IAIGenerationJob } from '../../src/models/AIGenerationJob';
import { httpError, workerHarness } from '../fixtures/generation-worker-harness';

const REQUIRED_FIELDS = [
  'jobId', 'generationId', 'correlationId', 'workload', 'executionBackend', 'queue', 'provider', 'model', 'status',
  'attempts', 'latencyMs', 'providerRequestId', 'errorCategory', 'httpStatus', 'usage', 'providerCostUsd',
  'estimatedCredits', 'actualCredits', 'workerService', 'workerRevision', 'timestamps',
];

const SECRET_PROMPT = 'make a logo for ACME, my key is sk-live1234567890abcdef';
const BASE64 = 'A'.repeat(400);

function completedJob(): IAIGenerationJob {
  return {
    _id: '65f0000000000000000000cc', userId: 'user_secret_id', userEmail: 'person@example.com', kind: 'video', provider: 'veo', modelId: 'veo-3.1-generate-001',
    input: { prompt: SECRET_PROMPT, referenceImage: `data:image/png;base64,${BASE64}` }, result: { videoUrl: 'https://r2.invalid/v.mp4', durationSeconds: 8, b64: BASE64 },
    status: 'completed', correlationId: 'corr-9', generationIdempotencyKey: 'gen-9', attempts: 1, maxAttempts: 3, actualDurationMs: 61_000,
    providerRequestId: 'operations/abc', dispatch: { backend: 'gcp-cloud-tasks', queue: 'ps-ai-video' }, actualInputTokens: null, actualOutputTokens: null,
    actualCostUsd: 0.4, estimatedCostUsd: 0.35, creditCost: 25, creditsCharged: 25, creditsState: 'captured',
    createdAt: new Date('2026-10-03T00:00:00Z'), startedAt: new Date('2026-10-03T00:00:05Z'), completedAt: new Date('2026-10-03T00:01:06Z'),
  } as unknown as IAIGenerationJob;
}

test('execution record carries every required field', () => {
  const record = buildGenerationExecutionRecord({
    job: completedJob(), outcome: 'completed', executionBackend: 'gcp',
    env: { K_SERVICE: 'prompt-studio-ai-worker', K_REVISION: 'prompt-studio-ai-worker-00042-abc' } as unknown as NodeJS.ProcessEnv,
    now: new Date('2026-10-03T00:01:07Z'),
  });
  for (const field of REQUIRED_FIELDS) assert.ok(field in record, field);
  assert.equal(record.workload, 'video');
  assert.equal(record.queue, 'ps-ai-video');
  assert.equal(record.latencyMs, 61_000);
  assert.equal(record.providerRequestId, 'operations/abc');
  assert.equal(record.providerCostUsd, 0.4);
  assert.equal(record.estimatedCredits, 25);
  assert.equal(record.actualCredits, 25);
  assert.equal(record.usage.mediaSeconds, 8);
  assert.equal(record.workerService, 'prompt-studio-ai-worker');
  assert.equal(record.workerRevision, 'prompt-studio-ai-worker-00042-abc');
  assert.equal(record.timestamps.completedAt, '2026-10-03T00:01:06.000Z');
  assert.match(String(record.userRef), /^usr_[0-9a-f]{20}$/);
});

test('execution record never contains prompts, emails, raw user ids, base64 or secrets', () => {
  let line = '';
  emitGenerationExecutionRecord(buildGenerationExecutionRecord({ job: completedJob(), outcome: 'completed', executionBackend: 'gcp' }), out => { line = out; });
  assert.ok(line.endsWith('\n'));
  JSON.parse(line);
  for (const forbidden of ['make a logo', 'sk-live', 'person@example.com', 'user_secret_id', BASE64.slice(0, 50), 'data:image']) {
    assert.equal(line.includes(forbidden), false, forbidden);
  }
});

test('redactSecrets removes keys, tokens, connection strings and media blobs', () => {
  const samples = [
    'Bearer ya29.a0AfB_byC-0123456789abcdef', 'sk-proj-abcdefghijklmnop', 'sk_live_51Habcdefghijkl', 'AIzaSyA-0123456789abcdefghijklmnop',
    'AKIAABCDEFGHIJKLMNOP', 'whsec_abcdefghijkl', 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYifQ.abcdefghijklmnop',
    'mongodb+srv://user:pass@cluster0.example.mongodb.net/db', `data:image/png;base64,${BASE64}`, BASE64,
  ];
  for (const sample of samples) assert.doesNotMatch(redactSecrets(`error: ${sample} end`), new RegExp(sample.slice(0, 12).replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')), sample.slice(0, 12));
});

test('the runtime emits exactly one record per outcome with error details on failures', async () => {
  const ok = workerHarness({ outcomes: ['ok'] });
  await ok.deliver();
  assert.deepEqual(ok.logs.map(log => log.outcome), ['completed']);

  const retry = workerHarness({ outcomes: [httpError(429), httpError(403)] });
  await retry.deliver();
  retry.untilNextAttempt();
  await retry.deliver();
  assert.deepEqual(retry.logs.map(log => log.outcome), ['retry_scheduled', 'dead_letter']);
  assert.equal(retry.logs[0].error?.httpStatus, 429);
  assert.equal(retry.logs[0].error?.category, 'rate_limit_or_quota');
  assert.equal(retry.logs[1].error?.category, 'auth_or_permission');
  assert.ok(retry.logs.every(log => log.executionBackend === 'gcp'));
});
