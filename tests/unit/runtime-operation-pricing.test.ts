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

test('quality catalog uses margin-safe credit costs', () => {
  const source = fs.readFileSync('src/lib/ai-operation-catalog.ts', 'utf8');
  for (const [code, credits] of [
    ['IMAGE_LITE_1K', 16],
    ['IMAGE_QUALITY_1K', 31],
    ['IMAGE_QUALITY_2K', 46],
    ['IMAGE_QUALITY_4K', 70],
    ['VIDEO_LITE_720_8S', 180],
    ['VIDEO_LITE_1080_8S', 288],
    ['VIDEO_FAST_720_8S', 360],
    ['VIDEO_FAST_1080_8S', 432],
    ['VIDEO_PREMIUM_8S', 1440],
    ['WEBSITE_SIMPLE', 36],
    ['WEBSITE_ADVANCED', 50],
    ['WEBSITE_COMPLEX', 100],
  ] as const) {
    assert.match(source, new RegExp(`${code}[^\\n]+creditCost: ${credits}`));
  }
});
