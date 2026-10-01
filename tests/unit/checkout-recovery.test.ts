import assert from 'node:assert/strict';
import test from 'node:test';
import { checkoutRecoveryKey, checkoutRecoveryUrl, shouldScheduleCheckoutRecovery } from '../../src/lib/checkout-recovery.ts';

const input = { userId: 'u1', checkoutId: 'cs_123', productId: 'pro', planId: 'annual', beginCheckoutAt: new Date('2026-01-01T00:00:00Z') };

test('recovery requires begin checkout without purchase', () => {
  assert.equal(shouldScheduleCheckoutRecovery(input), true);
  assert.equal(shouldScheduleCheckoutRecovery({ ...input, purchasedAt: new Date() }), false);
});

test('checkout recovery is idempotent by checkout', () => {
  assert.equal(checkoutRecoveryKey(input), 'u1:checkout-recovery:cs_123');
});

test('deep link preserves product and plan with email attribution', () => {
  const url = new URL(checkoutRecoveryUrl(input, 'https://prompt.example'));
  assert.equal(url.searchParams.get('product'), 'pro');
  assert.equal(url.searchParams.get('plan'), 'annual');
  assert.equal(url.searchParams.get('utm_source'), 'email');
  assert.equal(url.searchParams.get('email_trigger'), 'checkout_started_no_purchase');
});
