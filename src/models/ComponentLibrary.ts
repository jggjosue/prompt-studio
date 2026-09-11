import mongoose, { Document, Schema } from 'mongoose';

/** Grupo de componentes: una colección o un proyecto. */
export interface IComponentGroup {
  id: string;
  name: string;
  componentIds: string[];
  createdAt: string;
}

export interface IComponentLibrary extends Document {
  userId: string;
  favorites: string[];
  recent: { id: string; seenAt: string }[];
  collections: IComponentGroup[];
  projects: IComponentGroup[];
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Biblioteca de componentes de un usuario: favoritos, vistos recientemente,
 * colecciones y proyectos.
 *
 * **Un documento por usuario**, con los grupos como subdocumentos, en lugar de
 * una fila por favorito o por grupo. La pantalla `/my-components` los pinta
 * todos juntos y siempre: con documentos separados harían falta cuatro
 * consultas para dibujar una vista que se escribe entera cuando el usuario
 * arrastra o renombra algo. El tamaño está acotado por los límites de abajo, así
 * que el documento no puede crecer sin control.
 *
 * Antes esto vivía solo en `localStorage`: se perdía al cambiar de navegador y
 * no se podía recuperar. La copia local sigue existiendo como caché para pintar
 * al instante, pero la fuente de verdad es esta colección.
 */
export const LIBRARY_LIMITS = {
  favorites: 500,
  recent: 24,
  groups: 60,
  componentsPerGroup: 300,
  nameLength: 60,
  idLength: 120,
} as const;

const GroupSchema = new Schema<IComponentGroup>(
  {
    id: { type: String, required: true, maxlength: LIBRARY_LIMITS.idLength },
    name: { type: String, required: true, maxlength: LIBRARY_LIMITS.nameLength },
    componentIds: { type: [String], default: [] },
    createdAt: { type: String, required: true },
  },
  { _id: false, versionKey: false }
);

const ComponentLibrarySchema = new Schema<IComponentLibrary>(
  {
    // Único: la biblioteca es una por cuenta, y el upsert depende de ello.
    userId: { type: String, required: true, unique: true, index: true },
    favorites: { type: [String], default: [] },
    recent: {
      type: [
        new Schema(
          {
            id: { type: String, required: true, maxlength: LIBRARY_LIMITS.idLength },
            seenAt: { type: String, required: true },
          },
          { _id: false, versionKey: false }
        ),
      ],
      default: [],
    },
    collections: { type: [GroupSchema], default: [] },
    projects: { type: [GroupSchema], default: [] },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

export default mongoose.models.ComponentLibrary ||
  mongoose.model<IComponentLibrary>(
    'ComponentLibrary',
    ComponentLibrarySchema,
    'component_libraries'
  );
