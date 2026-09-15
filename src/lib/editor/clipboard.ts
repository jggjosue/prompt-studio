/**
 * Portapapeles del editor: copiar, cortar y pegar subárboles.
 *
 * Se serializa el subárbol completo —props y estilos incluidos— en lugar de
 * guardar ids: pegar debe funcionar después de haber borrado el original, y
 * entre pestañas. El texto va también al portapapeles del sistema para poder
 * pegar en otro proyecto, pero la fuente de verdad es la copia en memoria: el
 * acceso al portapapeles del navegador puede estar denegado.
 */
import {
  cloneSubtree,
  insertNode,
  type EditorDocument,
  type EditorNode,
  type IdFactory,
} from '@/lib/editor/document';
import { validateChild } from '@/lib/editor/registry';

export const CLIPBOARD_FORMAT = 'prompt-studio/editor-subtree@1';

export type ClipboardPayload = {
  format: typeof CLIPBOARD_FORMAT;
  rootId: string;
  nodes: EditorNode[];
};

export function copySubtree(doc: EditorDocument, id: string): ClipboardPayload | null {
  const clone = cloneSubtree(doc, id, type => `${type}-clip-${Math.random().toString(36).slice(2, 8)}`);
  if (!clone) return null;
  return { format: CLIPBOARD_FORMAT, rootId: clone.rootId, nodes: clone.nodes };
}

export function serializeClipboard(payload: ClipboardPayload): string {
  return JSON.stringify(payload);
}

/** Devuelve `null` ante cualquier texto que no sea un subárbol nuestro. */
export function parseClipboard(raw: string): ClipboardPayload | null {
  try {
    const parsed = JSON.parse(raw) as ClipboardPayload;
    if (parsed?.format !== CLIPBOARD_FORMAT) return null;
    if (!Array.isArray(parsed.nodes) || !parsed.rootId) return null;
    if (!parsed.nodes.some(node => node.id === parsed.rootId)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Pega el subárbol dentro de `parentId`.
 *
 * Reasigna todos los ids: pegar dos veces no puede producir colisiones. Y valida
 * el tipo raíz contra las reglas del destino, así que pegar una columna en un
 * contenedor se rechaza igual que arrastrarla.
 */
export function pasteSubtree(
  doc: EditorDocument,
  payload: ClipboardPayload,
  parentId: string,
  index: number,
  makeId: IdFactory
): { document: EditorDocument; rootId: string } | { error: string } {
  const parent = doc.nodes[parentId];
  if (!parent) return { error: 'missing-parent' };

  const source = payload.nodes.find(node => node.id === payload.rootId);
  if (!source) return { error: 'missing-root' };

  const rejection = validateChild(parent.type, source.type, parent.children.length);
  if (rejection) return { error: rejection };

  // Ids nuevos para todo el lote, manteniendo la forma del árbol.
  const mapping = new Map(payload.nodes.map(node => [node.id, makeId(node.type)]));
  const rebuilt = payload.nodes.map(node => ({
    ...node,
    id: mapping.get(node.id)!,
    parentId: node.parentId && mapping.has(node.parentId) ? mapping.get(node.parentId)! : null,
    children: node.children.map(child => mapping.get(child)!).filter(Boolean),
    props: { ...node.props },
    styles: JSON.parse(JSON.stringify(node.styles ?? {})),
  }));

  const newRootId = mapping.get(payload.rootId)!;
  const root = rebuilt.find(node => node.id === newRootId)!;

  // El nodo raíz entra por `insertNode` (valida y engancha); los descendientes
  // se añaden al mapa, que ya traen sus relaciones resueltas.
  const inserted = insertNode(doc, { ...root, children: root.children }, parentId, index);
  if ('error' in inserted) return { error: inserted.error };

  const nodes = { ...inserted.document.nodes };
  for (const node of rebuilt) if (node.id !== newRootId) nodes[node.id] = node;

  return { document: { ...inserted.document, nodes }, rootId: newRootId };
}
