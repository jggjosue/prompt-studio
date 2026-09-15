import mongoose, { Document, Schema } from 'mongoose';

/**
 * Recarga puntual de créditos comprada con Stripe.
 *
 * Se guarda aparte de `AICreditLedger` a propósito: el ledger es contabilidad
 * ligada a un trabajo (reserva/captura/devolución) y su índice único depende de
 * `jobId`, que una compra no tiene. Aquí viven además los datos de comercio
 * —importe, moneda, recibo— que no pertenecen a un ledger de créditos.
 *
 * `stripeCheckoutSessionId` es único y actúa como llave de idempotencia frente
 * a los reintentos del webhook de Stripe.
 */
export interface ICreditPurchase extends Document {
  userId: string;
  userEmail: string;
  packId: string;
  credits: number;
  bonusCredits: number;
  amountPaidCents: number;
  currency: string;
  /**
   * `pending`: pagada, saldo aún no abonado.
   * `credited`: saldo abonado al usuario.
   * `refunded`: reembolsada en Stripe.
   * Una fila atascada en `pending` significa que el cliente pagó y no recibió
   * los créditos: es la señal que hay que vigilar para repararla a mano.
   */
  status: 'pending' | 'credited' | 'refunded';
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  receiptUrl?: string | null;
  purchasedAt: Date;
  creditedAt?: Date | null;
  /** Momento del envío de la confirmación. Evita reenviarla en cada reintento. */
  receiptEmailSentAt?: Date | null;
  updatedAt: Date;
}

const CreditPurchaseSchema = new Schema<ICreditPurchase>({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  packId: { type: String, required: true, index: true },
  credits: { type: Number, required: true, min: 0 },
  bonusCredits: { type: Number, default: 0, min: 0 },
  amountPaidCents: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true },
  status: { type: String, enum: ['pending', 'credited', 'refunded'], default: 'pending', index: true },
  stripeCheckoutSessionId: { type: String, required: true, unique: true, index: true },
  stripePaymentIntentId: { type: String, default: null, index: true },
  receiptUrl: { type: String, default: null },
  purchasedAt: { type: Date, default: Date.now, index: true },
  creditedAt: { type: Date, default: null },
  receiptEmailSentAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

CreditPurchaseSchema.index({ userId: 1, purchasedAt: -1 });

export default mongoose.models.CreditPurchase || mongoose.model<ICreditPurchase>('CreditPurchase', CreditPurchaseSchema, 'credit_purchases');
