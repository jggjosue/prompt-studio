import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('top-up fulfillment independently rejects amount/currency tampering and replay mismatch', () => {
  const source = fs.readFileSync('src/lib/credit-topup.ts', 'utf8');
  assert.match(source, /TOPUP_AMOUNT_MISMATCH/);
  assert.match(source, /TOPUP_CURRENCY_MISMATCH/);
  assert.match(source, /TOPUP_REPLAY_MISMATCH/);
  assert.match(source, /existing\.userId !== userId/);
  assert.match(source, /existing\.packId !== pack\.id/);
  assert.match(source, /Number\(existing\.amountPaidCents\) !== params\.amountPaidCents/);
});

test('Founder inputs and variable workload quotes are bounded before value-sensitive operations', () => {
  const founder = fs.readFileSync('src/lib/founder-credit-fulfillment.ts', 'utf8');
  const quote = fs.readFileSync('src/app/api/ai/credits/quote/route.ts', 'utf8');
  assert.match(founder, /FOUNDER_CAMPAIGN_INVALID/);
  assert.match(founder, /FOUNDER_EMAIL_INVALID/);
  assert.match(founder, /FOUNDER_CLAIM_INVALID/);
  assert.match(quote, /WORKLOAD_INVALID/);
  assert.match(quote, /fileCount > 100000/);
  assert.match(quote, /lineCount > 100000000/);
});

test('security hardening preserves server-authoritative pricing and idempotent grants', () => {
  const topup = fs.readFileSync('src/lib/credit-topup.ts', 'utf8');
  const founder = fs.readFileSync('src/lib/founder-credit-fulfillment.ts', 'utf8');
  assert.match(topup, /grantPurchasedCredits\(userId, pack\.credits, `topup:\$\{stripeCheckoutSessionId\}`/);
  assert.match(founder, /grantFounderCredits\(input\.userId, totalCredits, `founder:\$\{claim\._id\}`/);
});
