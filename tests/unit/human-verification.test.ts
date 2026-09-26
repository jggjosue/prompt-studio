import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { humanVerificationDecision } from '../../src/lib/human-verification.ts';

test('expensive operations require a server-owned approved review state', () => {
  const pending = humanVerificationDecision({ costly: true, sensitive: false, reviewStatus: 'review', hasOpenChanges: false });
  const approved = humanVerificationDecision({ costly: true, sensitive: false, reviewStatus: 'approved', hasOpenChanges: false });
  assert.deepEqual(pending, { required: true, approved: false, reasons: ['expensive_operation'] });
  assert.equal(approved.approved, true);
});

test('open change requests invalidate approval for sensitive results', () => {
  const decision = humanVerificationDecision({ costly: false, sensitive: true, reviewStatus: 'approved', hasOpenChanges: true });
  assert.equal(decision.required, true);
  assert.equal(decision.approved, false);
  assert.deepEqual(decision.reasons, ['sensitive_result', 'open_change_requests']);
});

test('ordinary operations do not require a review', () => {
  assert.deepEqual(humanVerificationDecision({ costly: false, sensitive: false, reviewStatus: 'draft', hasOpenChanges: true }), { required: false, approved: true, reasons: ['open_change_requests'] });
});

test('generation and publication routes do not trust a client approval boolean', async () => {
  const generation = await readFile(new URL('../../src/app/api/ai/jobs/route.ts', import.meta.url), 'utf8');
  const publication = await readFile(new URL('../../src/app/api/publications/route.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(generation, /projectBudgetApproved/);
  assert.match(generation, /humanVerificationDecision/);
  assert.match(publication, /humanVerificationDecision/);
  assert.match(publication, /status: 409/);
});
