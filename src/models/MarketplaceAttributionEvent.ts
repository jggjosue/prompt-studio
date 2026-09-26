import mongoose, { Schema } from 'mongoose';

const MarketplaceAttributionEventSchema = new Schema({
  listingId: { type: Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true, index: true },
  releaseId: { type: Schema.Types.ObjectId, ref: 'MarketplaceRelease', required: true, index: true },
  purchaseId: { type: Schema.Types.ObjectId, ref: 'ComponentPurchase', required: true, index: true },
  creatorUserId: { type: String, required: true, index: true },
  affiliateId: { type: String, default: null, index: true },
  grossCents: { type: Number, required: true, min: 0 },
  entries: { type: [new Schema({ account: { type: String, enum: ['creator', 'platform', 'affiliate'], required: true }, amountCents: { type: Number, required: true, min: 0 } }, { _id: false })], required: true },
  currency: { type: String, required: true },
  stripeCheckoutSessionId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
}, { versionKey: false });

export default mongoose.models.MarketplaceAttributionEvent || mongoose.model('MarketplaceAttributionEvent', MarketplaceAttributionEventSchema, 'marketplace_attribution_events');
