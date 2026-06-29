import type Stripe from 'stripe';
import type { StripeUserMetadata } from '@/lib/stripe';

export const AFFILIATE_REF_STORAGE_KEY = 'prompt-studio-affiliate-referrer';
export const AFFILIATE_OWNER_STORAGE_KEY = 'prompt-studio-affiliate-owner';
export const AFFILIATE_FIRST_REF_STORAGE_KEY = 'prompt-studio-affiliate-first-referrer';
export const AFFILIATE_LAST_TOUCH_STORAGE_KEY = 'prompt-studio-affiliate-last-touch-referrer';
export const AFFILIATE_COMMISSION_PERCENT = 20;
export const AFFILIATE_COMMISSION_RATE = AFFILIATE_COMMISSION_PERCENT / 100;
export const AFFILIATE_MIN_PAYOUT_CENTS = 5000;
export const AFFILIATE_PAYOUT_METHODS = ['paypal', 'wise'] as const;
export type AffiliatePayoutMethod = (typeof AFFILIATE_PAYOUT_METHODS)[number];
export type AffiliatePayoutStatus = 'available' | 'paid_out' | 'on_hold';

export type AffiliateCommissionStatus = 'pending' | 'paid' | 'pending_settlement';

export type AffiliateCommissionRecord = {
  id: string;
  buyerUserId: string;
  referrerUserId: string;
  productId: string;
  productName: string;
  source: 'checkout' | 'invoice';
  amountPaidCents: number;
  commissionRate: number;
  commissionCents: number;
  currency: string;
  status: AffiliateCommissionStatus;
  payoutStatus?: AffiliatePayoutStatus;
  payoutMethod?: AffiliatePayoutMethod | null;
  payoutReference?: string | null;
  createdAt: number;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
};

export type AffiliatePrivateMetadata = Partial<StripeUserMetadata> & {
  affiliateReferralCode?: string;
  affiliateReferrerId?: string | null;
  affiliateCommissions?: AffiliateCommissionRecord[];
  affiliatePaypalEmail?: string | null;
};

export const DEFAULT_AFFILIATE_COMMISSION_RATE = 0.2;

export function makeCommissionId(prefix: string, stripeId: string): string {
  return `${prefix}_${stripeId}`;
}

export function normalizeCommissionRecords(
  value: unknown
): AffiliateCommissionRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is AffiliateCommissionRecord => {
    return Boolean(item && typeof item === 'object' && 'id' in item && 'buyerUserId' in item);
  });
}

export function appendUniqueCommission(
  existing: AffiliateCommissionRecord[],
  record: AffiliateCommissionRecord
): AffiliateCommissionRecord[] {
  if (existing.some(item => item.id === record.id)) return existing;
  return [record, ...existing].slice(0, 50);
}

export function createCommissionRecord(params: {
  buyerUserId: string;
  referrerUserId: string;
  productId: string;
  productName: string;
  source: 'checkout' | 'invoice';
  amountPaidCents: number;
  commissionRate?: number;
  currency: string;
  status?: AffiliateCommissionStatus;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
}): AffiliateCommissionRecord {
  const commissionRate = params.commissionRate ?? AFFILIATE_COMMISSION_RATE;
  const commissionCents = Math.round(params.amountPaidCents * commissionRate);
  const seed = [
    params.source,
    params.stripeCheckoutSessionId ?? params.stripeInvoiceId ?? params.productId,
    params.referrerUserId,
  ].join(':');

  return {
    id: makeCommissionId(params.source, `${seed}`),
    buyerUserId: params.buyerUserId,
    referrerUserId: params.referrerUserId,
    productId: params.productId,
    productName: params.productName,
    source: params.source,
    amountPaidCents: params.amountPaidCents,
    commissionRate,
    commissionCents,
    currency: params.currency,
    status: params.status ?? (params.source === 'invoice' ? 'paid' : 'pending_settlement'),
    payoutStatus: 'available',
    payoutMethod: null,
    payoutReference: null,
    createdAt: Date.now(),
    stripeCustomerId: params.stripeCustomerId ?? null,
    stripeSubscriptionId: params.stripeSubscriptionId ?? null,
    stripeCheckoutSessionId: params.stripeCheckoutSessionId ?? null,
    stripeInvoiceId: params.stripeInvoiceId ?? null,
  };
}
