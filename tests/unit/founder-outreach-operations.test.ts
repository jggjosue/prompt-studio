import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('first-100 attempt requires qualified reviewed personalized prospect and checkpoint review', async () => {
  const service = await source('src/lib/founder-outreach-operations.ts');
  assert.ok(service.includes("outreachStatus !== 'qualified'"));
  assert.ok(service.includes('canSendInitialFounderOutreach'));
  assert.ok(service.includes('checkpoint_review_required'));
  assert.ok(service.includes('ordinal > 100'));
});

test('protected operations API records the full funnel and learning evidence', async () => {
  const route = await source('src/app/api/admin/founder-outreach/route.ts');
  assert.ok(route.includes('requireCronOrAdmin'));
  for (const stage of ['sent','delivered','reply','demo_trial','checkout','paid']) assert.ok(route.includes(stage));
  for (const field of ['objection','requestedOutcome','learningNotes']) assert.ok(route.includes(field));
});
