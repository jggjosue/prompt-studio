import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Versión publicada **inmutable** de un sitio.
 *
 * Se crea una por despliegue y nunca se actualiza ni se borra en el flujo normal:
 * la web publicada apunta a un id de esta colección, así una republish no puede
 * alterar lo que ya está servido. `{ siteId, version }` es único.
 */

export interface IPageComposerPublishedVersion extends Document {
  siteId: Types.ObjectId;
  /** Número de despliegue (1-based, por sitio). */
  version: number;
  /** El `PageSchema` congelado en el momento de publicar. */
  document: Record<string, unknown>;
  publishedBy: string;
  /** Versión del borrador que originó este despliegue. */
  sourceDraftVersion: number;
  createdAt: Date;
}

const PageComposerPublishedVersionSchema = new Schema<IPageComposerPublishedVersion>(
  {
    siteId: { type: Schema.Types.ObjectId, required: true, index: true },
    version: { type: Number, required: true },
    document: { type: Schema.Types.Mixed, required: true },
    publishedBy: { type: String, required: true },
    sourceDraftVersion: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

PageComposerPublishedVersionSchema.index({ siteId: 1, version: 1 }, { unique: true });
PageComposerPublishedVersionSchema.index({ siteId: 1, createdAt: -1 });

export default mongoose.models.PageComposerPublishedVersion ||
  mongoose.model<IPageComposerPublishedVersion>(
    'PageComposerPublishedVersion',
    PageComposerPublishedVersionSchema,
    'page_composer_published_versions'
  );