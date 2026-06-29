import mongoose, { Document, Schema } from 'mongoose';

export interface IAffiliatePayoutAccount extends Document {
  clerkUserId: string;
  email: string;
  method: 'paypal';
  updatedAt: Date;
  createdAt: Date;
}

const AffiliatePayoutAccountSchema = new Schema<IAffiliatePayoutAccount>(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    method: { type: String, enum: ['paypal'], required: true, default: 'paypal' },
    updatedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.models.AffiliatePayoutAccount ||
  mongoose.model<IAffiliatePayoutAccount>('AffiliatePayoutAccount', AffiliatePayoutAccountSchema, 'affiliate_payout_accounts');
