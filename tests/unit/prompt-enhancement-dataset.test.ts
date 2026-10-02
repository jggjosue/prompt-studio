import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPromptEnhancementExample, serializePromptEnhancementJsonl } from '../../src/lib/datasets/prompt-enhancement';

const base = {
  recordId: 'record-1',
  requestId: 'request-1',
  outputId: 'output-1',
  modality: 'image' as const,
  occurredAt: '2026-10-02T00:00:00.000Z',
  payload: { originalIntent: 'cat', improvedPrompt: 'cinematic portrait of a cat' },
  quality: { version: 'quality-v1', score: 0.8, threshold: 0.45, passes: true },
};

test('builds a versioned prompt enhancement example', () => {
  const example = buildPromptEnhancementExample(base);
  assert.ok(example);
  assert.equal(example?.schemaVersion, 1);
  assert.equal(example?.originalIntent, 'cat');
  assert.equal(example?.improvedPrompt, 'cinematic portrait of a cat');
  assert.equal(example?.quality.score, 0.8);
});

test('filters examples below quality threshold', () => {
  assert.equal(buildPromptEnhancementExample({ ...base, quality: { ...base.quality, passes: false } }), null);
});

test('filters missing or unchanged prompt pairs', () => {
  assert.equal(buildPromptEnhancementExample({ ...base, payload: { originalIntent: 'same', improvedPrompt: 'same' } }), null);
  assert.equal(buildPromptEnhancementExample({ ...base, payload: { originalIntent: 'only original' } }), null);
});

test('example ID and JSONL are deterministic', () => {
  const a = buildPromptEnhancementExample(base)!;
  const b = buildPromptEnhancementExample({ ...base, recordId: 'record-2' })!;
  assert.equal(a.exampleId, b.exampleId);
  const jsonl = serializePromptEnhancementJsonl([a]);
  assert.equal(jsonl.endsWith('\n'), true);
  assert.equal(JSON.parse(jsonl).schemaVersion, 1);
});
