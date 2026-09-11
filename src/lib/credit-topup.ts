import 'server-only';
import connectToDatabase from '@/lib/mongoose';
import { ensureCreditAccount } from '@/lib/ai-job-service';
import type { CreditPack } from '@/lib/credit-packs';
import AICreditAccount from '@/models/AICreditAccount';
import CreditPurchase from '@/models/CreditPurchase';
import { recordObservabilityEvent } from '@/lib/observability-server';

export type TopUpResult = {
  /** true solo la primera vez que esta sesión de Stripe abona saldo. */
  credited: boolean;
  /** true si el webhook ya había procesado esta sesión (reintento de Stripe). */
  duplicate: boolean;
  balance: number;
};

/**
 * Abona un pack de créditos al saldo del usuario, exactamente una vez.
 *
 * Stripe reintenta los webhooks, así que el abono tiene que ser idempotente. La
 * llave es `stripeCheckoutSessionId`, único en la colección: la fila se inserta
 * en estado `pending` y solo el proceso que consigue moverla a `credited` de
 * forma atómica llega a tocar el saldo. Un reintento encuentra la fila ya en
 * `credited`, no modifica nada y sale sin abonar.
 *
 * El orden es deliberado: primero se reclama la fila y después se suma el
 * saldo. Al revés —sumar y luego marcar— un fallo entre ambos pasos haría que
 * el reintento de Stripe volviera a sumar, regalando créditos. Con este orden
 * el fallo deja la compra marcada sin saldo abonado, que es el lado seguro; y
 * si la suma falla de forma controlada se revierte el estado a `pending` para
 * que el siguiente reintento lo complete.
 */
export async function applyCreditTopUp(params: {
  userId: string;
  userEmail: string;
  pack: CreditPack;
  amountPaidCents: number;
  currency: string;
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  receiptUrl?: string | null;
}): Promise<TopUpResult> {
  const { userId, userEmail, pack, stripeCheckoutSessionId } = params;
  await connectToDatabase();
  await ensureCreditAccount(userId);

  await CreditPurchase.updateOne(
    { stripeCheckoutSessionId },
    {
      $set: {
        stripePaymentIntentId: params.stripePaymentIntentId ?? null,
        receiptUrl: params.receiptUrl ?? null,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId,
        userEmail,
        packId: pack.id,
        credits: pack.credits,
        bonusCredits: pack.bonusCredits,
        amountPaidCents: params.amountPaidCents,
        currency: params.currency,
        status: 'pending',
        stripeCheckoutSessionId,
        purchasedAt: new Date(),
        creditedAt: null,
      },
    },
    { upsert: true }
  );

  // Mutex: solo un proceso consigue el cambio pending -> credited.
  const claim = await CreditPurchase.updateOne(
    { stripeCheckoutSessionId, status: 'pending' },
    { $set: { status: 'credited', creditedAt: new Date(), updatedAt: new Date() } }
  );

  if (!claim.modifiedCount) {
    const balance = await readBalance(userId);
    return { credited: false, duplicate: true, balance };
  }

  try {
    const account = await AICreditAccount.findOneAndUpdate(
      { userId },
      { $inc: { balance: pack.credits }, $set: { updatedAt: new Date() } },
      { returnDocument: 'after' }
    );
    void recordObservabilityEvent({
      category: 'commerce',
      name: 'credit_topup_applied',
      route: '/api/webhooks/stripe',
      userId,
      productId: pack.id,
      status: 'completed',
      value: params.amountPaidCents,
      unit: params.currency,
      metadata: { stripeSessionId: stripeCheckoutSessionId, credits: pack.credits },
    });
    /**
     * Confirmación por correo. Se marca la fila antes de enviar y solo el que
     * gana la marca envía: así un reintento del webhook no manda un segundo
     * correo. Si el envío falla, no se reintenta —el saldo ya está abonado y es
     * lo que importa—, pero queda registrado como error operativo.
     */
    const claimEmail = await CreditPurchase.updateOne(
      { stripeCheckoutSessionId, receiptEmailSentAt: null },
      { $set: { receiptEmailSentAt: new Date() } }
    );
    if (claimEmail.modifiedCount) {
      const { sendCreditTopUpReceipt } = await import('@/lib/transactional-email');
      void sendCreditTopUpReceipt({
        to: userEmail,
        userId,
        packId: pack.id,
        credits: pack.credits,
        amountPaidCents: params.amountPaidCents,
        currency: params.currency,
        balance: account?.balance ?? 0,
        receiptUrl: params.receiptUrl ?? null,
      });
    }

    return { credited: true, duplicate: false, balance: account?.balance ?? 0 };
  } catch (error) {
    // Devolvemos la compra a `pending` para que el reintento de Stripe la complete.
    await CreditPurchase.updateOne(
      { stripeCheckoutSessionId, status: 'credited' },
      { $set: { status: 'pending', creditedAt: null, updatedAt: new Date() } }
    );
    throw error;
  }
}

async function readBalance(userId: string): Promise<number> {
  const account = await AICreditAccount.findOne({ userId }).lean<{ balance?: number } | null>();
  return account?.balance ?? 0;
}

/** Historial de recargas del usuario, de la más reciente a la más antigua. */
export async function listCreditPurchases(userId: string, limit = 20) {
  await connectToDatabase();
  const rows = await CreditPurchase.find({ userId }).sort({ purchasedAt: -1 }).limit(limit).lean<Array<Record<string, unknown>>>();
  return rows.map(row => ({
    id: String(row._id),
    packId: String(row.packId ?? ''),
    credits: Number(row.credits ?? 0),
    amountPaidCents: Number(row.amountPaidCents ?? 0),
    currency: String(row.currency ?? 'usd'),
    status: String(row.status ?? 'pending'),
    receiptUrl: (row.receiptUrl as string | null) ?? null,
    purchasedAt: row.purchasedAt instanceof Date ? row.purchasedAt.toISOString() : null,
  }));
}

/**
 * Marca una recarga como reembolsada.
 *
 * No descuenta saldo a propósito: los créditos pueden estar ya consumidos y
 * restarlos dejaría la cuenta en negativo. Queda como decisión de negocio si
 * conviene además bloquear la cuenta o reclamar el saldo.
 */
export async function markCreditPurchaseRefunded(stripePaymentIntentId: string): Promise<boolean> {
  await connectToDatabase();
  const result = await CreditPurchase.updateOne(
    { stripePaymentIntentId, status: { $ne: 'refunded' } },
    { $set: { status: 'refunded', updatedAt: new Date() } }
  );
  return Boolean(result.modifiedCount);
}
