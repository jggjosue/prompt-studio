import assert from 'node:assert/strict';
import test from 'node:test';
import { assignDatasetSplit, stableSplitGroupKey, splitDatasetExamples, DATASET_SPLIT_VERSION } from '../../src/lib/dataset-splitting';

test('same group is always assigned to the same split', () => {
  const key = stableSplitGroupKey({ requestId: 'request-123', exampleId: 'a' });
  assert.equal(assignDatasetSplit(key), assignDatasetSplit(key));
  assert.equal(DATASET_SPLIT_VERSION, 'split-v1');
});

test('request grouping prevents related variants crossing splits', () => {
  const examples = [
    { id: 'a', requestId: 'request-1' },
    { id: 'b', requestId: 'request-1' },
    { id: 'c', requestId: 'request-2' },
  ];
  const splits = splitDatasetExamples(examples, (e) => stableSplitGroupKey({ requestId: e.requestId, exampleId: e.id }));
  const locations = (id: string) => (['train', 'validation', 'test'] as const).find((name) => splits[name].some((e) => e.id === id));
  assert.equal(locations('a'), locations('b'));
});

test('broader identity keys take precedence', () => {
  assert.equal(stableSplitGroupKey({ userGroupId: 'u1', sessionId: 's1', requestId: 'r1', exampleId: 'e1' }), 'user:u1');
  assert.equal(stableSplitGroupKey({ sessionId: 's1', requestId: 'r1', exampleId: 'e1' }), 'session:s1');
  assert.equal(stableSplitGroupKey({ requestId: 'r1', exampleId: 'e1' }), 'request:r1');
});

test('invalid ratios fail closed', () => {
  assert.throws(() => assignDatasetSplit('request:r1', { ratios: { train: 0.9, validation: 0.2, test: 0.1 } }), /INVALID_DATASET_SPLIT_RATIOS/);
});

test('assignment is independent of input order', () => {
  const keys = ['a', 'b', 'c', 'd'].map((x) => `request:${x}`);
  const forward = Object.fromEntries(keys.map((k) => [k, assignDatasetSplit(k)]));
  const reverse = Object.fromEntries([...keys].reverse().map((k) => [k, assignDatasetSplit(k)]));
  assert.deepEqual(forward, reverse);
});
