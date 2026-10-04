import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DATASET_RELEASE_FILES,
  assetKey,
  datasetReleaseKey,
  datasetVersion,
  datasetVersionNumber,
  processedKey,
  rawEvidenceKey,
  recordIdKeySegment,
  rejectedKey,
} from '../../src/lib/dataset-object-contract';

const hash = 'a'.repeat(64);
const date = new Date('2026-10-01T12:00:00Z');

test('dataset versions are zero-padded, immutable identifiers; latest is never valid', () => {
  assert.equal(datasetVersion(1), 'v000001');
  assert.equal(datasetVersionNumber('v000042'), 42);
  assert.throws(() => datasetVersion(0), /DATASET_VERSION_OUT_OF_RANGE/);
  assert.throws(() => datasetReleaseKey('image-generation', 'latest', 'train.jsonl'), /INVALID_DATASET_RELEASE_KEY/);
});

test('release keys cover the required artifacts, with _SUCCESS last', () => {
  assert.equal(datasetReleaseKey('prompt-enhancement', 'v000001', 'train.jsonl'), 'datasets/prompt-enhancement/v000001/train.jsonl');
  assert.equal(datasetReleaseKey('prompt-enhancement', 'v000001', '_SUCCESS'), 'datasets/prompt-enhancement/v000001/_SUCCESS');
  assert.equal(DATASET_RELEASE_FILES.at(-1), '_SUCCESS');
  assert.throws(() => datasetReleaseKey('preference', 'v000001', '../latest.json'), /INVALID_DATASET_RELEASE_FILE/);
});

test('raw evidence is dated, typed and content-addressed', () => {
  assert.equal(rawEvidenceKey({ date, kind: 'generations', recordId: 'out:665', evidenceHash: hash }), `raw/2026/10/01/generations/out-665/${hash}.json`);
  assert.equal(rawEvidenceKey({ date, kind: 'feedback', recordId: 'fb:1', evidenceHash: hash }).split('/')[4], 'feedback');
  assert.throws(() => rawEvidenceKey({ date, kind: 'generations', recordId: 'a b', evidenceHash: hash }), /INVALID_RECORD_ID/);
});

test('assets use flat content-addressed keys per kind, including web artifacts', () => {
  assert.equal(assetKey({ kind: 'images', contentHash: hash, extension: '.webp' }), `assets/images/${hash}.webp`);
  assert.equal(assetKey({ kind: 'web', contentHash: hash, extension: 'html' }), `assets/web/${hash}.html`);
  assert.throws(() => assetKey({ kind: 'images', contentHash: 'abc', extension: 'png' }), /INVALID_ASSET_HASH/);
  assert.throws(() => assetKey({ kind: 'binaries' as never, contentHash: hash, extension: 'exe' }), /INVALID_ASSET_KIND/);
});

test('processed and rejected keys', () => {
  assert.equal(processedKey({ dataset: 'preference', pipelineVersion: 'pipeline-v2', exampleKey: 'abc123' }), 'processed/preference/pipeline-v2/abc123.json');
  assert.equal(rejectedKey({ date, type: 'sanitization', recordId: 'out:1' }), 'rejected/2026/10/01/sanitization/out-1.json');
  assert.throws(() => rejectedKey({ date, type: 'other' as never, recordId: 'out:1' }), /INVALID_REJECTION_TYPE/);
  assert.equal(recordIdKeySegment('evt:c:abc'), 'evt-c-abc');
});
