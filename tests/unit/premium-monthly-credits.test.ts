import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { getPlanCredits, normalizeExistingPlan } = await import('../../src/lib/subscription-plans');

test('Premium and Creator are distinct tiers with sustainable cycle credits', () => {
  assert.equal(normalizeExistingPlan('premium'), 'premium');
  assert.equal(getPlanCredits('premium', 'monthly'), 500);
  assert.equal(getPlanCredits('premium', 'annual'), 6000);
  assert.equal(getPlanCredits('creator', 'monthly'), 1000);
  assert.equal(getPlanCredits('creator', 'annual'), 12000);
});

test('Stripe invoice.paid keeps plan credits pending until crowdfunding credits are activated', () => {
  const webhook = fs.readFileSync('src/app/api/webhooks/stripe/route.ts', 'utf8');
  const pending = fs.readFileSync('src/lib/pending-subscription-credits.ts', 'utf8');

  assert.match(webhook, /case 'invoice\.paid'/);
  assert.match(webhook, /resolveSubscriptionPlan/);
  assert.match(webhook, /getPlanCredits\(plan, billingCycle\)/);
  assert.match(webhook, /areCrowdfundingCreditsActive\(\)/);
  assert.match(webhook, /recordPendingSubscriptionCredits/);
  assert.match(pending, /CROWDFUNDING_CREDITS_ACTIVE === '1'/);
  assert.match(pending, /pending-subscription:/);
});
