import '../support/fake-mongo-env';
import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { FakeCollection, patchModel } from '../support/fake-mongo';
import TrainingDataRecord from '../../src/models/TrainingDataRecord';
import AIGenerationJob from '../../src/models/AIGenerationJob';
import TrainingConsentRecord, { TRAINING_CONSENT_POLICY_VERSION } from '../../src/models/TrainingConsentRecord';
import * as capture from '../../src/lib/training/capture';
import { sweepTrainingOutbox } from '../../src/lib/training/training-queue';
import { setTrainingMetricSink } from '../../src/lib/training/training-metrics';

const QUEUE = 'https://sqs.us-east-2.amazonaws.com/123456789012/prompt-studio-training';
let records: FakeCollection;
let jobs: FakeCollection;
let consents: FakeCollection;
let restores: Array<() => void> = [];
let sqsBodies: Array<Record<string, unknown>> = [];
let sqsFails = false;
const originalFetch = globalThis.fetch;

function job(overrides: Record<string, unknown> = {}) {
  return {
    _id: '6650c0ffee0000000000aa01',
    userId: 'user_a',
    kind: 'image',
    provider: 'google',
    modelId: 'gemini-2.5-flash-image',
    correlationId: 'corr-1',
    operationCode: 'image.quality-1k',
    promptVersionNumber: null,
    projectId: null,
    status: 'completed',
    input: { prompt: 'a red bicycle at dawn, contact me at ana@example.com', aspectRatio: '16:9' },
    result: { imageUrl: '/api/ai/jobs/6650c0ffee0000000000aa01/asset', asset: { provider: 'cloudflare-r2', bucket: 'prompt-studio-media', key: 'users/user_a/generations/ab.png', contentType: 'image/png', contentHash: 'a'.repeat(64), bytes: 1234 } },
    createdAt: new Date('2026-10-03T10:00:00Z'),
    completedAt: new Date('2026-10-03T10:00:20Z'),
    ...overrides,
  };
}

function consent(userId: string, training = true) {
  consents.insert({ userId, training, policyVersion: TRAINING_CONSENT_POLICY_VERSION, source: 'generate', changedAt: new Date('2026-10-01T00:00:00Z'), revokedAt: null });
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 10));

beforeEach(() => {
  records = new FakeCollection([['entityType', 'recordId']]);
  jobs = new FakeCollection();
  consents = new FakeCollection();
  restores = [patchModel(TrainingDataRecord, records), patchModel(AIGenerationJob, jobs), patchModel(TrainingConsentRecord, consents)];
  sqsBodies = [];
  sqsFails = false;
  process.env.AWS_TRAINING_SQS_QUEUE_URL = QUEUE;
  process.env.AWS_ACCESS_KEY_ID = 'AKIDEXAMPLE';
  process.env.AWS_SECRET_ACCESS_KEY = 'example-secret';
  globalThis.fetch = (async (url: string | URL, init?: RequestInit) => {
    assert.equal(String(url), QUEUE);
    if (sqsFails) return new Response(JSON.stringify({ __type: 'InternalError' }), { status: 500 });
    const request = JSON.parse(String(init?.body));
    sqsBodies.push(JSON.parse(request.MessageBody));
    return new Response(JSON.stringify({ MessageId: `m-${sqsBodies.length}` }), { status: 200 });
  }) as typeof fetch;
  setTrainingMetricSink(() => undefined);
});

afterEach(() => {
  for (const restore of restores) restore();
  globalThis.fetch = originalFetch;
});

test('no training consent at submission means no training record at all', async () => {
  consent('user_a', false);
  jobs.insert(job());
  const result = await capture.captureGenerationRequest(job(), { sessionId: 'chat_1', parentGenerationId: null, appVersion: null });
  assert.deepEqual(result, { captured: false, reason: 'NO_TRAINING_CONSENT' });
  assert.equal(records.docs.length, 0);
});

test('a consented submission stores a request reference and an event, never the prompt', async () => {
  consent('user_a');
  jobs.insert(job());
  await capture.captureGenerationRequest(job(), { sessionId: 'chat_1', parentGenerationId: null, appVersion: '1.4.0' });
  const request = records.docs.find((doc) => doc.entityType === 'request')!;
  assert.equal(request.recordId, 'req:6650c0ffee0000000000aa01');
  assert.equal(request.schemaVersion, 2);
  assert.equal(request.sessionId, 'chat_1');
  assert.equal(request.modality, 'image');
  assert.deepEqual(request.parameters, { operationCode: 'image.quality-1k', promptVersionNumber: null, hasProject: false, aspectRatio: '16:9' });
  assert.equal((request.relations as Record<string, unknown>).familyId, '6650c0ffee0000000000aa01');
  assert.ok(!JSON.stringify(records.docs).includes('red bicycle'), 'prompt text never copied into training records');
  assert.ok(!JSON.stringify(records.docs).includes('ana@example.com'));
  const event = records.docs.find((doc) => doc.eventName === 'prompt_submitted' && doc.entityType === 'event')!;
  assert.equal((event.pipeline as Record<string, unknown>).status, 'skipped');
  assert.equal(sqsBodies.length, 0, 'requests wait for their output');
});

test('a completed generation creates an output record with R2 references and sends an ids-only message', async () => {
  consent('user_a');
  jobs.insert(job());
  await capture.captureGenerationRequest(job(), { sessionId: 'chat_1', parentGenerationId: null, appVersion: null });
  await capture.captureGenerationLifecycle(job(), 'generation_completed');
  const output = records.docs.find((doc) => doc.entityType === 'output')!;
  assert.deepEqual(output.assets, [{ provider: 'cloudflare-r2', bucket: 'prompt-studio-media', key: 'users/user_a/generations/ab.png', contentType: 'image/png', contentHash: 'a'.repeat(64), bytes: 1234 }]);
  assert.equal((output.pipeline as Record<string, unknown>).status, 'queued');
  assert.equal(sqsBodies.length, 1);
  assert.deepEqual(Object.keys(sqsBodies[0]).sort(), ['action', 'correlationId', 'enqueuedAt', 'entityType', 'generationId', 'idempotencyKey', 'recordId', 'schemaVersion']);
  assert.equal(sqsBodies[0].recordId, 'out:6650c0ffee0000000000aa01');
  assert.ok(!JSON.stringify(sqsBodies).includes('users/user_a'), 'no R2 keys in queue messages');

  await capture.captureGenerationLifecycle(job(), 'generation_completed');
  assert.equal(records.docs.filter((doc) => doc.entityType === 'output').length, 1, 'idempotent on retries');
});

test('lifecycle events without a consented request are ignored', async () => {
  jobs.insert(job());
  const result = await capture.captureGenerationLifecycle(job(), 'generation_completed');
  assert.equal(result.captured, false);
  assert.equal(records.docs.length, 0);
  assert.equal(sqsBodies.length, 0);
});

test('client events: ownership enforced, idempotent per user, and signals requeue the output', async () => {
  consent('user_a');
  jobs.insert(job());
  await capture.captureGenerationRequest(job(), { sessionId: null, parentGenerationId: null, appVersion: null });
  await capture.captureGenerationLifecycle(job(), 'generation_completed');
  const event = {
    schemaVersion: 2 as const, clientEventId: '3f2c7a1e-9b4d-4c2a-8e6f-1a2b3c4d5e6f', eventName: 'output_downloaded' as const,
    occurredAt: '2026-10-03T10:01:00.000Z', generationId: '6650c0ffee0000000000aa01', payload: { format: 'png' },
  };
  await assert.rejects(capture.captureClientTrainingEvent('user_b', event), /GENERATION_NOT_FOUND/);
  const first = await capture.captureClientTrainingEvent('user_a', event, new Date('2026-10-03T10:01:01Z'));
  const second = await capture.captureClientTrainingEvent('user_a', event, new Date('2026-10-03T10:01:02Z'));
  assert.deepEqual(first, { captured: true, duplicate: false });
  assert.deepEqual(second, { captured: true, duplicate: true });
  const stored = records.docs.filter((doc) => doc.eventName === 'output_downloaded');
  assert.equal(stored.length, 1);
  assert.match(String(stored[0].recordId), /^evt:c:[a-f0-9]{40}$/);
  assert.equal(stored[0].userId, 'user_a');
  assert.equal(stored[0].provenance && (stored[0].provenance as Record<string, unknown>).correlationId, 'corr-1', 'correlation comes from the job, not the client');
  assert.equal(sqsBodies.length, 2, 'completion + one requeue for the new signal; the duplicate does not requeue');
});

test('regenerate links the new generation to the family of a parent the user owns', async () => {
  consent('user_a');
  const parent = job();
  const child = job({ _id: '6650c0ffee0000000000aa02', createdAt: new Date('2026-10-03T10:02:00Z') });
  const foreign = job({ _id: '6650c0ffee0000000000bb01', userId: 'user_b' });
  jobs.insert(parent); jobs.insert(child); jobs.insert(foreign);
  await capture.captureGenerationRequest(parent, { sessionId: null, parentGenerationId: null, appVersion: null });
  await capture.captureGenerationRequest(child, { sessionId: null, parentGenerationId: parent._id, appVersion: null });
  const childRequest = records.docs.find((doc) => doc.recordId === 'req:6650c0ffee0000000000aa02')!;
  assert.deepEqual(childRequest.relations, { parentGenerationId: parent._id, familyId: parent._id });

  const third = job({ _id: '6650c0ffee0000000000aa03' });
  jobs.insert(third);
  await capture.captureGenerationRequest(third, { sessionId: null, parentGenerationId: foreign._id, appVersion: null });
  const thirdRequest = records.docs.find((doc) => doc.recordId === 'req:6650c0ffee0000000000aa03')!;
  assert.deepEqual(thirdRequest.relations, { parentGenerationId: null, familyId: '6650c0ffee0000000000aa03' }, 'foreign parents are ignored');
});

test('feedback keeps the latest verdict and requeues the output', async () => {
  consent('user_a');
  jobs.insert(job());
  await capture.captureGenerationRequest(job(), { sessionId: null, parentGenerationId: null, appVersion: null });
  await capture.captureGenerationLifecycle(job(), 'generation_completed');
  await capture.captureGenerationFeedback(job(), { useful: true, reason: null }, new Date('2026-10-03T10:05:00Z'));
  await capture.captureGenerationFeedback(job(), { useful: false, reason: 'quality' }, new Date('2026-10-03T10:06:00Z'));
  const feedback = records.docs.filter((doc) => doc.entityType === 'feedback');
  assert.equal(feedback.length, 1);
  assert.deepEqual(feedback[0].payload, { verdict: 'negative', reason: 'quality' });
  assert.equal(sqsBodies.length, 3);
});

test('a queue outage leaves the record captured; the outbox sweep re-sends it, never revoked ones', async () => {
  consent('user_a');
  jobs.insert(job());
  await capture.captureGenerationRequest(job(), { sessionId: null, parentGenerationId: null, appVersion: null });
  sqsFails = true;
  await capture.captureGenerationLifecycle(job(), 'generation_completed');
  const output = () => records.docs.find((doc) => doc.entityType === 'output')!;
  assert.equal((output().pipeline as Record<string, unknown>).status, 'captured');
  assert.match(String((output().pipeline as Record<string, unknown>).lastCode), /^ENQUEUE_FAILED/);

  records.insert({ ...output(), _id: undefined, recordId: 'out:revoked', eligibility: { status: 'revoked', reasonCodes: [] } });
  sqsFails = false;
  const swept = await sweepTrainingOutbox();
  assert.deepEqual(swept, { scanned: 1, enqueued: 1, failed: 0 });
  assert.equal((output().pipeline as Record<string, unknown>).status, 'queued');
  assert.equal(sqsBodies.length, 1);
});

test('without a configured queue nothing is sent and the record waits for the sweep', async () => {
  delete process.env.AWS_TRAINING_SQS_QUEUE_URL;
  consent('user_a');
  jobs.insert(job());
  await capture.captureGenerationRequest(job(), { sessionId: null, parentGenerationId: null, appVersion: null });
  await capture.captureGenerationLifecycle(job(), 'generation_completed');
  const output = records.docs.find((doc) => doc.entityType === 'output')!;
  assert.equal((output.pipeline as Record<string, unknown>).lastCode, 'QUEUE_NOT_CONFIGURED');
  assert.equal(sqsBodies.length, 0);
});

test('best-effort wrappers never throw into the request path', async () => {
  (TrainingConsentRecord as unknown as { findOne: () => never }).findOne = () => { throw new Error('mongo down'); };
  assert.doesNotThrow(() => capture.captureGenerationRequestBestEffort(job(), { sessionId: null, parentGenerationId: null, appVersion: null }));
  await flush();
});

test('parseTrainingCaptureContext keeps only well-formed identifiers', () => {
  assert.deepEqual(capture.parseTrainingCaptureContext({ sessionId: 'chat_1', parentGenerationId: '6650c0ffee0000000000aa01', appVersion: '1.2.3' }), { sessionId: 'chat_1', parentGenerationId: '6650c0ffee0000000000aa01', appVersion: '1.2.3' });
  assert.deepEqual(capture.parseTrainingCaptureContext({ sessionId: 'has space', parentGenerationId: 'not-an-object-id', appVersion: '<script>' }), { sessionId: null, parentGenerationId: null, appVersion: null });
  assert.deepEqual(capture.parseTrainingCaptureContext('junk'), { sessionId: null, parentGenerationId: null, appVersion: null });
});

test('trainingAssetsFromJobResult keeps R2 references and ignores inline data', () => {
  assert.deepEqual(capture.trainingAssetsFromJobResult({ imageUrl: 'data:image/png;base64,AAAA' }), []);
  assert.deepEqual(capture.trainingAssetsFromJobResult({ imageKey: 'users/u/generations/x.png' }, 'media'), [
    { provider: 'cloudflare-r2', bucket: 'media', key: 'users/u/generations/x.png', contentType: null, contentHash: null, bytes: null },
  ]);
});
