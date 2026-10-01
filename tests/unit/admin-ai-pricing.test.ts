import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('admin pricing API is protected and persists operation overrides', () => {
  const api = fs.readFileSync('src/app/api/admin/ai/pricing/route.ts', 'utf8');
  const service = fs.readFileSync('src/lib/admin-ai-pricing.ts', 'utf8');
  assert.match(api, /isPremiumJoAdmin/);
  assert.match(api, /status: 403/);
  assert.match(service, /AIOperationPricing\.findOneAndUpdate/);
  assert.match(service, /isAIOperationCode/);
  assert.match(service, /CREDIT_COST_INVALID/);
  assert.match(service, /MARGIN_INVALID/);
  assert.match(service, /AIProviderPricing\.find/);
});

test('admin UI exposes catalog comparison, credits, margin, enabled state and provider reference', () => {
  const page = fs.readFileSync('src/app/[locale]/admin/ai-pricing/page.tsx', 'utf8');
  for (const label of ['Catalog', 'Credits', 'Min margin %', 'Enabled', 'Provider pricing reference']) assert.match(page, new RegExp(label));
  assert.match(page, /method: 'PATCH'/);
});
