import 'server-only';
import { buildCreditTopUpReceipt, buildPurchaseReceipt } from '@/lib/purchase-email-content';
import { reportOperationalError } from '@/lib/observability-server';

/**
 * Correos transaccionales de compra.
 *
 * Sigue el patrón de `notifyJobFinished`: comprueba la configuración antes de
 * nada, importa Resend de forma dinámica —`@/lib/resend` **lanza al cargarse**
 * si falta `RESEND_API_KEY`, así que un import estático rompería el webhook en
 * cualquier entorno sin clave— y nunca deja que un fallo de envío tumbe la
 * operación que lo originó. Cobrar y no avisar es malo; cobrar y devolver un
 * 500 a Stripe es peor, porque provoca reintentos del webhook.
 */

function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_EMAIL);
}

async function send(params: { to: string; subject: string; text: string; context: Record<string, unknown> }): Promise<boolean> {
  if (!emailConfigured()) return false;
  try {
    const { resend } = await import('@/lib/resend');
    await resend.emails.send({
      from: process.env.RESEND_EMAIL as string,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return true;
  } catch (error) {
    reportOperationalError(
      {
        category: 'commerce',
        name: 'transactional_email',
        route: 'transactional-email',
        metadata: { operation: 'send', provider: 'resend', ...params.context },
      },
      error
    );
    return false;
  }
}

export async function sendPurchaseReceipt(params: {
  to: string;
  userId: string;
  productName: string;
  productId: string;
  amountPaidCents: number;
  currency: string;
  receiptUrl?: string | null;
}): Promise<boolean> {
  const { subject, text } = buildPurchaseReceipt(params);
  return send({
    to: params.to,
    subject,
    text,
    context: { userId: params.userId, productId: params.productId, kind: 'purchase_receipt' },
  });
}

export async function sendCreditTopUpReceipt(params: {
  to: string;
  userId: string;
  packId: string;
  credits: number;
  amountPaidCents: number;
  currency: string;
  balance: number;
  receiptUrl?: string | null;
}): Promise<boolean> {
  const { subject, text } = buildCreditTopUpReceipt(params);
  return send({
    to: params.to,
    subject,
    text,
    context: { userId: params.userId, productId: params.packId, kind: 'credit_topup_receipt' },
  });
}
