import mongoose, { Document, Schema } from 'mongoose';

export interface IAffiliateDailyStats extends Document {
  clerkUserId: string;
  dateKey: string;
  totalRevenueCents: number;
  paidRevenueCents: number;
  clicks: number;
  salesRegistered: number;
  conversionRate: number;
  salesCount: number;
  updatedAt: Date;
  createdAt: Date;
}

const AffiliateDailyStatsSchema = new Schema<IAffiliateDailyStats>(
  {
    clerkUserId: { type: String, required: true, index: true },
    dateKey: { type: String, required: true, index: true },
    totalRevenueCents: { type: Number, required: true, default: 0 },
    paidRevenueCents: { type: Number, required: true, default: 0 },
    clicks: { type: Number, required: true, default: 0 },
    salesRegistered: { type: Number, required: true, default: 0 },
    conversionRate: { type: Number, required: true, default: 0 },
    salesCount: { type: Number, required: true, default: 0 },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

AffiliateDailyStatsSchema.index({ clerkUserId: 1, dateKey: 1 }, { unique: true });

export default mongoose.models.AffiliateDailyStats || mongoose.model<IAffiliateDailyStats>('AffiliateDailyStats', AffiliateDailyStatsSchema, 'affiliate_daily_stats');
