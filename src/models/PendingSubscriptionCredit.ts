import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingSubscriptionCredit extends Document {
  userId: string;
  plan: 'premium' | 'creator' | 'pro' | 'studio';
  credits: number;
  requestId: string;
  stripeInvoiceId: string;
  stripeSubscriptionId?: string | null;
  status: 'pending' | 'activated' | 'cancelled';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  activatedAt?: Date | null;
  updatedAt: Date;
}

const PendingSubscriptionCreditSchema = new Schema<IPendingSubscriptionCredit>({
  userId: { type: String, required: true, index: true },
  plan: { type: String, required: true, enum: ['premium', 'creator', 'pro', 'studio'], index: true },
  credits: { type: Number, required: true, min: 1 },
  requestId: { type: String, required: true, unique: true, index: true },
  stripeInvoiceId: { type: String, required: true, index: true },
  stripeSubscriptionId: { type: String, default: null, index: true },
  status: { type: String, required: true, enum: ['pending', 'activated', 'cancelled'], default: 'pending', index: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
  activatedAt: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

PendingSubscriptionCreditSchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.models.PendingSubscriptionCredit ||
  mongoose.model<IPendingSubscriptionCredit>('PendingSubscriptionCredit', PendingSubscriptionCreditSchema, 'pending_subscription_credits');
