import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const {
  PROMPT_CREDIT_RETAIL_USD,
  PROMPT_CREDITS_PER_USD,
  MIN_EFFECTIVE_CREDIT_PRICE_USD,
  SUBSCRIPTION_CATALOG,
  FOUNDER_BASE_CREDITS_PER_USD,
  FOUNDER_REWARD_CATALOG,
  ACTIVE_CREDIT_PACK_CATALOG,
} = await import('../../src/lib/commercial-pricing.ts');

test('one Prompt Credit has one nominal retail value across the platform', () => {
  assert.equal(PROMPT_CREDIT_RETAIL_USD, 0.01);
  assert.equal(PROMPT_CREDITS_PER_USD, 100);
  assert.ok(Math.abs(MIN_EFFECTIVE_CREDIT_PRICE_USD - (1 / 120)) < 1e-12);
});

test('subscription credits derive from the universal $0.01 nominal value', () => {
  assert.deepEqual(SUBSCRIPTION_CATALOG, {
    premium: { monthlyPriceUsd: 9, annualPriceUsd: 90, monthlyCredits: 900 },
    creator: { monthlyPriceUsd: 19, annualPriceUsd: 190, monthlyCredits: 1900 },
    pro: { monthlyPriceUsd: 29, annualPriceUsd: 290, monthlyCredits: 2900 },
    studio: { monthlyPriceUsd: 39, annualPriceUsd: 390, monthlyCredits: 3900 },
  });
});

test('Founder uses the same base conversion and only discounts through explicit bonus', () => {
  assert.equal(FOUNDER_BASE_CREDITS_PER_USD, 100);
  assert.deepEqual(
    FOUNDER_REWARD_CATALOG.map(tier => [tier.pledgeAmountCents, tier.bonusPercent]),
    [[1000, 5], [2500, 7], [5000, 10], [10000, 12], [25000, 15], [50000, 17], [100000, 20]],
  );
});

test('active top-ups remain exactly $0.01 per credit', () => {
  assert.deepEqual(
    ACTIVE_CREDIT_PACK_CATALOG.map(pack => [pack.priceCents, pack.credits, pack.bonusCredits]),
    [[500, 500, 0], [1000, 1000, 0], [2500, 2500, 0], [5000, 5000, 0], [10000, 10000, 0]],
  );
  for (const pack of ACTIVE_CREDIT_PACK_CATALOG) {
    assert.equal((pack.priceCents / 100) / pack.credits, PROMPT_CREDIT_RETAIL_USD);
  }
});

test('public commercial surfaces consume shared pricing modules instead of owning numeric catalogs', () => {
  const prices = fs.readFileSync('src/app/[locale]/prices/prices-client.tsx', 'utf8');
  const crowdfunding = fs.readFileSync('src/app/[locale]/crowdfunding/page.tsx', 'utf8');
  const calculator = fs.readFileSync('src/components/CrowdfundingCreditCalculator.tsx', 'utf8');
  const dashboardApi = fs.readFileSync('src/app/api/credits/route.ts', 'utf8');
  const stripe = fs.readFileSync('src/lib/stripe-checkout.ts', 'utf8');
  const aiPricing = fs.readFileSync('src/lib/ai-credit-config.ts', 'utf8');

  assert.match(prices, /subscription-plans/);
  assert.match(crowdfunding, /founder-credit-tiers/);
  assert.match(calculator, /commercial-pricing/);
  assert.match(dashboardApi, /credit-packs/);
  assert.match(stripe, /commercial-pricing/);
  assert.match(aiPricing, /MAX_PROVIDER_COST_PER_CREDIT_USD/);
});
