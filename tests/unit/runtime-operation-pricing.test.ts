import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('provider margin engine fails closed for unverified pricing', () => {
  const source = fs.readFileSync('src/lib/ai-provider-pricing-engine.ts', 'utf8');
  assert.match(source, /!estimate\.costKnown \|\| estimate\.pricingStatus !== 'verified'/);
  assert.match(source, /PROVIDER_COST_UNKNOWN/);
  assert.match(source, /PROVIDER_COST_EXCEEDS_MARGIN/);
});

test('runtime pricing resolves persisted overrides and blocks unsafe or disabled operations', () => {
  const source = fs.readFileSync('src/lib/runtime-operation-pricing.ts', 'utf8');
  assert.match(source, /AIOperationPricing\.findOne/);
  assert.match(source, /override\?\.creditCost \?\? base\.creditCost/);
  assert.match(source, /override\?\.minimumMarginPercent \?\? base\.minimumMarginPercent/);
  assert.match(source, /OPERATION_DISABLED/);
  assert.match(source, /evaluateOperationMargin/);
  assert.match(source, /if \(!margin\.eligible\)/);
  assert.match(source, /PRICING_MARGIN_BLOCKED/);
});
