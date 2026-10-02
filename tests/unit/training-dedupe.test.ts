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
