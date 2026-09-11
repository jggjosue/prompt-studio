import mongoose, { Document, Schema } from 'mongoose';

export interface ICatalogEngagement extends Document {
  contentKey: string;
  kind: 'image' | 'video' | 'web' | 'animation';
  contentId: string;
  reviewProductId?: string;
  views: number;
  clicks: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const CatalogEngagementSchema = new Schema<ICatalogEngagement>({
  contentKey: { type: String, required: true, unique: true, index: true, maxlength: 200 },
  kind: { type: String, required: true, enum: ['image', 'video', 'web', 'animation'], index: true },
  contentId: { type: String, required: true, maxlength: 180 },
  reviewProductId: { type: String, maxlength: 200, index: true },
  views: { type: Number, default: 0, min: 0 },
  clicks: { type: Number, default: 0, min: 0 },
  likes: { type: Number, default: 0, min: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false });

CatalogEngagementSchema.index({ kind: 1, views: -1, likes: -1 });

export default mongoose.models.CatalogEngagement
  || mongoose.model<ICatalogEngagement>('CatalogEngagement', CatalogEngagementSchema, 'catalog_engagements');
