import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('crowdfunding backers have a permanent sequential identity and aggregate totals', () => {
  const model = fs.readFileSync('src/models/CrowdfundingBacker.ts', 'utf8');
  assert.match(model, /backerNumber: number/);
  assert.match(model, /totalContributedCents/);
  assert.match(model, /totalBaseCredits/);
  assert.match(model, /totalBonusCredits/);
  assert.match(model, /totalCredits/);
  assert.match(model, /contributionCount/);
  assert.match(model, /campaignId: 1, backerNumber: 1.*unique: true/s);
  assert.match(model, /founderClaimId/);
});

test('each contribution links back to the ordered backer', () => {
  const model = fs.readFileSync('src/models/CrowdfundingContribution.ts', 'utf8');
  assert.match(model, /backerId: mongoose\.Types\.ObjectId/);
  assert.match(model, /backerNumber: number/);
  assert.match(model, /campaignId: string/);
  assert.match(model, /amountPaidCents/);
  assert.match(model, /baseCredits/);
  assert.match(model, /bonusCredits/);
  assert.match(model, /totalCredits/);
});

test('ledger allocates backer numbers transactionally and is webhook-idempotent', () => {
  const ledger = fs.readFileSync('src/lib/crowdfunding-backer-ledger.ts', 'utf8');
  assert.match(ledger, /withTransaction/);
  assert.match(ledger, /stripeCheckoutSessionId: input\.stripeCheckoutSessionId/);
  assert.match(ledger, /CrowdfundingSequence\.findOneAndUpdate/);
  assert.match(ledger, /\$inc: \{ value: 1 \}/);
  assert.match(ledger, /CROWDFUNDING_BACKER_BACKFILL_REQUIRED/);
  assert.match(ledger, /contributionCount: 1/);
  assert.match(ledger, /FounderCreditClaim\.findOneAndUpdate/);
  assert.match(ledger, /sort\(\{ backerNumber: 1 \}\)/);
});

test('Founder fulfillment uses ledger totals and records the backer number', () => {
  const fulfillment = fs.readFileSync('src/lib/founder-credit-fulfillment.ts', 'utf8');
  assert.match(fulfillment, /backerNumber\?: number/);
  assert.match(fulfillment, /backer\.totalContributedCents/);
  assert.match(fulfillment, /backer\.totalCredits/);
  assert.match(fulfillment, /creditStatus: 'claimed'/);
  assert.match(fulfillment, /backerNumber: claim\.backerNumber/);
  assert.match(fulfillment, /sort\(\{ backerNumber: 1 \}\)/);
});

test('legacy crowdfunding data has an ordered backfill migration', () => {
  const script = fs.readFileSync('scripts/ts/backfill-crowdfunding-backers.ts', 'utf8');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8')) as { scripts?: Record<string, string> };
  assert.match(script, /sort\(\{ paidAt: 1, createdAt: 1, _id: 1 \}\)/);
  assert.match(script, /backerNumber: nextNumber/);
  assert.match(script, /CrowdfundingSequence\.findOneAndUpdate/);
  assert.equal(pkg.scripts?.['crowdfunding:backfill-backers'], 'tsx scripts/ts/backfill-crowdfunding-backers.ts');
});

test('admin ledger endpoint is protected and returns ordered backers with contributions', () => {
  const route = fs.readFileSync('src/app/api/admin/crowdfunding/backers/route.ts', 'utf8');
  assert.match(route, /isPremiumJoAdmin/);
  assert.match(route, /sort\(\{ backerNumber: 1 \}\)/);
  assert.match(route, /totalContributedCents/);
  assert.match(route, /totalCredits/);
  assert.match(route, /stripeCheckoutSessionId/);
  assert.match(route, /Cache-Control': 'private, no-store/);
});

test('public crowdfunding progress counts unique backers rather than contribution rows', () => {
  const route = fs.readFileSync('src/app/api/crowdfunding/progress/route.ts', 'utf8');
  assert.match(route, /CrowdfundingBacker\.countDocuments/);
  assert.match(route, /totalContributedCents: \{ \$gt: 0 \}/);
});
