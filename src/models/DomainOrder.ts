import mongoose, { Document, Schema, Types } from 'mongoose';
import type { DomainOrderState } from '@/lib/domain-order-core';

/**
 * Orden de compra de un dominio. Guarda cotización, idempotencia y un **audit
 * trail completo**; nunca guarda datos de tarjeta (el pago lo gestiona Stripe).
 */

export interface IDomainOrder extends Document {
  userId: string;
  hostname: string;
  tld: string;
  provider: string;
  state: DomainOrderState;
  quote: { registration: number; renewal?: number; currency: string; period: 'year'; quotedAt: Date };
  idempotencyKey: string;
  siteId?: Types.ObjectId | null;
  stripeCheckoutSessionId?: string | null;
  registrarOrderId?: string | null;
  registrationAttempts: number;
  refundEligible: boolean;
  failedReason?: string | null;
  audit: Array<{ at: Date; event: string; detail?: string }>;
  createdAt: Date;
  updatedAt: Date;
}

const DomainOrderSchema = new Schema<IDomainOrder>(
  {
    userId: { type: String, required: true, index: true },
    hostname: { type: String, required: true, index: true },
    tld: { type: String, required: true },
    provider: { type: String, required: true },
    state: {
      type: String,
      enum: ['quoted', 'payment_pending', 'paid', 'registering', 'registered', 'configuration_pending', 'active', 'failed', 'refund_required'],
      default: 'quoted',
    },
    quote: {
      registration: { type: Number, required: true },
      renewal: { type: Number, default: undefined },
      currency: { type: String, default: 'USD' },
      period: { type: String, default: 'year' },
      quotedAt: { type: Date, default: Date.now },
    },
    idempotencyKey: { type: String, required: true, unique: true },
    siteId: { type: Schema.Types.ObjectId, default: null },
    stripeCheckoutSessionId: { type: String, default: null },
    registrarOrderId: { type: String, default: null },
    registrationAttempts: { type: Number, default: 0 },
    refundEligible: { type: Boolean, default: false },
    failedReason: { type: String, default: null },
    audit: {
      type: [
        new Schema(
          { at: { type: Date, default: Date.now }, event: { type: String, required: true }, detail: { type: String, default: null } },
          { _id: false }
        ),
      ],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

DomainOrderSchema.index({ userId: 1, hostname: 1, createdAt: -1 });
DomainOrderSchema.index({ stripeCheckoutSessionId: 1 }, { unique: true, sparse: true });

export default mongoose.models.DomainOrder ||
  mongoose.model<IDomainOrder>('DomainOrder', DomainOrderSchema, 'domain_orders');