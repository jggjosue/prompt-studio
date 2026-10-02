import assert from 'node:assert/strict';
import test from 'node:test';
import {
  assetKey,
  datasetReleaseKey,
  datasetVersion,
  processedKey,
  rawGenerationKey,
  sha256,
} from '../../src/lib/dataset-object-contract';

test('dataset versions are deterministic and zero padded', () => {
  assert.equal(datasetVersion(1), 'v000001');
  assert.equal(datasetVersion(42), 'v000042');
  assert.throws(() => datasetVersion(0), /DATASET_VERSION_OUT_OF_RANGE/);
});

test('release keys are constrained to immutable release files', () => {
  assert.equal(
    datasetReleaseKey('prompt-enhancement', 'v000001', 'train.jsonl'),
    'datasets/prompt-enhancement/v000001/train.jsonl',
  );
  assert.throws(() => datasetReleaseKey('preference', 'v000001', '../latest.json'), /INVALID_DATASET_RELEASE_FILE/);
});

test('raw and processed keys are deterministic', () => {
  const hash = sha256('example');
  assert.equal(
    rawGenerationKey({ date: new Date('2026-10-01T12:00:00Z'), recordId: 'event-1', contentHash: hash }),
    `raw/2026/10/01/generations/${hash.slice(0, 2)}/event-1.json`,
  );
  assert.equal(processedKey({ dataset: 'preference', pipelineVersion: 'pipeline-v1', recordId: 'record-1' }), 'processed/preference/pipeline-v1/record-1.json');
});

test('assets are content-addressed and never embed binary data in the key', () => {
  const hash = sha256('binary bytes');
  assert.equal(assetKey({ kind: 'images', contentHash: hash, extension: '.webp' }), `assets/images/sha256/${hash.slice(0, 2)}/${hash}.webp`);
});
