import assert from 'node:assert/strict';
import test from 'node:test';
import { DATASET_RELEASE_JOB_VERSION } from '../../src/lib/datasets/publish-release';
import { datasetReleaseKey } from '../../src/lib/dataset-object-contract';

test('release job contract is versioned', () => {
  assert.equal(DATASET_RELEASE_JOB_VERSION, 'release-v1');
});

test('release keys are immutable version-scoped paths', () => {
  assert.equal(datasetReleaseKey('prompt-enhancement', 'v000001', 'train.jsonl'), 'datasets/prompt-enhancement/v000001/train.jsonl');
  assert.equal(datasetReleaseKey('preference', 'v000002', 'manifest.json'), 'datasets/preference/v000002/manifest.json');
});

test('invalid release version fails before publication', () => {
  assert.throws(() => datasetReleaseKey('image-generation', 'latest', 'train.jsonl'), /INVALID_DATASET_RELEASE_KEY/);
});
