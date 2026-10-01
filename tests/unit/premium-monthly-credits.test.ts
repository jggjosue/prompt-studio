import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { getPlanCredits, normalizeExistingPlan } = await import('../../src/lib/subscription-plans');

test('$9 Premium/Creator grants 1,000 MONTHLY Prompt Credits per paid cycle', () => {
  assert.equal(normalizeExistingPlan('premium'), 'creator');
  assert.equal(getPlanCredits('creator'), 1000);
});

test('Stripe invoice.paid uses invoice id as the idempotent monthly grant key', () => {
  const webhook = fs.readFileSync('src/app/api/webhooks/stripe/route.ts', 'utf8');
  const wallet = fs.readFileSync('src/lib/ai-job-service.ts', 'utf8');

  assert.match(webhook, /case 'invoice\.paid'/);
  assert.match(webhook, /grantSubscriptionCredits\(clerkUserId, getPlanCredits\(plan\), invoice\.id/);
  assert.match(wallet, /requestId: `subscription:\$\{userId\}:\$\{periodKey\}`/);
  assert.match(wallet, /AICreditLedger\.exists\(\{ requestId: input\.requestId \}\)/);
});
