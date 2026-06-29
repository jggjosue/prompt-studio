import mongoose, { Document, Schema } from 'mongoose';

export interface IAffiliateSale extends Document {
  buyerUserId: string;
  referrerUserId: string;
  productId: string;
  productName: string;
  source: 'checkout' | 'invoice';
  amountPaidCents: number;
  commissionRate: number;
  commissionCents: number;
  currency: string;
  status: 'pending' | 'paid' | 'pending_settlement';
  payoutStatus: 'available' | 'paid_out' | 'on_hold';
  payoutMethod?: 'paypal' | 'wise' | null;
  payoutReference?: string | null;
  createdAt: Date;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
  stripeCheckoutSessionId?: string | null;
  stripeInvoiceId?: string | null;
}

const AffiliateSaleSchema = new Schema<IAffiliateSale>(
  {
    buyerUserId: { type: String, required: true, index: true },
    referrerUserId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, required: true },
    source: { type: String, enum: ['checkout', 'invoice'], required: true },
    amountPaidCents: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    commissionCents: { type: Number, required: true, index: true },
    currency: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'pending_settlement'], required: true, index: true },
    payoutStatus: { type: String, enum: ['available', 'paid_out', 'on_hold'], required: true, default: 'available', index: true },
    payoutMethod: { type: String, enum: ['paypal', 'wise', null], default: null },
    payoutReference: { type: String, default: null },
    createdAt: { type: Date, default: Date.now, index: true },
    stripeCustomerId: { type: String, default: null },
    stripeSubscriptionId: { type: String, default: null },
    stripeCheckoutSessionId: { type: String, default: null, index: true, unique: true, sparse: true },
    stripeInvoiceId: { type: String, default: null, index: true, unique: true, sparse: true },
  },
  { versionKey: false }
);

AffiliateSaleSchema.index({ referrerUserId: 1, createdAt: -1 });

export default mongoose.models.AffiliateSale || mongoose.model<IAffiliateSale>('AffiliateSale', AffiliateSaleSchema, 'affiliate_sales');
