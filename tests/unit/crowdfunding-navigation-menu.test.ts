import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('header exposes a Crowdfunding menu with public crowdfunding and affiliate destinations', () => {
  const header = fs.readFileSync('src/components/layout/header-client.tsx', 'utf8');
  assert.match(header, /id: 'community'/);
  assert.match(header, /label: 'Crowdfunding'/);
  assert.match(header, /href: '\/founder'/);
  assert.match(header, /href: '\/affiliate-program'/);
  assert.match(header, /activePrefixes: \['\/founder', '\/affiliate-program', '\/affiliate-program-terms'\]/);
  assert.match(header, /crowdfundingDesc: 'Apoya Prompt Studio y calcula tus Founder Credits'/);
  assert.match(header, /affiliateDesc: 'Recomienda Prompt Studio/);
});

test('affiliate is grouped instead of remaining a separate top-level navigation item', () => {
  const header = fs.readFileSync('src/components/layout/header-client.tsx', 'utf8');
  assert.doesNotMatch(header, /id: 'affiliate'/);
});
