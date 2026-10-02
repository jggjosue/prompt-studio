import assert from 'node:assert/strict';
import test from 'node:test';
import { targetDatasetForRecord, normalizeTrainingRecord, TRAINING_PIPELINE_VERSION } from '../../src/lib/training-preprocessing';

const base = {
  entityType: 'event',
  modality: 'image',
  recordId: 'event-1',
  consent: { training: true },
  eligibility: { status: 'pending' },
  model: null,
  parameters: {},
  payload: { eventName: 'generation_completed' },
  assets: [],
  provenance: { source: 'generate', sourceId: 'job-1', parentIds: [], correlationId: null },
  occurredAt: new Date('2026-10-02T00:00:00Z'),
} as any;

test('routes modality records to the correct processed dataset', () => {
  assert.equal(targetDatasetForRecord(base), 'image-generation');
  assert.equal(targetDatasetForRecord({ ...base, modality: 'video' }), 'video-generation');
  assert.equal(targetDatasetForRecord({ ...base, modality: 'web' }), 'web-generation');
  assert.equal(targetDatasetForRecord({ ...base, entityType: 'feedback' }), 'preference');
  assert.equal(TRAINING_PIPELINE_VERSION, 'pipeline-v1');
});

test('normalizer rejects revoked or unconsented records', () => {
  assert.throws(() => normalizeTrainingRecord({ ...base, consent: { training: false } }), /NOT_ELIGIBLE/);
  assert.throws(() => normalizeTrainingRecord({ ...base, eligibility: { status: 'revoked' } }), /NOT_ELIGIBLE/);
});

test('normalizer emits references rather than asset bytes', () => {
  const normalized = normalizeTrainingRecord({
    ...base,
    assets: [{ provider: 'cloudflare-r2', bucket: 'prompt-studio-ml', key: 'assets/images/x.webp', contentType: 'image/webp', contentHash: 'abc', bytes: 10 }],
  });
  assert.equal((normalized.assets[0] as any).key, 'assets/images/x.webp');
  assert.equal('body' in (normalized.assets[0] as any), false);
});
