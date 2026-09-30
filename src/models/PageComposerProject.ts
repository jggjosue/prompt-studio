import mongoose, { Document, Schema } from 'mongoose';

/**
 * Borrador del Visual Website Builder.
 *
 * Se guarda el `PageSchema` (los datos), no el HTML: el HTML es una salida que se
 * regenera al renderizar. `version` es un contador monótono que da concurrencia
 * optimista: el cliente manda la versión que cargó y el backend rechaza con 409
 * si mientras tanto otra pestaña guardó, en vez de sobrescribirla.
 */

export interface IPageComposerProject extends Document {
  userId: string;
  name: string;
  /** El `PageSchema` completo del borrador. */
  document: Record<string, unknown>;
  /** Contador de guardado; se usa para detectar escrituras obsoletas. */
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export const PAGE_COMPOSER_PROJECT_LIMITS = {
  nameLength: 120,
} as const;

const PageComposerProjectSchema = new Schema<IPageComposerProject>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, maxlength: PAGE_COMPOSER_PROJECT_LIMITS.nameLength },
    document: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, required: true, default: 1 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

PageComposerProjectSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.PageComposerProject ||
  mongoose.model<IPageComposerProject>('PageComposerProject', PageComposerProjectSchema, 'page_composer_projects');