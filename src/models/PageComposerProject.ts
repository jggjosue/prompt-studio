import mongoose, { Document, Schema } from 'mongoose';
import {
  PAGE_COMPOSER_LIMITS,
  type PageComposerBlock,
} from '@/lib/page-composer';

/**
 * Diseño guardado del generador de páginas por componentes.
 *
 * Guarda la «receta» del compositor (bloques + ajustes globales), no el HTML:
 * el HTML se regenera al abrir el editor y al exportar. `sourceKitId` permite
 * recuperar el diseño que nació de un kit concreto («editar mi versión del kit»).
 */
export interface IPageComposerProject extends Document {
  userId: string;
  sourceKitId?: string | null;
  name: string;
  brand: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  blocks: PageComposerBlock[];
  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema(
  {
    instanceId: { type: String, required: true, maxlength: PAGE_COMPOSER_LIMITS.choiceIdLength },
    key: { type: String, required: true },
    choiceId: { type: String, required: true, maxlength: PAGE_COMPOSER_LIMITS.choiceIdLength },
    title: { type: String, required: true, maxlength: PAGE_COMPOSER_LIMITS.titleLength },
    prompt: { type: String, required: true, maxlength: PAGE_COMPOSER_LIMITS.promptLength },
    content: { type: Schema.Types.Mixed, default: undefined },
  },
  { _id: false, versionKey: false }
);

const PageComposerProjectSchema = new Schema<IPageComposerProject>(
  {
    userId: { type: String, required: true, index: true },
    sourceKitId: { type: String, default: null, maxlength: 120, index: true },
    name: { type: String, required: true, maxlength: PAGE_COMPOSER_LIMITS.nameLength },
    brand: { type: String, default: '', maxlength: PAGE_COMPOSER_LIMITS.brandLength },
    description: { type: String, default: '', maxlength: PAGE_COMPOSER_LIMITS.descriptionLength },
    primary: { type: String, default: '#7c3aed', maxlength: PAGE_COMPOSER_LIMITS.colorLength },
    secondary: { type: String, default: '#06b6d4', maxlength: PAGE_COMPOSER_LIMITS.colorLength },
    background: { type: String, default: '#07090e', maxlength: PAGE_COMPOSER_LIMITS.colorLength },
    blocks: { type: [BlockSchema], required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

PageComposerProjectSchema.index({ userId: 1, updatedAt: -1 });
PageComposerProjectSchema.index({ userId: 1, sourceKitId: 1, updatedAt: -1 });

export default mongoose.models.PageComposerProject ||
  mongoose.model<IPageComposerProject>('PageComposerProject', PageComposerProjectSchema, 'page_composer_projects');