import assert from 'node:assert/strict';
import test from 'node:test';
import { excludeRevokedExamples } from '../../src/lib/training-revocation';

test('excludes example whose direct source record is revoked', () => {
  const rows = [{ exampleId: 'a', provenance: { sourceRecordId: 'r1' } }, { exampleId: 'b', provenance: { sourceRecordId: 'r2' } }];
  assert.deepEqual(excludeRevokedExamples(rows, ['r1']).map((x) => x.exampleId), ['b']);
});

test('excludes preference example when any lineage source is revoked', () => {
  const rows = [{ exampleId: 'a', provenance: { sourceRecordIds: ['r1','r2'] } }];
  assert.equal(excludeRevokedExamples(rows, ['r2']).length, 0);
});

test('keeps unrelated examples', () => {
  const rows = [{ exampleId: 'a', provenance: { sourceRecordIds: ['r1'] } }];
  assert.equal(excludeRevokedExamples(rows, ['other']).length, 1);
});
