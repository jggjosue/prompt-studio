import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('reconciliation joins Stripe purchases, purchase analytics, and credit grants', async () => {
  const code = await source('src/lib/prompt-credit-reconciliation.ts');
  assert.ok(code.includes("AnalyticsEventReceipt.find({ eventName: 'purchase', source: 'stripe' })"));
  assert.ok(code.includes("replace(/^stripe:purchase:/, '')"));
  assert.ok(code.includes("'STRIPE_PURCHASE_MISSING_ANALYTICS'"));
  assert.ok(code.includes("'CREDITED_WITHOUT_LEDGER_GRANT'"));
  assert.ok(code.includes("'PURCHASE_LEDGER_AMOUNT_MISMATCH'"));
});

test('reconciliation stays read-only', async () => {
  const code = await source('src/lib/prompt-credit-reconciliation.ts');
  for (const mutation of ['updateOne(', 'findOneAndUpdate(', 'deleteOne(', 'insertMany(', '.save(']) {
    assert.ok(!code.includes(mutation), `unexpected reconciliation mutation: ${mutation}`);
  }
});

test('admin UI surfaces Stripe and analytics totals', async () => {
  const code = await source('src/app/[locale]/admin/credit-reconciliation/page.tsx');
  assert.ok(code.includes('Stripe purchases'));
  assert.ok(code.includes('Analytics receipts'));
});
