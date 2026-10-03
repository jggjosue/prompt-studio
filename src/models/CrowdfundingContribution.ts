import mongoose, { Document, Schema } from 'mongoose';

export interface ICrowdfundingContribution extends Document {
  stripeCheckoutSessionId: string;
  stripePaymentIntentId?: string | null;
  purchaserUserId?: string | null;
  purchaserEmail?: string | null;
  amountPaidCents: number;
  currency: string;
  status: 'paid' | 'refunded';
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  creditStatus: 'pending' | 'eligible' | 'claimed' | 'cancelled';
  paidAt: Date;
  refundedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CrowdfundingContributionSchema = new Schema<ICrowdfundingContribution>({
  stripeCheckoutSessionId: { type: String, required: true, unique: true, index: true },
  stripePaymentIntentId: { type: String, default: null, index: true },
  purchaserUserId: { type: String, default: null, index: true },
  purchaserEmail: { type: String, default: null, lowercase: true, trim: true },
  amountPaidCents: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD', uppercase: true, maxlength: 3 },
  status: { type: String, required: true, enum: ['paid', 'refunded'], default: 'paid', index: true },
  baseCredits: { type: Number, required: true, min: 0, default: 0 },
  bonusCredits: { type: Number, required: true, min: 0, default: 0 },
  totalCredits: { type: Number, required: true, min: 0, default: 0 },
  creditStatus: { type: String, required: true, enum: ['pending', 'eligible', 'claimed', 'cancelled'], default: 'pending', index: true },
  paidAt: { type: Date, required: true, default: Date.now, index: true },
  refundedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

export default mongoose.models.CrowdfundingContribution ||
  mongoose.model<ICrowdfundingContribution>('CrowdfundingContribution', CrowdfundingContributionSchema, 'crowdfunding_contributions');
