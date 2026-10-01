import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { calculateCrowdfundingCredits } = await import('../../src/lib/crowdfunding-credit-calculator');

test('$50 Founder estimate is 5,500 credits and uses catalog operation prices', () => {
  const estimate = calculateCrowdfundingCredits(5000);
  assert.equal(estimate.baseCredits, 5000);
  assert.equal(estimate.bonusPercent, 10);
  assert.equal(estimate.bonusCredits, 500);
  assert.equal(estimate.totalCredits, 5500);

  const image = estimate.examples.find((entry) => entry.operationCode === 'IMAGE_QUALITY_1K');
  const video = estimate.examples.find((entry) => entry.operationCode === 'VIDEO_FAST_720_8S');
  const website = estimate.examples.find((entry) => entry.operationCode === 'WEBSITE_ADVANCED');
  assert.equal(image?.maxOperations, 183);
  assert.equal(video?.maxOperations, 15);
  assert.equal(website?.maxOperations, 110);
});

test('calculator is estimate-only and communicates fulfillment conditions', () => {
  const component = fs.readFileSync('src/components/CrowdfundingCreditCalculator.tsx', 'utf8');
  const api = fs.readFileSync('src/app/api/crowdfunding/credits/route.ts', 'utf8');
  assert.doesNotMatch(api, /grantFounderCredits/);
  assert.match(component, /No garantiza un número fijo de generaciones/);
  assert.match(component, /no acredita créditos/);
  assert.match(component, /campaña financiada, fondos recibidos y verificación del backer/);
});
