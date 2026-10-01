import 'server-only';

import { recordObservabilityEvent } from '@/lib/observability-server';
import connectToDatabase from '@/lib/mongoose';
import AnalyticsEventReceipt from '@/models/AnalyticsEventReceipt';

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
  await connectToDatabase();
  const receipt = await AnalyticsEventReceipt.updateOne(
    { key: `stripe:purchase:${input.transactionId}` },
    { $setOnInsert: { key: `stripe:purchase:${input.transactionId}`, eventName: 'purchase', source: 'stripe', status: 'processing' } },
    { upsert: true }
  );
  if (receipt.upsertedCount === 0) return;

  try {
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
    await AnalyticsEventReceipt.updateOne(
      { key: `stripe:purchase:${input.transactionId}` },
      { $set: { status: 'completed', completedAt: new Date(), failedAt: null } }
    );
  } catch (error) {
    // Release a failed claim so a Stripe retry can safely attempt delivery again.
    await AnalyticsEventReceipt.deleteOne({
      key: `stripe:purchase:${input.transactionId}`,
      status: 'processing',
    });
    throw error;
  }
}
