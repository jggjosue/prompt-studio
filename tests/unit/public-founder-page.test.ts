import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('public Founder page exposes the crowdfunding proposition and calculator', () => {
  const page = fs.readFileSync('src/app/[locale]/founder/page.tsx', 'utf8');
  assert.match(page, /CrowdfundingCreditCalculator/);
  assert.match(page, /Founder Credits/);
  assert.match(page, /\$25,000 USD/);
  assert.match(page, /\$9\/month · 1,000 Prompt Credits/);
  assert.match(page, /FOUNDER_REWARD_TIERS/);
  assert.match(page, /dentro de los 14 días/);
  assert.match(page, /no-equity/);
  for (const amount of ['\$25K','\$35K','\$50K','\$75K','\$100K']) assert.match(page, new RegExp(amount));
});

test('public Founder page communicates provider-agnostic credits and campaign safeguards', () => {
  const page = fs.readFileSync('src/app/[locale]/founder/page.tsx', 'utf8');
  assert.match(page, /Proveedor agnóstico/);
  assert.match(page, /no añaden automáticamente créditos/);
  assert.match(page, /No se entregan al hacer el pledge/);
  assert.match(page, /no representan un paquete fijo de generaciones/);
});
