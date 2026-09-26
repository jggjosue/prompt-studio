import mongoose, { Document, Schema } from 'mongoose';

export interface IComponentPurchase extends Document {
  purchaserUserId: string;
  purchaserEmail: string;
  productId: string;
  productName: string;
  productKind: string;
  marketplaceReleaseId?: mongoose.Types.ObjectId | null;
  amountPaidCents: number;
  currency: string;
  status: 'paid' | 'refunded';
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  receiptUrl?: string | null;
  downloadCount: number;
  maxDownloads: number;
  /** Momento del envío del recibo. Evita reenviarlo en cada reintento del webhook. */
  receiptEmailSentAt?: Date | null;
  purchasedAt: Date;
  updatedAt: Date;
}

const ComponentPurchaseSchema = new Schema<IComponentPurchase>({
  purchaserUserId: { type: String, required: true, index: true },
  purchaserEmail: { type: String, required: true },
  productId: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  productKind: { type: String, required: true },
  marketplaceReleaseId: { type: Schema.Types.ObjectId, ref: 'MarketplaceRelease', default: null, index: true },
  amountPaidCents: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, enum: ['paid', 'refunded'], default: 'paid', index: true },
  stripeCheckoutSessionId: { type: String, required: true, unique: true, index: true },
  stripePaymentIntentId: { type: String, default: null, index: true },
  receiptUrl: { type: String, default: null },
  downloadCount: { type: Number, default: 0 },
  maxDownloads: { type: Number, default: 5 },
  receiptEmailSentAt: { type: Date, default: null },
  purchasedAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

ComponentPurchaseSchema.index({ purchaserUserId: 1, purchasedAt: -1 });
ComponentPurchaseSchema.index({ purchaserUserId: 1, productId: 1, status: 1 });

export default mongoose.models.ComponentPurchase || mongoose.model<IComponentPurchase>('ComponentPurchase', ComponentPurchaseSchema, 'component_purchases');
