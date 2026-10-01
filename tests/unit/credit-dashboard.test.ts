import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('credit dashboard reuses wallet and immutable ledger', () => {
  const service = fs.readFileSync('src/lib/credit-dashboard.ts', 'utf8');
  const route = fs.readFileSync('src/app/api/ai/credits/dashboard/route.ts', 'utf8');
  const page = fs.readFileSync('src/app/credits/page.tsx', 'utf8');

  assert.match(service, /getCreditBalance\(userId\)/);
  assert.match(service, /AICreditLedger\.find\(\{ userId \}\)/);
  assert.match(service, /sort\(\{ createdAt: -1 \}\)/);
  assert.match(route, /await auth\(\)/);
  assert.match(route, /private-no-store/);

  for (const label of ['Monthly', 'Purchased', 'Founder', 'Promotional', 'Reservados', 'Historial', 'Expira']) {
    assert.match(page, new RegExp(label));
  }
});
