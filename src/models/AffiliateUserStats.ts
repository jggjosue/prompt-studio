import mongoose, { Document, Schema } from 'mongoose';

export interface IAffiliateUserStats extends Document {
  clerkUserId: string;
  referralCode: string;
  totalRevenueCents: number;
  paidRevenueCents: number;
  availablePayoutCents: number;
  canRequestManualPayout: boolean;
  clicks: number;
  salesRegistered: number;
  conversionRate: number;
  updatedAt: Date;
  createdAt: Date;
}

const AffiliateUserStatsSchema = new Schema<IAffiliateUserStats>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    referralCode: { type: String, required: true, index: true },
    totalRevenueCents: { type: Number, required: true, default: 0 },
    paidRevenueCents: { type: Number, required: true, default: 0 },
    availablePayoutCents: { type: Number, required: true, default: 0 },
    canRequestManualPayout: { type: Boolean, required: true, default: false },
    clicks: { type: Number, required: true, default: 0 },
    salesRegistered: { type: Number, required: true, default: 0 },
    conversionRate: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.models.AffiliateUserStats || mongoose.model<IAffiliateUserStats>('AffiliateUserStats', AffiliateUserStatsSchema, 'affiliate_user_stats');
