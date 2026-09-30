import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Borrador + puntero de publicación del Visual Website Builder.
 *
 * El borrador (document) es la única parte editable. La versión publicada es
 * **inmutable** y vive en `PageComposerPublishedVersion`; aquí solo se guarda el
 * puntero (`publishedVersionId`) que se actualiza de forma atómica al publicar.
 * Editar nunca toca la versión publicada: el borrador y lo publicado son objetos
 * separados.
 */

export type PageComposerDeployment = {
  version: number;
  publishedAt: Date;
  publishedBy: string;
  sourceDraftVersion: number;
};

export interface IPageComposerProject extends Document {
  userId: string;
  name: string;
  /** El `PageSchema` completo del borrador. */
  document: Record<string, unknown>;
  /** Contador de guardado del borrador; da concurrencia optimista. */
  version: number;
  /** Versión publicada actualmente, o null si el sitio no está publicado. */
  publishedVersionId?: Types.ObjectId | null;
  /** Número de la última versión publicada (contador). */
  publishedVersion?: number | null;
  publishedAt?: Date | null;
  unpublishedAt?: Date | null;
  /** Historial de despliegues (metadata de publicación). */
  deployments?: PageComposerDeployment[];
  createdAt: Date;
  updatedAt: Date;
}

export const PAGE_COMPOSER_PROJECT_LIMITS = {
  nameLength: 120,
  /** Despliegues conservados; los más antiguos se descartan. */
  maxDeployments: 50,
} as const;

const DeploymentSchema = new Schema<PageComposerDeployment>(
  {
    version: { type: Number, required: true },
    publishedAt: { type: Date, required: true },
    publishedBy: { type: String, required: true },
    sourceDraftVersion: { type: Number, required: true },
  },
  { _id: false, versionKey: false }
);

const PageComposerProjectSchema = new Schema<IPageComposerProject>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, maxlength: PAGE_COMPOSER_PROJECT_LIMITS.nameLength },
    document: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, required: true, default: 1 },
    publishedVersionId: { type: Schema.Types.ObjectId, default: null, index: true },
    publishedVersion: { type: Number, default: null },
    publishedAt: { type: Date, default: null },
    unpublishedAt: { type: Date, default: null },
    deployments: { type: [DeploymentSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

PageComposerProjectSchema.index({ userId: 1, updatedAt: -1 });

export default mongoose.models.PageComposerProject ||
  mongoose.model<IPageComposerProject>('PageComposerProject', PageComposerProjectSchema, 'page_composer_projects');