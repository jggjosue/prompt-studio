import mongoose, { Document, Schema } from 'mongoose';

export type AffiliateReferralProductStats = {
  productId: string;
  productName: string;
  clicks: number;
  sales: number;
  revenueCents: number;
  paidRevenueCents: number;
  lastPriceCents: number | null;
  lastSeenAt: Date;
};

export interface IAffiliateReferralStats extends Document {
  clerkUserId: string;
  referralCode: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenueCents: number;
  paidRevenueCents: number;
  availablePayoutCents: number;
  conversionRate: number;
  productStats: AffiliateReferralProductStats[];
  updatedAt: Date;
  createdAt: Date;
}

const AffiliateReferralProductStatsSchema = new Schema<AffiliateReferralProductStats>(
  {
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    clicks: { type: Number, required: true, default: 0 },
    sales: { type: Number, required: true, default: 0 },
    revenueCents: { type: Number, required: true, default: 0 },
    paidRevenueCents: { type: Number, required: true, default: 0 },
    lastPriceCents: { type: Number, default: null },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { _id: false, versionKey: false }
);

const AffiliateReferralStatsSchema = new Schema<IAffiliateReferralStats>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    referralCode: { type: String, required: true, unique: true, index: true },
    totalClicks: { type: Number, required: true, default: 0 },
    totalConversions: { type: Number, required: true, default: 0 },
    totalRevenueCents: { type: Number, required: true, default: 0 },
    paidRevenueCents: { type: Number, required: true, default: 0 },
    availablePayoutCents: { type: Number, required: true, default: 0 },
    conversionRate: { type: Number, required: true, default: 0 },
    productStats: { type: [AffiliateReferralProductStatsSchema], required: true, default: [] },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

AffiliateReferralStatsSchema.index({ clerkUserId: 1, referralCode: 1 });

export default mongoose.models.AffiliateReferralStats ||
  mongoose.model<IAffiliateReferralStats>('AffiliateReferralStats', AffiliateReferralStatsSchema, 'affiliate_referral_stats');
