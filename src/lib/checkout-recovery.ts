import { buildEmailUrl } from '@/lib/email-attribution';

export const CHECKOUT_RECOVERY_CAMPAIGN = 'checkout_abandonment_v1';
export const CHECKOUT_RECOVERY_DELAY_MS = 60 * 60 * 1000;

export type CheckoutRecoveryInput = {
  userId: string;
  checkoutId: string;
  productId: string;
  planId?: string | null;
  beginCheckoutAt: Date;
  purchasedAt?: Date | null;
};

export function shouldScheduleCheckoutRecovery(input: CheckoutRecoveryInput) {
  return Boolean(input.checkoutId && input.productId && input.beginCheckoutAt && !input.purchasedAt);
}

export function checkoutRecoveryKey(input: CheckoutRecoveryInput) {
  return `${input.userId}:checkout-recovery:${input.checkoutId}`;
}

export function checkoutRecoveryUrl(input: CheckoutRecoveryInput, origin: string) {
  const url = new URL('/pricing', origin);
  url.searchParams.set('product', input.productId);
  if (input.planId) url.searchParams.set('plan', input.planId);
  return buildEmailUrl(url.toString(), {
    campaignId: CHECKOUT_RECOVERY_CAMPAIGN,
    sequenceId: 'checkout_recovery',
    lifecycleTrigger: 'checkout_started_no_purchase',
    utmCampaign: CHECKOUT_RECOVERY_CAMPAIGN,
  });
}
