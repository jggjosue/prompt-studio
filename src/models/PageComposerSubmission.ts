import mongoose, { Document, Schema, Types } from 'mongoose';

/**
 * Envío de un formulario nativo de un sitio publicado.
 *
 * Solo se guarda bajo el `siteId` resuelto desde el hostname del formulario
 * (aislamiento de tenants). La IP se guarda **hasheada**, no en claro, por
 * privacidad.
 */

export interface IPageComposerSubmission extends Document {
  siteId: Types.ObjectId;
  /** Id del nodo del formulario dentro del PageSchema publicado. */
  formId: string;
  formVariant: string;
  /** Hostname que sirvió el formulario (subdominio o dominio personalizado). */
  hostname: string;
  /** Valores enviados: `{ nombreDelCampo: valor }`. */
  fields: Record<string, string>;
  consent: boolean;
  ipHash?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

const PageComposerSubmissionSchema = new Schema<IPageComposerSubmission>(
  {
    siteId: { type: Schema.Types.ObjectId, required: true, index: true },
    formId: { type: String, required: true },
    formVariant: { type: String, default: 'contact' },
    hostname: { type: String, required: true },
    fields: { type: Schema.Types.Mixed, required: true },
    consent: { type: Boolean, default: false },
    ipHash: { type: String, default: null },
    userAgent: { type: String, default: null, maxlength: 500 },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

PageComposerSubmissionSchema.index({ siteId: 1, createdAt: -1 });
PageComposerSubmissionSchema.index({ siteId: 1, formId: 1, createdAt: -1 });

export default mongoose.models.PageComposerSubmission ||
  mongoose.model<IPageComposerSubmission>('PageComposerSubmission', PageComposerSubmissionSchema, 'page_composer_submissions');