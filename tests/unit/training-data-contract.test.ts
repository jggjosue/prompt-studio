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
  assert.equal(doc.schemaVersion, 1);
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
