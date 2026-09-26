import mongoose, { Document, Schema } from 'mongoose';

export interface IMarketplaceListing extends Document {
  creatorUserId: string; creatorName: string; title: string; slug: string;
  kind: 'prompt' | 'kit' | 'template'; summary: string; content: string; contentHash: string;
  license: string; priceCents: number; currency: string;
  status: 'draft' | 'pending' | 'changes_requested' | 'approved' | 'rejected' | 'archived';
  qualityScore: number | null; reviewNotes: string | null; version: number;
  versions: Array<{ version: number; contentHash: string; changeNote: string; createdAt: Date }>;
  assetProvenanceId: mongoose.Types.ObjectId; promptVersionId: string; currentReleaseId: mongoose.Types.ObjectId | null;
  eligibility: { eligible: boolean; reasons: string[]; checkedAt: Date };
  preview: { url: string; seed: number | null; parameters: Record<string, unknown> } | null;
  createdAt: Date; updatedAt: Date; publishedAt?: Date | null;
}

const MarketplaceListingSchema = new Schema<IMarketplaceListing>({
  creatorUserId: { type: String, required: true, index: true }, creatorName: { type: String, required: true, maxlength: 80 },
  title: { type: String, required: true, maxlength: 160 }, slug: { type: String, required: true, unique: true, index: true },
  kind: { type: String, enum: ['prompt', 'kit', 'template'], required: true, index: true }, summary: { type: String, required: true, maxlength: 500 },
  content: { type: String, required: true, maxlength: 100000, select: false }, contentHash: { type: String, required: true, unique: true, index: true },
  license: { type: String, enum: ['personal', 'commercial', 'extended'], required: true }, priceCents: { type: Number, required: true, min: 0, max: 50000 },
  currency: { type: String, default: 'usd', enum: ['usd', 'mxn', 'eur'] },
  status: { type: String, enum: ['draft', 'pending', 'changes_requested', 'approved', 'rejected', 'archived'], default: 'pending', index: true },
  qualityScore: { type: Number, default: null, min: 0, max: 100 }, reviewNotes: { type: String, default: null, maxlength: 1000 },
  version: { type: Number, default: 1, min: 1 },
  versions: { type: [new Schema({ version: { type: Number, required: true }, contentHash: { type: String, required: true }, changeNote: { type: String, default: '', maxlength: 300 }, createdAt: { type: Date, default: Date.now } }, { _id: false })], default: [] },
  assetProvenanceId: { type: Schema.Types.ObjectId, ref: 'AssetProvenance', required: true, index: true },
  promptVersionId: { type: String, required: true, index: true }, currentReleaseId: { type: Schema.Types.ObjectId, ref: 'MarketplaceRelease', default: null, index: true },
  eligibility: { type: new Schema({ eligible: { type: Boolean, required: true }, reasons: { type: [String], default: [] }, checkedAt: { type: Date, default: Date.now } }, { _id: false }), required: true },
  preview: { type: Schema.Types.Mixed, default: null }, createdAt: { type: Date, default: Date.now, index: true }, updatedAt: { type: Date, default: Date.now }, publishedAt: { type: Date, default: null },
}, { versionKey: false });

MarketplaceListingSchema.index({ creatorUserId: 1, updatedAt: -1 });
MarketplaceListingSchema.index({ status: 1, publishedAt: -1 });
export default mongoose.models.MarketplaceListing || mongoose.model<IMarketplaceListing>('MarketplaceListing', MarketplaceListingSchema, 'marketplace_listings');
