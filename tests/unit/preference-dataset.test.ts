import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPreferenceExample, serializePreferenceJsonl } from '../../src/lib/datasets/preference';

const base = {
  requestId: 'request-1',
  context: 'Create a cinematic cat portrait',
  chosen: { outputId: 'out-2', contentRef: 'assets/images/sha256/bb/chosen.webp', modelId: 'model-a' },
  rejected: { outputId: 'out-1', contentRef: 'assets/images/sha256/aa/rejected.webp', modelId: 'model-a' },
  signalType: 'selected_after_regenerate' as const,
  eventIds: ['event-2', 'event-1'],
  sourceRecordIds: ['record-1'],
  occurredAt: '2026-10-02T00:00:00.000Z',
};

test('builds preference pair only with supported evidence', () => {
  const example = buildPreferenceExample(base);
  assert.ok(example);
  assert.equal(example?.schemaVersion, 1);
  assert.equal(example?.chosen.outputId, 'out-2');
  assert.equal(example?.rejected.outputId, 'out-1');
  assert.deepEqual(example?.signal.eventIds, ['event-1', 'event-2']);
});

test('rejects same chosen and rejected output', () => {
  assert.equal(buildPreferenceExample({ ...base, rejected: { ...base.rejected, outputId: 'out-2' } }), null);
});

test('rejects pair without event evidence', () => {
  assert.equal(buildPreferenceExample({ ...base, eventIds: [] }), null);
});

test('does not accept impression/view as a preference signal', () => {
  assert.equal(buildPreferenceExample({ ...base, signalType: 'output_viewed' as any }), null);
});

test('example ID and JSONL are deterministic', () => {
  const a = buildPreferenceExample(base)!;
  const b = buildPreferenceExample({ ...base, eventIds: ['event-1', 'event-2'] })!;
  assert.equal(a.exampleId, b.exampleId);
  assert.equal(JSON.parse(serializePreferenceJsonl([a])).signal.type, 'selected_after_regenerate');
});
