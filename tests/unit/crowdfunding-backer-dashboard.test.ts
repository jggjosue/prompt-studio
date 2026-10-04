import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('crowdfunding backer dashboard is protected by the superadmin check', () => {
  const page = fs.readFileSync('src/app/[locale]/dashboard/crowdfunding-backers/page.tsx', 'utf8');
  assert.match(page, /isPremiumJoAdmin/);
  assert.match(page, /redirect\('\/dashboard\/profile'\)/);
  assert.match(page, /CrowdfundingBacker\.find/);
  assert.match(page, /sort\(\{ backerNumber: 1 \}\)/);
  assert.match(page, /Backers de Crowdfunding/);
  assert.match(page, /totalContributedCents/);
  assert.match(page, /totalBaseCredits/);
  assert.match(page, /totalBonusCredits/);
  assert.match(page, /totalCredits/);
  assert.match(page, /contributionCount/);
  assert.match(page, /creditStatus/);
});

test('crowdfunding backer menu is rendered only for isSuperAdmin', () => {
  const layout = fs.readFileSync('src/app/[locale]/dashboard/layout.tsx', 'utf8');
  const mobile = fs.readFileSync('src/components/dashboard/dashboard-mobile-nav.tsx', 'utf8');

  assert.match(layout, /isSuperAdmin[\s\S]*\/dashboard\/crowdfunding-backers/);
  assert.match(layout, /Backers crowdfunding/);
  assert.match(mobile, /isSuperAdmin[\s\S]*\/dashboard\/crowdfunding-backers/);
  assert.match(mobile, /Backers crowdfunding/);
});
