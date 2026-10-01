import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const { CREDIT_PACKS, getCreditPack, isValidCreditTopUp } = await import('../../src/lib/credit-packs');

test('Prompt Credits v1 exposes the five exact one-time packages', () => {
  assert.deepEqual(
    CREDIT_PACKS.map((pack) => [pack.priceCents, pack.credits]),
    [[500, 500], [1000, 1000], [2500, 2500], [5000, 5000], [10000, 10000]],
  );
});

test('legacy pack ids remain settleable but are not offered in the active catalog', () => {
  assert.equal(CREDIT_PACKS.some((pack) => pack.id === 'topup-1500'), false);
  assert.ok(getCreditPack('topup-1500'));
});

test('top-up validation rejects manipulated amount, currency or user metadata', () => {
  const pack = CREDIT_PACKS[0];
  const valid = { expectedPackId: pack.id, expectedUserId: 'user_1', expectedAmountCents: pack.priceCents, expectedCurrency: pack.currency, metadataPackId: pack.id, metadataUserId: 'user_1', buyerKey: 'user_1', amountTotal: pack.priceCents, currency: pack.currency };
  assert.equal(isValidCreditTopUp(valid), true);
  assert.equal(isValidCreditTopUp({ ...valid, amountTotal: 1 }), false);
  assert.equal(isValidCreditTopUp({ ...valid, metadataUserId: 'user_2' }), false);
});

test('Stripe fulfillment remains paid-only, idempotent and refund-aware', () => {
  const webhook = fs.readFileSync('src/app/api/webhooks/stripe/route.ts', 'utf8');
  const topup = fs.readFileSync('src/lib/credit-topup.ts', 'utf8');

  assert.match(webhook, /payment_status !== 'paid'/);
  assert.match(webhook, /isValidCreditTopUp/);
  assert.match(topup, /stripeCheckoutSessionId, status: 'pending'/);
  assert.match(topup, /grantPurchasedCredits/);
  assert.match(webhook, /case 'charge\.refunded'/);
  assert.match(webhook, /markCreditPurchaseRefunded/);
});
