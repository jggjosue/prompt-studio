import assert from 'node:assert/strict';
import test from 'node:test';
import { isValidComponentPurchase } from '../../src/lib/component-purchase-validation.ts';
import { DAILY_FREE_COPY_LIMIT, hasDailyCopyAllowance, localDateKey, normalizeDailyCopyUsage } from '../../src/lib/daily-copy-limit.ts';
import { canAccessPremiumProduct } from '../../src/lib/premium-access.ts';

test('checkout accepts only server price, currency, product and owner', () => {
  const valid = { expectedProductId: 'button-001', expectedUserId: 'user_1', expectedAmountCents: 500, expectedCurrency: 'usd', metadataProductId: 'button-001', metadataUserId: 'user_1', buyerKey: 'user_1', amountTotal: 500, currency: 'usd' };
  assert.equal(isValidComponentPurchase(valid), true);
  assert.equal(isValidComponentPurchase({ ...valid, amountTotal: 1 }), false);
  assert.equal(isValidComponentPurchase({ ...valid, buyerKey: 'user_2' }), false);
  assert.equal(isValidComponentPurchase({ ...valid, metadataProductId: 'button-002' }), false);
});

test('Premium remains locked without subscription or purchase', () => {
  assert.equal(canAccessPremiumProduct({ membership: 'Premium', hasSubscription: false, hasPurchase: false }), false);
  assert.equal(canAccessPremiumProduct({ membership: 'Premium', hasSubscription: true, hasPurchase: false }), true);
  assert.equal(canAccessPremiumProduct({ membership: 'Premium', hasSubscription: false, hasPurchase: true }), true);
  assert.equal(canAccessPremiumProduct({ membership: 'Free', hasSubscription: false, hasPurchase: false }), true);
});

test('daily copy limit resets by local day and rejects the sixth free copy', () => {
  const today = localDateKey(new Date(2026, 8, 4));
  assert.deepEqual(normalizeDailyCopyUsage('{bad json', today), { date: today, count: 0 });
  assert.deepEqual(normalizeDailyCopyUsage(JSON.stringify({ date: '2026-09-03', count: 99 }), today), { date: today, count: 0 });
  const usage = normalizeDailyCopyUsage(JSON.stringify({ date: today, count: DAILY_FREE_COPY_LIMIT }), today);
  assert.equal(hasDailyCopyAllowance(usage), false);
  assert.equal(hasDailyCopyAllowance(usage, true), true);
});
