import mongoose, { Document, Schema } from 'mongoose';

export interface IAffiliateClick extends Document {
  clerkUserId: string;
  referrerUserId: string;
  productId: string;
  productName?: string | null;
  productPriceCents?: number | null;
  source: 'landing-page' | 'campaign-card' | 'buy-button' | 'demo' | 'affiliate-program';
  visitorKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const AffiliateClickSchema = new Schema<IAffiliateClick>(
  {
    clerkUserId: { type: String, required: true, index: true },
    referrerUserId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    productName: { type: String, default: null },
    productPriceCents: { type: Number, default: null },
    source: {
      type: String,
      enum: ['landing-page', 'campaign-card', 'buy-button', 'demo', 'affiliate-program'],
      required: true,
      index: true,
    },
    visitorKey: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

AffiliateClickSchema.index({ referrerUserId: 1, productId: 1, createdAt: -1 });
AffiliateClickSchema.index({ referrerUserId: 1, visitorKey: 1, productId: 1, source: 1 }, { unique: true });

export default mongoose.models.AffiliateClick ||
  mongoose.model<IAffiliateClick>('AffiliateClick', AffiliateClickSchema, 'affiliate_clicks');
