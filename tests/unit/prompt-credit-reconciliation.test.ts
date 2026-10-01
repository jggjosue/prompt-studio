import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('financial reconciliation covers purchase, ledger, refund exposure and account invariants', () => {
  const source = fs.readFileSync('src/lib/prompt-credit-reconciliation.ts', 'utf8');
  for (const code of [
    'PAID_NOT_CREDITED',
    'CREDITED_WITHOUT_LEDGER_GRANT',
    'PURCHASE_LEDGER_AMOUNT_MISMATCH',
    'REFUNDED_CREDITS_EXPOSURE',
    'ACCOUNT_BUCKET_BALANCE_MISMATCH',
    'ACCOUNT_RESERVED_MISMATCH',
    'RESERVED_EXCEEDS_BALANCE',
  ]) assert.match(source, new RegExp(code));
  assert.match(source, /topup:\$\{purchase\.stripeCheckoutSessionId\}/);
  assert.match(source, /Math\.max\(0, expectedCredits - Number\(account\?\.purchasedBalance/);
});

test('reconciliation is admin-only and read-only', () => {
  const api = fs.readFileSync('src/app/api/admin/ai/credit-reconciliation/route.ts', 'utf8');
  const page = fs.readFileSync('src/app/[locale]/admin/credit-reconciliation/page.tsx', 'utf8');
  assert.match(api, /isPremiumJoAdmin/);
  assert.match(api, /status: 403/);
  assert.match(page, /Read-only financial audit/);
  assert.doesNotMatch(fs.readFileSync('src/lib/prompt-credit-reconciliation.ts', 'utf8'), /updateOne|findOneAndUpdate|deleteOne/);
});
