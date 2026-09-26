import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketplaceRelease extends Document {
  listingId: mongoose.Types.ObjectId;
  releaseNumber: number;
  content: string;
  contentHash: string;
  changeNote: string;
  provenance: Record<string, unknown>;
  preview: Record<string, unknown> | null;
  createdAt: Date;
}

const MarketplaceReleaseSchema = new Schema<IMarketplaceRelease>({
  listingId: { type: Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true, index: true },
  releaseNumber: { type: Number, required: true, min: 1 },
  content: { type: String, required: true, maxlength: 100000, select: false, immutable: true },
  contentHash: { type: String, required: true, immutable: true },
  changeNote: { type: String, default: '', maxlength: 300, immutable: true },
  provenance: { type: Schema.Types.Mixed, required: true, immutable: true },
  preview: { type: Schema.Types.Mixed, default: null, immutable: true },
  createdAt: { type: Date, default: Date.now, immutable: true },
}, { versionKey: false, strict: 'throw' });

MarketplaceReleaseSchema.index({ listingId: 1, releaseNumber: 1 }, { unique: true });
export default mongoose.models.MarketplaceRelease || mongoose.model<IMarketplaceRelease>('MarketplaceRelease', MarketplaceReleaseSchema, 'marketplace_releases');
