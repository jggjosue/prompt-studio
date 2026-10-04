import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICrowdfundingBacker extends Document {
  campaignId: string;
  backerNumber: number;
  purchaserUserId?: string | null;
  purchaserEmail?: string | null;
  totalContributedCents: number;
  totalBaseCredits: number;
  totalBonusCredits: number;
  totalCredits: number;
  contributionCount: number;
  creditStatus: 'pending' | 'eligible' | 'claimed' | 'cancelled';
  founderClaimId?: Types.ObjectId | null;
  firstContributionAt: Date;
  lastContributionAt: Date;
  claimedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const CrowdfundingBackerSchema = new Schema<ICrowdfundingBacker>({
  campaignId: { type: String, required: true, index: true, maxlength: 120 },
  backerNumber: { type: Number, required: true, min: 1 },
  purchaserUserId: { type: String, default: null, index: true },
  purchaserEmail: { type: String, default: null, lowercase: true, trim: true, index: true },
  totalContributedCents: { type: Number, required: true, min: 0, default: 0 },
  totalBaseCredits: { type: Number, required: true, min: 0, default: 0 },
  totalBonusCredits: { type: Number, required: true, min: 0, default: 0 },
  totalCredits: { type: Number, required: true, min: 0, default: 0 },
  contributionCount: { type: Number, required: true, min: 0, default: 0 },
  creditStatus: { type: String, required: true, enum: ['pending', 'eligible', 'claimed', 'cancelled'], default: 'pending', index: true },
  founderClaimId: { type: Schema.Types.ObjectId, ref: 'FounderCreditClaim', default: null, index: true },
  firstContributionAt: { type: Date, required: true, default: Date.now, index: true },
  lastContributionAt: { type: Date, required: true, default: Date.now },
  claimedAt: { type: Date, default: null },
  createdAt: { type: Date, required: true, default: Date.now },
  updatedAt: { type: Date, required: true, default: Date.now },
}, { versionKey: false });

CrowdfundingBackerSchema.index({ campaignId: 1, backerNumber: 1 }, { unique: true });
CrowdfundingBackerSchema.index(
  { campaignId: 1, purchaserUserId: 1 },
  { unique: true, partialFilterExpression: { purchaserUserId: { $type: 'string' } } },
);
CrowdfundingBackerSchema.index(
  { campaignId: 1, purchaserEmail: 1 },
  { unique: true, partialFilterExpression: { purchaserEmail: { $type: 'string' } } },
);

export default mongoose.models.CrowdfundingBacker ||
  mongoose.model<ICrowdfundingBacker>('CrowdfundingBacker', CrowdfundingBackerSchema, 'crowdfunding_backers');
