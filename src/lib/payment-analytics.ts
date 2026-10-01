import 'server-only';

import { recordObservabilityEvent } from '@/lib/observability-server';

type PurchaseAnalyticsInput = {
  transactionId: string;
  productId?: string | null;
  productCategory: string;
  amountCents?: number | null;
  currency?: string | null;
  userId?: string | null;
};

/**
 * Server-authoritative purchase signal.
 *
 * Stripe's signed webhook is the source of truth. This intentionally avoids
 * browser "success" query parameters, which can be replayed or forged.
 */
export async function recordConfirmedPurchase(input: PurchaseAnalyticsInput): Promise<void> {
  await recordObservabilityEvent({
    category: 'analytics',
    name: 'purchase',
    route: '/api/webhooks/stripe',
    status: 'completed',
    userId: input.userId ?? undefined,
    productId: input.productId ?? undefined,
    value: input.amountCents ?? undefined,
    unit: input.currency ?? undefined,
    metadata: {
      transactionId: input.transactionId,
      productCategory: input.productCategory,
      source: 'stripe_signed_webhook',
    },
  });
}
