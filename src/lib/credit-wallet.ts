import 'server-only';

export type CreditBucket = 'promotional' | 'subscription' | 'purchased' | 'founder';

export type CreditBucketBalances = {
  promotional: number;
  subscription: number;
  purchased: number;
  founder: number;
};

export type CreditBucketReservation = CreditBucketBalances & { total: number };

export const CREDIT_CONSUMPTION_ORDER: readonly CreditBucket[] = Object.freeze([
  'promotional',
  'subscription',
  'purchased',
  'founder',
]);

const safe = (value: number | null | undefined) =>
  Number.isFinite(value) ? Math.max(0, Number(value)) : 0;

export function totalAvailableCredits(balances: Partial<CreditBucketBalances>): number {
  return CREDIT_CONSUMPTION_ORDER.reduce((total, bucket) => total + safe(balances[bucket]), 0);
}

export function allocateCreditReservation(
  balances: Partial<CreditBucketBalances>,
  requestedCredits: number,
): CreditBucketReservation | null {
  if (!Number.isFinite(requestedCredits) || requestedCredits < 0) throw new Error('INVALID_CREDIT_AMOUNT');

  const available = totalAvailableCredits(balances);
  if (available < requestedCredits) return null;

  let remaining = requestedCredits;
  const allocation: CreditBucketReservation = {
    promotional: 0,
    subscription: 0,
    purchased: 0,
    founder: 0,
    total: requestedCredits,
  };

  for (const bucket of CREDIT_CONSUMPTION_ORDER) {
    const amount = Math.min(safe(balances[bucket]), remaining);
    allocation[bucket] = amount;
    remaining -= amount;
    if (remaining === 0) break;
  }

  return allocation;
}

export function reservationSource(allocation: CreditBucketReservation):
  'subscription' | 'purchased' | 'founder' | 'promotional' | 'mixed' | 'system' {
  const used = CREDIT_CONSUMPTION_ORDER.filter((bucket) => allocation[bucket] > 0);
  if (used.length === 0) return 'system';
  if (used.length > 1) return 'mixed';
  return used[0];
}

export function refundCreditReservation(
  reservation: CreditBucketReservation,
  refundCredits: number,
): CreditBucketBalances {
  if (!Number.isFinite(refundCredits) || refundCredits < 0) throw new Error('INVALID_CREDIT_AMOUNT');
  let remaining = Math.min(refundCredits, reservation.total);
  const refund: CreditBucketBalances = { promotional: 0, subscription: 0, purchased: 0, founder: 0 };

  // Refund from the last bucket consumed first so partial capture preserves the
  // same effective consumption order as the original reservation.
  for (const bucket of [...CREDIT_CONSUMPTION_ORDER].reverse()) {
    const amount = Math.min(reservation[bucket], remaining);
    refund[bucket] = amount;
    remaining -= amount;
    if (remaining === 0) break;
  }
  return refund;
}
