/**
 * Modelo de documento del editor visual.
 *
 * El constructor actual guarda su estado en 25 `useState` de escalares planos
 * (`primary`, `radius`, `heading`…) y pinta una plantilla fija por tipo. Con esa
 * forma no hay anidamiento, ni historial, ni persistencia, ni estilos por
 * breakpoint: cada una de esas funciones exige un **documento**.
 *
 * Decisiones y su porqué:
 *
 * - **Árbol normalizado** (`nodes: Record<id, node>` + `children: id[]`) en vez
 *   de nodos anidados. Con 1.000 nodos, un árbol anidado obliga a clonar la rama
 *   entera en cada cambio y a re-renderizar desde la raíz; con el mapa plano se
 *   toca un nodo y solo ese nodo cambia de identidad.
 * - **Estilos por breakpoint con herencia** `desktop → laptop → tablet → mobile`.
 *   `desktop` es la base; los demás guardan **solo** lo que sobrescriben, que es
 *   lo que permite señalar en la interfaz qué propiedad está sobrescrita.
 * - **`schemaVersion`** desde el primer día: el documento se va a guardar en base
 *   de datos y va a cambiar de forma. Sin versión, la primera migración obliga a
 *   adivinar.
 * - Funciones **puras**: reciben documento y devuelven documento nuevo. Nada de
 *   mutación in situ, para que el historial pueda invertir cada operación y para
 *   poder probarlo sin React.
 */
import { getDefinition, validateChild, type DropRejection } from '@/lib/editor/registry';

export const SCHEMA_VERSION = 1;

export const BREAKPOINTS = ['desktop', 'laptop', 'tablet', 'mobile'] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

/** Orden de herencia: un valor de `desktop` alcanza a los tres siguientes. */
const INHERITANCE: Record<Breakpoint, Breakpoint[]> = {
  desktop: ['desktop'],
  laptop: ['laptop', 'desktop'],
  tablet: ['tablet', 'laptop', 'desktop'],
  mobile: ['mobile', 'tablet', 'laptop', 'desktop'],
};

export type StyleMap = Record<string, string | number>;
export type NodeStyles = Partial<Record<Breakpoint, StyleMap>>;

export type EditorNode = {
  id: string;
  type: string;
  /** Nombre editable en el panel de capas. Si falta, se usa la etiqueta del tipo. */
  name?: string;
  props: Record<string, unknown>;
  styles: NodeStyles;
  children: string[];
  parentId: string | null;
  locked?: boolean;
  hidden?: boolean;
  /** Instancia de un componente reutilizable, con las props sobrescritas. */
  instanceOf?: { definitionId: string; overrides: string[] };
};

export type ReusableDefinition = { id: string; name: string; rootId: string; createdAt: string };

export type EditorDocument = {
  schemaVersion: number;
  rootId: string;
  nodes: Record<string, EditorNode>;
  /** Componentes reutilizables: sus árboles viven en `nodes`, fuera de la raíz. */
  definitions: Record<string, ReusableDefinition>;
};

export type IdFactory = (type: string) => string;

/** Ids legibles y deterministas cuando se inyecta un contador. */
export function incrementalIds(seed = 0): IdFactory {
  let n = seed;
  return type => `${type}-${++n}`;
}

export function createDocument(makeId: IdFactory = incrementalIds()): EditorDocument {
  const rootId = makeId('root');
  return {
    schemaVersion: SCHEMA_VERSION,
    rootId,
    nodes: {
      [rootId]: { id: rootId, type: 'root', props: {}, styles: {}, children: [], parentId: null },
    },
    definitions: {},
  };
}

export function createNode(type: string, makeId: IdFactory): EditorNode {
  const definition = getDefinition(type);
  return {
    id: makeId(type),
    type,
    props: { ...(definition?.defaultProps ?? {}) },
    styles: definition?.defaultStyles ? { desktop: { ...definition.defaultStyles } } : {},
    children: [],
    parentId: null,
  };
}

export function getNode(doc: EditorDocument, id: string): EditorNode | undefined {
  return doc.nodes[id];
}

export function nodeLabel(doc: EditorDocument, id: string): string {
  const node = doc.nodes[id];
  if (!node) return '—';
  return node.name || getDefinition(node.type)?.label || node.type;
}

/** Camino desde la raíz hasta el nodo, para la miga de pan del elemento seleccionado. */
export function ancestorsOf(doc: EditorDocument, id: string): string[] {
  const path: string[] = [];
  let current = doc.nodes[id]?.parentId ?? null;
  while (current) {
    path.unshift(current);
    current = doc.nodes[current]?.parentId ?? null;
  }
  return path;
}

export function descendantsOf(doc: EditorDocument, id: string): string[] {
  const out: string[] = [];
  const walk = (nodeId: string) => {
    for (const child of doc.nodes[nodeId]?.children ?? []) {
      out.push(child);
      walk(child);
    }
  };
  walk(id);
  return out;
}

export type InsertResult = { document: EditorDocument } | { error: DropRejection };

function clampIndex(length: number, index: number): number {
  return Math.min(Math.max(index, 0), length);
}

/** Inserta un nodo nuevo. Valida contra las reglas del registro antes de tocar nada. */
export function insertNode(
  doc: EditorDocument,
  node: EditorNode,
  parentId: string,
  index: number
): InsertResult {
  const parent = doc.nodes[parentId];
  if (!parent) return { error: 'unknown-type' };
  const rejection = validateChild(parent.type, node.type, parent.children.length);
  if (rejection) return { error: rejection };

  const children = [...parent.children];
  children.splice(clampIndex(children.length, index), 0, node.id);

  return {
    document: {
      ...doc,
      nodes: {
        ...doc.nodes,
        [parentId]: { ...parent, children },
        [node.id]: { ...node, parentId },
      },
    },
  };
}

/**
 * Mueve un nodo a otro padre y posición.
 *
 * Rechaza mover un nodo dentro de sí mismo o de sus descendientes: sin esa
 * comprobación se crea un ciclo y cualquier recorrido del árbol se cuelga.
 */
export function moveNode(
  doc: EditorDocument,
  id: string,
  nextParentId: string,
  index: number
): InsertResult {
  const node = doc.nodes[id];
  const nextParent = doc.nodes[nextParentId];
  if (!node || !nextParent || node.parentId === null) return { error: 'unknown-type' };
  if (node.locked) return { error: 'leaf-parent' };
  if (id === nextParentId || descendantsOf(doc, id).includes(nextParentId)) return { error: 'cycle' };

  const samePlace = node.parentId === nextParentId;
  const childCount = samePlace ? nextParent.children.length - 1 : nextParent.children.length;
  const rejection = validateChild(nextParent.type, node.type, childCount);
  if (rejection) return { error: rejection };

  const oldParent = doc.nodes[node.parentId]!;
  const withoutNode = oldParent.children.filter(child => child !== id);
  const targetChildren = samePlace ? withoutNode : [...nextParent.children];
  targetChildren.splice(clampIndex(targetChildren.length, index), 0, id);

  const nodes = { ...doc.nodes };
  nodes[oldParent.id] = { ...oldParent, children: samePlace ? targetChildren : withoutNode };
  nodes[nextParentId] = { ...nodes[nextParentId], children: targetChildren };
  nodes[id] = { ...node, parentId: nextParentId };

  return { document: { ...doc, nodes } };
}

export type RemovedSubtree = { nodes: EditorNode[]; parentId: string; index: number };

/** Quita un nodo y su subárbol. Devuelve lo quitado para poder deshacerlo. */
export function removeNode(
  doc: EditorDocument,
  id: string
): { document: EditorDocument; removed: RemovedSubtree } | { error: 'root' | 'missing' | 'locked' } {
  const node = doc.nodes[id];
  if (!node) return { error: 'missing' };
  if (id === doc.rootId) return { error: 'root' };
  if (node.locked) return { error: 'locked' };

  const parent = doc.nodes[node.parentId!]!;
  const index = parent.children.indexOf(id);
  const ids = [id, ...descendantsOf(doc, id)];
  const removed = ids.map(nodeId => doc.nodes[nodeId]);

  const nodes = { ...doc.nodes };
  for (const nodeId of ids) delete nodes[nodeId];
  nodes[parent.id] = { ...parent, children: parent.children.filter(child => child !== id) };

  return { document: { ...doc, nodes }, removed: { nodes: removed, parentId: parent.id, index } };
}

/** Reinserta un subárbol quitado, con los mismos ids. Es el inverso de `removeNode`. */
export function restoreSubtree(doc: EditorDocument, removed: RemovedSubtree): EditorDocument {
  const nodes = { ...doc.nodes };
  for (const node of removed.nodes) nodes[node.id] = node;
  const parent = nodes[removed.parentId];
  if (parent) {
    const children = [...parent.children];
    children.splice(clampIndex(children.length, removed.index), 0, removed.nodes[0].id);
    nodes[removed.parentId] = { ...parent, children };
  }
  return { ...doc, nodes };
}

/** Copia un subárbol con ids nuevos. Base de duplicar, copiar/pegar y desvincular instancias. */
export function cloneSubtree(
  doc: EditorDocument,
  id: string,
  makeId: IdFactory
): { nodes: EditorNode[]; rootId: string } | null {
  const source = doc.nodes[id];
  if (!source) return null;
  const mapping = new Map<string, string>();
  const ids = [id, ...descendantsOf(doc, id)];
  for (const nodeId of ids) mapping.set(nodeId, makeId(doc.nodes[nodeId].type));

  const nodes = ids.map(nodeId => {
    const node = doc.nodes[nodeId];
    return {
      ...node,
      id: mapping.get(nodeId)!,
      parentId: node.parentId && mapping.has(node.parentId) ? mapping.get(node.parentId)! : node.parentId,
      children: node.children.map(child => mapping.get(child)!),
      props: { ...node.props },
      styles: structuredCloneStyles(node.styles),
    };
  });

  return { nodes, rootId: mapping.get(id)! };
}

function structuredCloneStyles(styles: NodeStyles): NodeStyles {
  const out: NodeStyles = {};
  for (const bp of BREAKPOINTS) if (styles[bp]) out[bp] = { ...styles[bp] };
  return out;
}

export function duplicateNode(
  doc: EditorDocument,
  id: string,
  makeId: IdFactory
): { document: EditorDocument; newId: string } | { error: DropRejection | 'missing' | 'root' } {
  const node = doc.nodes[id];
  if (!node) return { error: 'missing' };
  if (id === doc.rootId) return { error: 'root' };

  const clone = cloneSubtree(doc, id, makeId);
  if (!clone) return { error: 'missing' };

  const parent = doc.nodes[node.parentId!]!;
  const rejection = validateChild(parent.type, node.type, parent.children.length);
  if (rejection) return { error: rejection };

  const nodes = { ...doc.nodes };
  for (const cloned of clone.nodes) nodes[cloned.id] = cloned;
  nodes[clone.rootId] = { ...nodes[clone.rootId], parentId: parent.id };
  const children = [...parent.children];
  children.splice(parent.children.indexOf(id) + 1, 0, clone.rootId);
  nodes[parent.id] = { ...parent, children };

  return { document: { ...doc, nodes }, newId: clone.rootId };
}

/** Envuelve un nodo en un contenedor nuevo, conservando su posición. */
export function wrapInContainer(
  doc: EditorDocument,
  id: string,
  containerType: string,
  makeId: IdFactory
): { document: EditorDocument; containerId: string } | { error: DropRejection | 'missing' | 'root' } {
  const node = doc.nodes[id];
  if (!node) return { error: 'missing' };
  if (id === doc.rootId) return { error: 'root' };

  const parent = doc.nodes[node.parentId!]!;
  const container = createNode(containerType, makeId);
  const parentRejection = validateChild(parent.type, containerType, parent.children.length);
  if (parentRejection) return { error: parentRejection };
  const childRejection = validateChild(containerType, node.type, 0);
  if (childRejection) return { error: childRejection };

  const index = parent.children.indexOf(id);
  const nodes = { ...doc.nodes };
  nodes[container.id] = { ...container, parentId: parent.id, children: [id] };
  nodes[id] = { ...node, parentId: container.id };
  nodes[parent.id] = {
    ...parent,
    children: parent.children.map(child => (child === id ? container.id : child)),
  };
  void index;

  return { document: { ...doc, nodes }, containerId: container.id };
}

export function setProps(doc: EditorDocument, id: string, patch: Record<string, unknown>): EditorDocument {
  const node = doc.nodes[id];
  if (!node) return doc;
  return { ...doc, nodes: { ...doc.nodes, [id]: { ...node, props: { ...node.props, ...patch } } } };
}

/**
 * Escribe estilos en un breakpoint concreto. Un valor `null` **borra** la
 * sobrescritura y devuelve la propiedad a lo que herede del breakpoint mayor.
 */
export function setStyles(
  doc: EditorDocument,
  id: string,
  breakpoint: Breakpoint,
  patch: Record<string, string | number | null>
): EditorDocument {
  const node = doc.nodes[id];
  if (!node) return doc;
  const current = { ...(node.styles[breakpoint] ?? {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete current[key];
    else current[key] = value;
  }
  const styles = { ...node.styles };
  if (Object.keys(current).length === 0) delete styles[breakpoint];
  else styles[breakpoint] = current;
  return { ...doc, nodes: { ...doc.nodes, [id]: { ...node, styles } } };
}

/** Estilos efectivos en un breakpoint, resolviendo la herencia. */
export function resolveStyles(node: EditorNode, breakpoint: Breakpoint): StyleMap {
  const chain = INHERITANCE[breakpoint];
  const out: StyleMap = {};
  for (const bp of [...chain].reverse()) Object.assign(out, node.styles[bp] ?? {});
  return out;
}

/** `true` si esa propiedad está sobrescrita **en** ese breakpoint (no heredada). */
export function isOverridden(node: EditorNode, breakpoint: Breakpoint, property: string): boolean {
  if (breakpoint === 'desktop') return false;
  return Object.hasOwn(node.styles[breakpoint] ?? {}, property);
}

export function renameNode(doc: EditorDocument, id: string, name: string): EditorDocument {
  const node = doc.nodes[id];
  if (!node) return doc;
  const clean = name.trim().slice(0, 80);
  return { ...doc, nodes: { ...doc.nodes, [id]: { ...node, name: clean || undefined } } };
}

export function toggleFlag(doc: EditorDocument, id: string, flag: 'hidden' | 'locked'): EditorDocument {
  const node = doc.nodes[id];
  if (!node) return doc;
  return { ...doc, nodes: { ...doc.nodes, [id]: { ...node, [flag]: !node[flag] } } };
}

/** Cuenta de nodos sin contar la raíz: la cifra que se enseña en la barra de estado. */
export function countNodes(doc: EditorDocument): number {
  return Object.keys(doc.nodes).length - 1;
}

/* --------------------------------------------------------------- migración --- */

type UnknownDocument = { schemaVersion?: number } & Record<string, unknown>;

/**
 * Sube un documento guardado a la versión actual.
 *
 * Hoy solo hay una versión, así que únicamente valida y completa lo que falte.
 * El interruptor existe para que la versión 2 no obligue a inventar el camino.
 */
export function migrateDocument(raw: UnknownDocument): EditorDocument | null {
  if (!raw || typeof raw !== 'object') return null;
  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0;
  if (version > SCHEMA_VERSION) return null; // documento de una versión futura: no se adivina

  const nodes = raw.nodes as Record<string, EditorNode> | undefined;
  const rootId = raw.rootId as string | undefined;
  if (!nodes || !rootId || !nodes[rootId]) return null;

  return {
    schemaVersion: SCHEMA_VERSION,
    rootId,
    nodes: Object.fromEntries(
      Object.entries(nodes).map(([id, node]) => [
        id,
        {
          ...node,
          id,
          props: node.props ?? {},
          styles: node.styles ?? {},
          children: Array.isArray(node.children) ? node.children : [],
          parentId: node.parentId ?? null,
        },
      ])
    ),
    definitions: (raw.definitions as EditorDocument['definitions']) ?? {},
  };
}
