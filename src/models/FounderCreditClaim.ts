import mongoose, { Document, Schema } from 'mongoose';

export interface IFounderCreditClaim extends Document {
  campaignId: string;
  backerEmail: string;
  pledgeAmountCents: number;
  currency: string;
  rewardTier: string;
  baseCredits: number;
  bonusCredits: number;
  status: 'pending' | 'eligible' | 'claimed' | 'cancelled';
  claimTokenHash?: string | null;
  userId?: string | null;
  claimedAt?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const FounderCreditClaimSchema = new Schema<IFounderCreditClaim>({
  campaignId: { type: String, required: true, index: true, maxlength: 120 },
  backerEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
  pledgeAmountCents: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD', uppercase: true, maxlength: 3 },
  rewardTier: { type: String, required: true, maxlength: 120 },
  baseCredits: { type: Number, required: true, min: 0 },
  bonusCredits: { type: Number, default: 0, min: 0 },
  status: { type: String, required: true, enum: ['pending', 'eligible', 'claimed', 'cancelled'], default: 'pending', index: true },
  claimTokenHash: { type: String, default: null, index: true, select: false },
  userId: { type: String, default: null, index: true },
  claimedAt: { type: Date, default: null },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

FounderCreditClaimSchema.index({ campaignId: 1, backerEmail: 1 }, { unique: true });
FounderCreditClaimSchema.index(
  { campaignId: 1, userId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: 'string' }, status: 'claimed' } },
);

export default mongoose.models.FounderCreditClaim || mongoose.model<IFounderCreditClaim>('FounderCreditClaim', FounderCreditClaimSchema, 'founder_credit_claims');
