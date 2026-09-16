import assert from 'node:assert/strict';
import test from 'node:test';
import { ancestorsOf, descendantsOf, lineage, nextVersionNumber } from '../../src/lib/prompt-lineage.ts';

const versions = [
  { version: 1, basedOnVersion: null },
  { version: 2, basedOnVersion: 1 },
  { version: 3, basedOnVersion: 2 },
  { version: 4, basedOnVersion: 1 },
  { version: 5, basedOnVersion: 3 },
  { version: 6, basedOnVersion: 3 },
];

test('the next version number continues the sequence', () => {
  assert.equal(nextVersionNumber([]), 1);
  assert.equal(nextVersionNumber(versions), 7);
  assert.equal(nextVersionNumber([{ version: 3, basedOnVersion: 1 }]), 4);
});

test('ancestors follow basedOnVersion from oldest to newest', () => {
  assert.deepEqual(ancestorsOf(versions, 5).map((item) => item.version), [1, 2, 3]);
  assert.deepEqual(ancestorsOf(versions, 2).map((item) => item.version), [1]);
});

test('ancestors of a root are empty', () => {
  assert.deepEqual(ancestorsOf(versions, 1), []);
});

test('descendants cover every branch that reaches the version', () => {
  assert.deepEqual(descendantsOf(versions, 1).map((item) => item.version), [2, 4, 3, 5, 6]);
  assert.deepEqual(descendantsOf(versions, 3).map((item) => item.version), [5, 6]);
});

test('traversal is cycle safe', () => {
  const cyclic = [
    { version: 1, basedOnVersion: 2 },
    { version: 2, basedOnVersion: 1 },
    { version: 3, basedOnVersion: 1 },
  ];
  assert.deepEqual(ancestorsOf(cyclic, 2).map((item) => item.version), [1]);
  assert.deepEqual(descendantsOf(cyclic, 1).map((item) => item.version), [2, 3]);
});

test('a self reference is ignored by both traversals', () => {
  const selfRef = [{ version: 1, basedOnVersion: 1 }, { version: 2, basedOnVersion: 1 }];
  assert.deepEqual(ancestorsOf(selfRef, 1), []);
  assert.deepEqual(descendantsOf(selfRef, 1).map((item) => item.version), [2]);
});

test('lineage combines both directions', () => {
  const result = lineage(versions, 3);
  assert.deepEqual(result.ancestors.map((item) => item.version), [1, 2]);
  assert.deepEqual(result.descendants.map((item) => item.version), [5, 6]);
});