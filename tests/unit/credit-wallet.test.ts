import test from 'node:test';
import assert from 'node:assert/strict';

const {
  CREDIT_CONSUMPTION_ORDER,
  allocateCreditReservation,
  refundCreditReservation,
  reservationSource,
  totalAvailableCredits,
} = await import('../../src/lib/credit-wallet');

test('consumes expiring promotional/monthly credits before persistent credits', () => {
  assert.deepEqual(CREDIT_CONSUMPTION_ORDER, ['promotional', 'subscription', 'purchased', 'founder']);
  const reservation = allocateCreditReservation(
    { promotional: 10, subscription: 20, purchased: 30, founder: 40 },
    55,
  );
  assert.deepEqual(reservation, { promotional: 10, subscription: 20, purchased: 25, founder: 0, total: 55 });
  assert.equal(reservationSource(reservation!), 'mixed');
});

test('uses founder credits after other persistent/expiring buckets are exhausted', () => {
  const reservation = allocateCreditReservation(
    { promotional: 0, subscription: 0, purchased: 5, founder: 20 },
    15,
  );
  assert.deepEqual(reservation, { promotional: 0, subscription: 0, purchased: 5, founder: 10, total: 15 });
});

test('returns null instead of overspending', () => {
  assert.equal(allocateCreditReservation({ subscription: 4, founder: 5 }, 10), null);
});

test('refunds from the last consumed bucket first', () => {
  const reservation = allocateCreditReservation(
    { promotional: 10, subscription: 20, purchased: 30, founder: 40 },
    55,
  )!;
  assert.deepEqual(refundCreditReservation(reservation, 30), {
    promotional: 0,
    subscription: 0,
    purchased: 25,
    founder: 0,
  });
  assert.deepEqual(refundCreditReservation(reservation, 40), {
    promotional: 0,
    subscription: 10,
    purchased: 25,
    founder: 0,
  });
});

test('totals all four credit buckets safely', () => {
  assert.equal(totalAvailableCredits({ promotional: 1, subscription: 2, purchased: 3, founder: 4 }), 10);
});
