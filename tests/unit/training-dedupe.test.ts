import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalTrainingJson, trainingContentHash, trainingDedupeKey, TRAINING_CANONICALIZATION_VERSION } from '../../src/lib/training-dedupe';

test('canonical JSON ignores object key insertion order', () => {
  const a = { z: 1, nested: { b: 2, a: 1 }, a: ['x', 'y'] };
  const b = { a: ['x', 'y'], nested: { a: 1, b: 2 }, z: 1 };
  assert.equal(canonicalTrainingJson(a), canonicalTrainingJson(b));
  assert.equal(trainingContentHash(a), trainingContentHash(b));
});

test('canonicalization preserves array order because it is semantically meaningful', () => {
  assert.notEqual(trainingContentHash({ a: [1, 2] }), trainingContentHash({ a: [2, 1] }));
});

test('dedupe key is versioned and dataset-scoped', () => {
  const hash = trainingContentHash({ text: '[REDACTED_EMAIL]' });
  assert.equal(trainingDedupeKey('prompt-enhancement', hash), `dedupe:${TRAINING_CANONICALIZATION_VERSION}:prompt-enhancement:${hash}`);
  assert.notEqual(trainingDedupeKey('prompt-enhancement', hash), trainingDedupeKey('preference', hash));
});

test('non-finite numbers fail closed', () => {
  assert.throws(() => canonicalTrainingJson({ score: Number.NaN }), /NON_FINITE_CANONICAL_NUMBER/);
});

test('canonical-v1 sorts keys by code unit, independent of locale', async () => {
  const { canonicalTrainingJson } = await import('../../src/lib/training-dedupe');
  assert.equal(canonicalTrainingJson({ b: 1, B: 2, a: { z: 1, Z: 2 } }), '{"B":2,"a":{"Z":2,"z":1},"b":1}');
});

test('example ids hash training content only: volatile ids and timestamps do not change them', async () => {
  const { buildGenerationDatasetExample } = await import('../../src/lib/datasets/generation');
  const base = {
    modality: 'image' as const, payload: { prompt: 'a red bicycle' }, model: { provider: 'google', model: 'm', version: null },
    parameters: { aspectRatio: '1:1' }, quality: { version: 'q', score: 1, threshold: 0.5, passes: true },
    assets: [{ provider: 'cloudflare-r2' as const, bucket: 'b', key: 'assets/images/x.png', contentType: 'image/png', contentHash: 'c'.repeat(64), bytes: 1 }],
  };
  const a = buildGenerationDatasetExample({ ...base, recordId: 'out:1', requestId: '1', outputId: '1', occurredAt: '2026-10-01T00:00:00.000Z' })!;
  const b = buildGenerationDatasetExample({ ...base, recordId: 'out:2', requestId: '2', outputId: '2', occurredAt: '2026-10-03T09:30:00.000Z' })!;
  assert.equal(a.exampleId, b.exampleId);
  const c = buildGenerationDatasetExample({ ...base, payload: { prompt: 'a blue bicycle' }, recordId: 'out:1', requestId: '1', outputId: '1', occurredAt: '2026-10-01T00:00:00.000Z' })!;
  assert.notEqual(a.exampleId, c.exampleId);
});
