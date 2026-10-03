import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { SUBSCRIPTION_CATALOG, FOUNDER_BASE_CREDITS_PER_USD, FOUNDER_REWARD_CATALOG, ACTIVE_CREDIT_PACK_CATALOG } =
  await import('../../src/lib/commercial-pricing.ts');

test('commercial pricing catalog owns the published subscription ladder', () => {
  assert.deepEqual(SUBSCRIPTION_CATALOG, {
    premium: { monthlyPriceUsd: 9, annualPriceUsd: 90, monthlyCredits: 500 },
    creator: { monthlyPriceUsd: 19, annualPriceUsd: 190, monthlyCredits: 1000 },
    pro: { monthlyPriceUsd: 29, annualPriceUsd: 290, monthlyCredits: 1500 },
    studio: { monthlyPriceUsd: 39, annualPriceUsd: 390, monthlyCredits: 3000 },
  });
});

test('commercial pricing catalog owns Founder conversion and presets', () => {
  assert.equal(FOUNDER_BASE_CREDITS_PER_USD, 80);
  assert.deepEqual(
    FOUNDER_REWARD_CATALOG.map(tier => [tier.pledgeAmountCents, tier.bonusPercent]),
    [[1000, 5], [2500, 7], [5000, 10], [10000, 12], [25000, 15], [50000, 17], [100000, 20]],
  );
});

test('commercial pricing catalog owns active top-ups', () => {
  assert.deepEqual(
    ACTIVE_CREDIT_PACK_CATALOG.map(pack => [pack.priceCents, pack.credits, pack.bonusCredits]),
    [[500, 500, 0], [1000, 1000, 0], [2500, 2500, 0], [5000, 5000, 0], [10000, 10000, 0]],
  );
});

test('public commercial surfaces consume shared pricing modules instead of owning numeric catalogs', () => {
  const prices = fs.readFileSync('src/app/[locale]/prices/prices-client.tsx', 'utf8');
  const crowdfunding = fs.readFileSync('src/app/[locale]/crowdfunding/page.tsx', 'utf8');
  const calculator = fs.readFileSync('src/components/CrowdfundingCreditCalculator.tsx', 'utf8');
  const dashboardApi = fs.readFileSync('src/app/api/credits/route.ts', 'utf8');
  const stripe = fs.readFileSync('src/lib/stripe-checkout.ts', 'utf8');

  assert.match(prices, /subscription-plans/);
  assert.match(crowdfunding, /founder-credit-tiers/);
  assert.match(calculator, /commercial-pricing/);
  assert.match(dashboardApi, /credit-packs/);
  assert.match(stripe, /commercial-pricing/);
});
