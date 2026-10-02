import assert from 'node:assert/strict';
import test from 'node:test';
import { artifactChecksum } from '../../src/lib/dataset-manifest';
import { validateDatasetRelease } from '../../src/lib/dataset-validation';

function fixture(rows: { train: any[]; validation: any[]; test: any[] }) {
  const jsonl = (v: any[]) => v.map((x) => JSON.stringify(x)).join('\n') + (v.length ? '\n' : '');
  const files: any = { 'train.jsonl': jsonl(rows.train), 'validation.jsonl': jsonl(rows.validation), 'test.jsonl': jsonl(rows.test) };
  files['manifest.json'] = JSON.stringify({ counts: { train: rows.train.length, validation: rows.validation.length, test: rows.test.length, total: rows.train.length + rows.validation.length + rows.test.length } }) + '\n';
  files['checksums.json'] = JSON.stringify({
    'train.jsonl': artifactChecksum(files['train.jsonl']),
    'validation.jsonl': artifactChecksum(files['validation.jsonl']),
    'test.jsonl': artifactChecksum(files['test.jsonl']),
    'manifest.json': artifactChecksum(files['manifest.json']),
  }) + '\n';
  return files;
}
const row = (id: string, requestId: string) => ({ schemaVersion: 1, exampleId: id, provenance: { requestId } });

test('valid release passes', () => {
  const result = validateDatasetRelease({ files: fixture({ train: [row('a','r1')], validation: [row('b','r2')], test: [row('c','r3')] }) });
  assert.equal(result.valid, true);
});

test('blocks request-group leakage across splits', () => {
  const result = validateDatasetRelease({ files: fixture({ train: [row('a','shared')], validation: [row('b','shared')], test: [] }) });
  assert.equal(result.valid, false);
  assert.ok(result.issues.some((x) => x.code === 'SPLIT_LEAKAGE'));
});

test('blocks duplicate examples', () => {
  const result = validateDatasetRelease({ files: fixture({ train: [row('same','r1')], validation: [], test: [row('same','r2')] }) });
  assert.ok(result.issues.some((x) => x.code === 'DUPLICATE_RATE_EXCEEDED'));
});

test('blocks checksum tampering and manifest count mismatch', () => {
  const files = fixture({ train: [row('a','r1')], validation: [], test: [] });
  files['train.jsonl'] += JSON.stringify(row('b','r2')) + '\n';
  const result = validateDatasetRelease({ files });
  assert.ok(result.issues.some((x) => x.code === 'CHECKSUM_MISMATCH'));
  assert.ok(result.issues.some((x) => x.code === 'MANIFEST_COUNT_MISMATCH'));
});

test('blocks embedded or non-R2 output assets', () => {
  const bad = { ...row('a','r1'), outputs: [{ provider: 'cloudflare-r2', bucket: 'b', key: 'k', body: 'binary' }] };
  const result = validateDatasetRelease({ files: fixture({ train: [bad], validation: [], test: [] }) });
  assert.ok(result.issues.some((x) => x.code === 'INVALID_ASSET_REFERENCE'));
});

test('blocks corrupt JSONL', () => {
  const files = fixture({ train: [], validation: [], test: [] });
  files['train.jsonl'] = '{bad json}\n';
  const result = validateDatasetRelease({ files });
  assert.ok(result.issues.some((x) => x.code === 'INVALID_JSONL'));
});
