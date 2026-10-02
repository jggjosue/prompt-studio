import assert from 'node:assert/strict';
import test from 'node:test';
import { artifactChecksum, buildDatasetManifest } from '../../src/lib/dataset-manifest';
import { buildManifestFromSplits } from '../../src/lib/datasets/build-manifest';

test('sha256 checksum is deterministic', () => {
  assert.equal(artifactChecksum('hello'), artifactChecksum(Buffer.from('hello')));
  assert.equal(artifactChecksum('hello').length, 64);
});

test('manifest contains counts, pipeline versions and sorted lineage', () => {
  const manifest = buildDatasetManifest({
    dataset: 'prompt-enhancement',
    version: 'v000001',
    datasetSchemaVersion: 1,
    builtAt: '2026-10-02T00:00:00.000Z',
    source: { windowStart: null, windowEnd: null, query: 'processed/prompt-enhancement/' },
    counts: { train: 90, validation: 5, test: 5 },
    filters: ['quality-pass', 'consented'],
    qualityThreshold: 0.45,
    artifacts: [{ key: 'train.jsonl', bytes: 10, sha256: 'a'.repeat(64), records: 90 }],
    lineage: { parentVersions: ['v0', 'v-1'], sourcePrefixes: ['b/', 'a/'] },
  });
  assert.equal(manifest.counts.total, 100);
  assert.equal(manifest.pipeline.splitVersion, 'split-v1');
  assert.deepEqual(manifest.lineage.sourcePrefixes, ['a/', 'b/']);
});

test('manifest from splits hashes files and counts JSONL rows', () => {
  const result = buildManifestFromSplits({
    dataset: 'preference',
    version: 'v000001',
    datasetSchemaVersion: 1,
    builtAt: '2026-10-02T00:00:00.000Z',
    source: { windowStart: null, windowEnd: null, query: 'processed/preference/' },
    filters: ['quality-pass'],
    qualityThreshold: 0.35,
    lineage: { parentVersions: [], sourcePrefixes: ['processed/preference/'] },
    files: { 'train.jsonl': '{"a":1}\n{"a":2}\n', 'validation.jsonl': '', 'test.jsonl': '{"a":3}\n' },
  });
  assert.equal(result.manifest.counts.total, 3);
  const checksums = JSON.parse(result['checksums.json']);
  assert.equal(checksums['train.jsonl'], artifactChecksum('{"a":1}\n{"a":2}\n'));
  assert.equal(checksums['manifest.json'].length, 64);
});

test('invalid artifact checksum fails closed', () => {
  assert.throws(() => buildDatasetManifest({
    dataset: 'image-generation', version: 'v000001', datasetSchemaVersion: 1, builtAt: '2026-10-02T00:00:00.000Z',
    source: { windowStart: null, windowEnd: null, query: 'x' }, counts: { train: 1, validation: 0, test: 0 },
    filters: [], qualityThreshold: 0.5, artifacts: [{ key: 'train.jsonl', bytes: 1, sha256: 'bad', records: 1 }],
    lineage: { parentVersions: [], sourcePrefixes: [] },
  }), /INVALID_DATASET_ARTIFACT/);
});
