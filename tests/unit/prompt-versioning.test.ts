import assert from 'node:assert/strict';
import test from 'node:test';
import { changedLines, isPromptVersionAction, sanitizeModelSnapshot } from '../../src/lib/prompt-versioning.ts';

test('only known version actions are accepted', () => {
  assert.equal(isPromptVersionAction('saved'), true);
  assert.equal(isPromptVersionAction('restored'), true);
  assert.equal(isPromptVersionAction('delete-history'), false);
});

test('model snapshots are normalized, deduplicated and bounded', () => {
  assert.deepEqual(sanitizeModelSnapshot([' gemini:2 ', 'gemini:2', '', 4]), ['gemini:2']);
  assert.equal(sanitizeModelSnapshot(Array.from({ length: 20 }, (_, index) => `model-${index}`)).length, 12);
});

test('line comparison preserves before and after values', () => {
  assert.deepEqual(changedLines('one\ntwo', 'one\nthree\nfour'), [
    { line: 2, before: 'two', after: 'three' },
    { line: 3, before: '', after: 'four' },
  ]);
});
