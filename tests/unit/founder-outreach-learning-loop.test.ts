import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('outreach attempts capture objections and requested outcomes', async () => {
  const model = await source('src/models/FounderOutreachAttempt.ts');
  assert.ok(model.includes('objection:'));
  assert.ok(model.includes('requestedOutcome:'));
  assert.ok(model.includes('learningNotes:'));
});

test('cohort reviews are unique at each 25-prospect checkpoint', async () => {
  const model = await source('src/models/FounderOutreachCohortReview.ts');
  assert.ok(model.includes('enum: [25, 50, 75, 100]'));
  assert.ok(model.includes("index({ cohort: 1, checkpoint: 1 }, { unique: true })"));
  for (const field of ['objectionsSummary', 'requestedOutcomesSummary', 'segmentDecision', 'messageDecision', 'nextHypothesis']) {
    assert.ok(model.includes(`${field}:`), `missing ${field}`);
  }
});
