import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { FOUNDER_REWARD_TIERS, getFounderRewardTier } = await import('../../src/lib/founder-credit-tiers');

test('Founder tiers match the crowdfunding reward schedule', () => {
  assert.deepEqual(
    FOUNDER_REWARD_TIERS.map((tier) => [tier.pledgeAmountCents, tier.bonusPercent]),
    [[1000,5],[2500,7],[5000,10],[10000,12],[25000,15],[50000,17],[100000,20]],
  );
  assert.equal(getFounderRewardTier(5000)?.baseCredits, 4000);
  assert.equal(getFounderRewardTier(5000)?.totalCredits, 4400);
  assert.equal(getFounderRewardTier(100000)?.totalCredits, 96000);
  assert.equal(getFounderRewardTier(7500)?.totalCredits, 6600);
  assert.equal(getFounderRewardTier(999), null);
});

test('Founder fulfillment waits for campaign end, payment receipt and verification, independent of goal completion', () => {
  const source = fs.readFileSync('src/lib/founder-credit-fulfillment.ts', 'utf8');
  assert.match(source, /!input\.campaignEnded \|\| !input\.fundsReceived \|\| !input\.backerVerified/);
  assert.doesNotMatch(source, /campaignFunded/);
  assert.match(source, /status: 'eligible'/);
  assert.match(source, /status: 'claimed'/);
  assert.match(source, /userId: null/);
  assert.match(source, /grantFounderCredits/);
  assert.match(source, /founder:\$\{claim\._id\}/);
  assert.match(source, /FOUNDER_ALREADY_CLAIMED/);
});

test('Founder rewards preserve at least one cent of paid value per credit including bonuses', () => {
  for (const amountCents of [1000, 2500, 5000, 7500, 10000, 25000, 50000, 100000, 250000, 1000000]) {
    const reward = getFounderRewardTier(amountCents);
    assert.ok(reward);
    const contributionUsd = amountCents / 100;
    const commercialCreditValueUsd = reward.totalCredits * 0.01;
    assert.ok(
      commercialCreditValueUsd <= contributionUsd,
      `${amountCents}: Founder Credits exceed paid commercial value`,
    );
  }
});
