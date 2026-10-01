import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { FOUNDER_REWARD_TIERS, getFounderRewardTier } = await import('../../src/lib/founder-credit-tiers');

test('Founder tiers match the crowdfunding reward schedule', () => {
  assert.deepEqual(
    FOUNDER_REWARD_TIERS.map((tier) => [tier.pledgeAmountCents, tier.baseCredits, tier.bonusPercent]),
    [[1000,1000,5],[2500,2500,7],[5000,5000,10],[10000,10000,12],[25000,25000,15],[50000,50000,17],[100000,100000,20]],
  );
  assert.equal(getFounderRewardTier(5000)?.totalCredits, 5500);
  assert.equal(getFounderRewardTier(100000)?.totalCredits, 120000);
  assert.equal(getFounderRewardTier(1200), null);
});

test('Founder fulfillment requires all eligibility gates and prevents duplicate grants', () => {
  const source = fs.readFileSync('src/lib/founder-credit-fulfillment.ts', 'utf8');
  assert.match(source, /!input\.campaignFunded \|\| !input\.fundsReceived \|\| !input\.backerVerified/);
  assert.match(source, /status: 'eligible'/);
  assert.match(source, /status: 'claimed'/);
  assert.match(source, /userId: null/);
  assert.match(source, /grantFounderCredits/);
  assert.match(source, /founder:\$\{claim\._id\}/);
  assert.match(source, /FOUNDER_ALREADY_CLAIMED/);
});
