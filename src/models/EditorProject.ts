import mongoose, { Document, Schema } from 'mongoose';

/**
 * Proyecto del editor visual.
 *
 * Se guarda el **árbol de componentes**, no el HTML generado: el HTML es una
 * salida, y guardar solo la salida deja el proyecto sin editar. `schemaVersion`
 * viaja con el documento para que una v2 pueda migrar en lectura en lugar de
 * adivinar la forma.
 *
 * `versions` guarda un histórico corto con etiqueta, que es lo que permite
 * «restaurar la versión de ayer» sin montar un sistema de versionado completo.
 */
export type StoredEditorDocument = {
  schemaVersion: number;
  rootId: string;
  nodes: Record<string, unknown>;
  definitions: Record<string, unknown>;
};

export interface IEditorProject extends Document {
  userId: string;
  /** Landing de catálogo desde la que nació la copia (si aplica). */
  sourcePageId?: string | null;
  name: string;
  document: StoredEditorDocument;
  versions: Array<{ label: string; document: StoredEditorDocument; createdAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

export const EDITOR_PROJECT_LIMITS = {
  nameLength: 120,
  /** Tope de nodos por proyecto: el editor apunta a 1.000 y deja margen. */
  maxNodes: 2000,
  /** Versiones conservadas; las más antiguas se descartan. */
  maxVersions: 20,
} as const;

const DocumentSchema = new Schema(
  {
    schemaVersion: { type: Number, required: true },
    rootId: { type: String, required: true },
    nodes: { type: Schema.Types.Mixed, required: true },
    definitions: { type: Schema.Types.Mixed, default: {} },
  },
  { _id: false, versionKey: false }
);

const EditorProjectSchema = new Schema<IEditorProject>(
  {
    userId: { type: String, required: true, index: true },
    sourcePageId: { type: String, default: null, maxlength: 120, index: true },
    name: { type: String, required: true, maxlength: EDITOR_PROJECT_LIMITS.nameLength },
    document: { type: DocumentSchema, required: true },
    versions: {
      type: [
        new Schema(
          {
            label: { type: String, required: true, maxlength: 200 },
            document: { type: DocumentSchema, required: true },
            createdAt: { type: Date, default: Date.now },
          },
          { _id: false, versionKey: false }
        ),
      ],
      default: [],
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

EditorProjectSchema.index({ userId: 1, updatedAt: -1 });
EditorProjectSchema.index({ userId: 1, sourcePageId: 1, updatedAt: -1 });

export default mongoose.models.EditorProject ||
  mongoose.model<IEditorProject>('EditorProject', EditorProjectSchema, 'editor_projects');
