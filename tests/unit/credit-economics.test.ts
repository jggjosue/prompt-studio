import test from 'node:test';
import assert from 'node:assert/strict';

const {
  PROMPT_CREDIT_FLOOR_VALUE_USD,
  TARGET_CONTRIBUTION_MARGIN_PERCENT,
  MAX_PROVIDER_COST_PER_CREDIT_USD,
  validateCreditSaleEconomics,
} = await import('../../src/lib/credit-economics');

const { PLAN_PRICES, getPlanCredits } = await import('../../src/lib/subscription-plans');
const { CREDIT_PACKS } = await import('../../src/lib/credit-packs');
const { FOUNDER_REWARD_TIERS, getFounderRewardTier } = await import('../../src/lib/founder-credit-tiers');

test('Prompt Credit unit economics reserve provider, operations and payment costs', () => {
  assert.equal(PROMPT_CREDIT_FLOOR_VALUE_USD, 0.01);
  assert.equal(MAX_PROVIDER_COST_PER_CREDIT_USD, 0.0025);
  assert.equal(TARGET_CONTRIBUTION_MARGIN_PERCENT, 50);
});

test('all subscription plan credit allocations meet the minimum contribution margin', () => {
  for (const plan of ['premium','creator','pro','studio'] as const) {
    for (const cycle of ['monthly','annual'] as const) {
      const priceUsd = PLAN_PRICES[plan][cycle];
      const credits = getPlanCredits(plan, cycle);
      const result = validateCreditSaleEconomics({ priceCents: priceUsd * 100, credits });
      assert.equal(result.eligible, true, `${plan} ${cycle} is not profitable`);
      assert.ok(result.contributionMarginPercent >= TARGET_CONTRIBUTION_MARGIN_PERCENT);
    }
  }
});

test('all active one-time top-up packs meet the minimum contribution margin', () => {
  for (const pack of CREDIT_PACKS) {
    const result = validateCreditSaleEconomics({ priceCents: pack.priceCents, credits: pack.credits });
    assert.equal(result.eligible, true, `${pack.id} is not profitable`);
    assert.ok(result.contributionMarginPercent >= TARGET_CONTRIBUTION_MARGIN_PERCENT);
  }
});

test('all Founder tiers preserve the same credit economics including bonuses', () => {
  for (const tier of FOUNDER_REWARD_TIERS) {
    const reward = getFounderRewardTier(tier.pledgeAmountCents);
    assert.ok(reward, `missing reward for ${tier.pledgeAmountCents}`);
    const result = validateCreditSaleEconomics({
      priceCents: tier.pledgeAmountCents,
      credits: reward.totalCredits,
    });
    assert.equal(result.eligible, true, `Founder tier ${tier.pledgeAmountCents} is not profitable`);
    assert.ok(result.contributionMarginPercent >= TARGET_CONTRIBUTION_MARGIN_PERCENT);
  }
});

test('economics reject selling too many credits for the amount paid', () => {
  const result = validateCreditSaleEconomics({ priceCents: 500, credits: 600 });
  assert.equal(result.eligible, false);
});
