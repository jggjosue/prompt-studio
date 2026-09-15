import mongoose, { Document, Schema } from 'mongoose';

export interface ICatalogLike extends Document {
  contentKey: string;
  userId: string;
  createdAt: Date;
}

const CatalogLikeSchema = new Schema<ICatalogLike>({
  contentKey: { type: String, required: true, index: true, maxlength: 200 },
  userId: { type: String, required: true, index: true, maxlength: 200 },
  createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

/** Identifica al usuario que dio like y vuelve idempotente un doble clic. */
CatalogLikeSchema.index({ contentKey: 1, userId: 1 }, { unique: true });

export default mongoose.models.CatalogLike
  || mongoose.model<ICatalogLike>('CatalogLike', CatalogLikeSchema, 'catalog_likes');
