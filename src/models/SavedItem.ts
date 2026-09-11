import mongoose, { Schema, Document } from 'mongoose';

/** Tipos de recurso que se pueden guardar. Debe coincidir con `SAVED_ITEM_KINDS`. */
export type SavedItemKind = 'image' | 'video' | 'web-page' | 'component' | 'animation';

export const SAVED_ITEM_KINDS: readonly SavedItemKind[] = [
  'image',
  'video',
  'web-page',
  'component',
  'animation',
];

export function isSavedItemKind(value: unknown): value is SavedItemKind {
  return typeof value === 'string' && (SAVED_ITEM_KINDS as readonly string[]).includes(value);
}

export interface ISavedItem extends Document {
  userId: string;
  itemKind: SavedItemKind;
  itemId: string;
  title: string;
  imageUrl: string | null;
  href: string;
  createdAt: Date;
}

/**
 * Recursos que un usuario ha guardado desde el catálogo.
 *
 * `title`, `imageUrl` y `href` se **desnormalizan** a propósito. El catálogo no
 * está en base de datos: vive como JSON en `src/data/`, repartido por tipo y con
 * formas distintas (los componentes envuelven el array, las imágenes no). Sin
 * copiar esos tres campos, pintar la lista de guardados obligaría a cargar y
 * recorrer cinco catálogos en cada visita al perfil.
 *
 * Contrapartida: si un recurso se renombra en la fuente, el guardado conserva el
 * título viejo. Es aceptable —`href` e `itemId` siguen resolviendo— y se corrige
 * volviéndolo a guardar. Nunca se copia el prompt: eso es producto de pago y su
 * acceso depende de la suscripción o la compra, que se comprueban al abrir la
 * ficha.
 */
const SavedItemSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  itemKind: { type: String, required: true, enum: SAVED_ITEM_KINDS, index: true },
  itemId: { type: String, required: true },
  title: { type: String, required: true },
  imageUrl: { type: String, default: null },
  href: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

/**
 * Un mismo recurso solo se guarda una vez por usuario. El índice único hace que
 * un doble clic o un reenvío no cree duplicados, sin depender de comprobarlo
 * antes de insertar.
 *
 * `itemId` no es único entre tipos (existen `img-2` y `wp-2`), por eso la clave
 * incluye `itemKind`.
 */
SavedItemSchema.index({ userId: 1, itemKind: 1, itemId: 1 }, { unique: true });
/** Listado del perfil: los guardados de un usuario, del más reciente al más antiguo. */
SavedItemSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.SavedItem ||
  mongoose.model<ISavedItem>('SavedItem', SavedItemSchema, 'saved_items');
