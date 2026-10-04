import assert from 'node:assert/strict';
import test from 'node:test';
import TrainingDataRecord from '../../src/models/TrainingDataRecord';

function validRecord() {
  return {
    entityType: 'request',
    recordId: 'req_1',
    userId: 'user_1',
    sessionId: 'session_1',
    requestId: 'req_1',
    modality: 'image',
    model: { provider: 'google', model: 'example-model', version: '1' },
    parameters: { aspectRatio: '16:9' },
    consent: { training: true, version: '2026-10', capturedAt: new Date(), source: 'generate' },
    eligibility: { status: 'eligible', reasonCodes: [], evaluatedAt: new Date(), evaluatorVersion: 'v1' },
    provenance: { source: 'generate', sourceId: 'job_1', parentIds: [], correlationId: 'corr_1' },
    assets: [{ provider: 'cloudflare-r2', bucket: 'prompt-studio-ml', key: 'assets/images/1.webp', contentType: 'image/webp', contentHash: 'sha256:abc', bytes: 42 }],
    payload: { prompt: 'example' },
    occurredAt: new Date(),
  };
}

test('accepts a versioned eligible training record with explicit consent', async () => {
  const doc = new TrainingDataRecord(validRecord());
  await doc.validate();
  assert.equal(doc.schemaVersion, 2);
  assert.equal(doc.eligibility.status, 'eligible');
});

test('rejects eligible records without training consent', async () => {
  const input = validRecord();
  input.consent.training = false;
  const doc = new TrainingDataRecord(input);
  await assert.rejects(() => doc.validate(), /explicit training consent/);
});

test('requires a bucket for Cloudflare R2 references', async () => {
  const input = validRecord();
  input.assets[0].bucket = null as unknown as string;
  const doc = new TrainingDataRecord(input);
  await assert.rejects(() => doc.validate(), /require a bucket/);
});

test('schemaVersion 1 documents with legacy modalities and no v2 fields stay valid', async () => {
  const input = { ...validRecord(), schemaVersion: 1, modality: 'project', eligibility: { status: 'pending', reasonCodes: [], evaluatedAt: null, evaluatorVersion: null } };
  const doc = new TrainingDataRecord(input);
  await doc.validate();
  assert.equal(doc.schemaVersion, 1);
  assert.equal(doc.pipeline, null);
  assert.equal(doc.eventName, null);
});

test('accepts reserved modalities and v2 envelope fields', async () => {
  const doc = new TrainingDataRecord({
    ...validRecord(),
    modality: 'audio',
    eventName: 'output_downloaded',
    clientEventId: 'b4b9f3f2-6d7e-4f5c-9a51-0d1b2c3d4e5f',
    generationId: 'job_1',
    receivedAt: new Date(),
    appVersion: '1.2.3',
    relations: { parentGenerationId: 'job_0', familyId: 'job_0' },
    pipeline: { status: 'captured', enqueuedAt: null, attempts: 0, leaseToken: null, leaseExpiresAt: null, processedAt: null, lastCode: null, processedKeys: [] },
  });
  await doc.validate();
  assert.equal(doc.pipeline?.status, 'captured');
});

test('rejects unknown event names and pipeline statuses', async () => {
  await assert.rejects(() => new TrainingDataRecord({ ...validRecord(), eventName: 'keystroke' }).validate());
  await assert.rejects(() => new TrainingDataRecord({
    ...validRecord(),
    pipeline: { status: 'done', attempts: 0, processedKeys: [] },
  }).validate());
});
