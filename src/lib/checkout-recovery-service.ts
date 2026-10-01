import 'server-only';

import { canSendNonTransactional } from '@/lib/email-suppression';
import { getEmailStreamConfig } from '@/lib/email-streams';
import { checkoutRecoveryUrl, CHECKOUT_RECOVERY_DELAY_MS, type CheckoutRecoveryInput } from '@/lib/checkout-recovery';
import { resend } from '@/lib/resend';
import CheckoutRecovery from '@/models/CheckoutRecovery';

export async function scheduleCheckoutRecovery(input: CheckoutRecoveryInput & { email: string }) {
  if (input.purchasedAt) return null;
  return CheckoutRecovery.findOneAndUpdate(
    { checkoutId: input.checkoutId },
    { $setOnInsert: { userId: input.userId, email: input.email.trim().toLowerCase(), checkoutId: input.checkoutId, productId: input.productId, planId: input.planId ?? null, beginCheckoutAt: input.beginCheckoutAt, scheduledFor: new Date(input.beginCheckoutAt.getTime() + CHECKOUT_RECOVERY_DELAY_MS), status: 'scheduled' } },
    { upsert: true, new: true }
  );
}

export async function cancelCheckoutRecoveryAfterPurchase(params: { checkoutId: string; purchasedAt?: Date; revenueCents?: number | null; currency?: string | null }) {
  const purchasedAt = params.purchasedAt ?? new Date();
  return CheckoutRecovery.findOneAndUpdate(
    { checkoutId: params.checkoutId },
    { $set: { status: 'cancelled_purchase', purchasedAt, recoveredPurchaseAt: purchasedAt, recoveredRevenueCents: params.revenueCents ?? null, currency: params.currency ?? null } },
    { new: true }
  );
}

export async function sendCheckoutRecovery(params: {
  recovery: { _id: unknown; userId: string; email: string; checkoutId: string; productId: string; planId?: string | null; beginCheckoutAt: Date; purchasedAt?: Date | null };
  recipient: { marketingOptIn?: boolean; unsubscribeTimestamp?: Date | null; emailSuppressedAt?: Date | null; emailSuppressionReason?: 'unsubscribe' | 'hard_bounce' | 'complaint' | 'manual' | null; emailDoNotContact?: boolean; emailPreferenceTopics?: string[] };
  origin: string;
}) {
  if (params.recovery.purchasedAt || !canSendNonTransactional(params.recipient, 'lifecycle') || !params.recipient.emailPreferenceTopics?.includes('offers')) {
    await CheckoutRecovery.updateOne({ _id: params.recovery._id }, { $set: { status: params.recovery.purchasedAt ? 'cancelled_purchase' : 'cancelled_ineligible' } });
    return { sent: false as const };
  }
  const stream = getEmailStreamConfig('lifecycle');
  if (!stream) return { sent: false as const };
  const url = checkoutRecoveryUrl(params.recovery, params.origin);
  const response = await resend.emails.send({
    from: stream.from,
    ...(stream.replyTo ? { replyTo: stream.replyTo } : {}),
    to: params.recovery.email,
    subject: '¿Quieres continuar con tu compra?',
    text: ['Tu checkout quedó pendiente.', '', `Continuar con el producto seleccionado: ${url}`, '', 'No incluimos datos de pago en este correo.'].join('\n'),
  });
  if (response.error) throw response.error;
  await CheckoutRecovery.updateOne({ _id: params.recovery._id, status: 'scheduled' }, { $set: { status: 'sent', sentAt: new Date() } });
  return { sent: true as const, providerId: response.data?.id ?? null };
}
