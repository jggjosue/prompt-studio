import test from 'node:test';
import assert from 'node:assert/strict';

const { calculateTrueCreditEconomics, estimatePlatformVariableCostUsd } = await import('../../src/lib/platform-cost-registry.ts');

test('platform variable costs are attributed from metered units', () => {
  const cost = estimatePlatformVariableCostUsd({
    'r2-class-a': 1000,
    'r2-class-b': 5000,
    'resend-email-overage': 100,
    'upstash-redis-command': 1000,
  });
  assert.ok(cost > 0);
  assert.ok(cost < 0.01);
});

test('true cost per credit amortizes shared platform and AI COGS', () => {
  const economics = calculateTrueCreditEconomics({
    creditsConsumed: 100_000,
    aiProviderCostUsd: 150,
    platformVariableCostUsd: 10,
    platformSharedMonthlyCostUsd: 60,
    paymentFeesUsd: 50,
    grossCreditRevenueUsd: 1000,
  });
  assert.equal(economics.totalCogsUsd, 270);
  assert.equal(economics.trueCostPerCreditUsd, 0.0027);
  assert.equal(economics.contributionMarginPercent, 73);
});

test('commercial credit value remains separate from measured COGS', () => {
  const economics = calculateTrueCreditEconomics({ creditsConsumed: 1000, aiProviderCostUsd: 1 });
  assert.equal(economics.grossRevenueUsd, 10);
  assert.equal(economics.trueCostPerCreditUsd, 0.001);
});
