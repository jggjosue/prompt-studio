/**
 * Mutaciones puras sobre `PageSchema`.
 *
 * Toda operación del editor (insertar, mover, reordenar, duplicar, borrar) se
 * resuelve aquí, fuera de React. La UI nunca toca el árbol directamente: pide una
 * mutación y recibe un documento nuevo o un rechazo tipado. Así cada gesto del
 * usuario —arrastrar, pulsar "subir", soltar en un hueco— produce exactamente la
 * misma transformación, y el resultado se puede validar y probar sin DOM.
 *
 * `PageSchema` sigue siendo la única fuente de verdad: estas funciones solo
 * derivan un documento nuevo a partir de otro, nunca mutan la entrada.
 */

import {
  BREAKPOINTS,
  MAX_DEPTH,
  MAX_NODES,
  PAGE_CHILDREN,
  PAGE_PROP_FIELDS,
  countNodes,
  isPageComponentType,
  safeUrl,
  styleValueToCss,
  type Breakpoint,
  type PageComponentType,
  type PageNode,
  type SitePage,
  type SiteSchema,
  type StyleMap,
} from './page-schema';

/* ------------------------------------------------------------------ tipos --- */

/** Props y estilos por defecto de un tipo, según el catálogo. */
export type NodeDefaults = {
  defaultProps: Record<string, unknown>;
  defaultStyles: StyleMap;
};

/** Dependencias inyectadas: mantienen este módulo libre de React y determinista. */
export type OpsDeps = {
  /** Identificador nuevo y válido para un nodo del tipo dado. */
  makeId: (type: PageComponentType) => string;
  /** Valores por defecto del catálogo, o `undefined` si el tipo no existe. */
  defaults: (type: PageComponentType) => NodeDefaults | undefined;
};

/** Posición de un nodo dentro de su página. */
export type DropTarget = {
  /** `null` = primer nivel (sección); si no, el contenedor destino. */
  parentId: string | null;
  /** Índice entre los hermanos; se acota al rango válido. */
  index: number;
};

export type OpsReason =
  | 'unknown-page'
  | 'unknown-node'
  | 'unknown-component'
  | 'invalid-nesting'
  | 'depth-limit'
  | 'node-limit'
  | 'cycle'
  | 'single-instance'
  | 'duplicate-id'
  | 'invalid-target'
  | 'invalid-prop'
  | 'invalid-style';

export type OpsError = { ok: false; reason: OpsReason; message: string };

export type MutateResult = { ok: true; schema: SiteSchema } | OpsError;
export type AddResult = { ok: true; schema: SiteSchema; id: string } | OpsError;

export type RemovedNode = { parentId: string | null; index: number; node: PageNode };
export type RemoveResult = { ok: true; schema: SiteSchema; removed: RemovedNode } | OpsError;

/* --------------------------------------------------------------- auxiliares --- */

/** Localización de un nodo: padre, índice, profundidad (1 = sección) y camino. */
export type NodeLocation = {
  parentId: string | null;
  index: number;
  node: PageNode;
  depth: number;
  trail: PageNode[];
};

export function isContainerType(type: PageComponentType): boolean {
  return PAGE_CHILDREN[type] !== undefined;
}

const error = (reason: OpsReason, message: string): OpsError => ({ ok: false, reason, message });
const clamp = (value: number, min: number, max: number): number =>
  Number.isFinite(value) ? Math.min(Math.max(Math.trunc(value), min), max) : min;

/** Convierte una posición final (estilo `arrayMove`) en un índice-hueco. */
const slotFor = (from: number, to: number): number => (to > from ? to + 1 : to);

function pageOf(schema: SiteSchema, slug?: string): SitePage | undefined {
  if (slug === undefined) return schema.pages[0];
  return schema.pages.find(page => page.slug === slug);
}

function locateIn(
  list: PageNode[],
  id: string,
  parentId: string | null,
  depth: number,
  trail: PageNode[]
): NodeLocation | undefined {
  for (let index = 0; index < list.length; index += 1) {
    const node = list[index];
    if (node.id === id) return { parentId, index, node, depth, trail };
    const found = locateIn(node.children, id, node.id, depth + 1, [...trail, node]);
    if (found) return found;
  }
  return undefined;
}

/** Localiza un nodo por id dentro de una página. */
export function locateNode(page: SitePage, id: string): NodeLocation | undefined {
  return locateIn(page.sections, id, null, 1, []);
}

function isDescendant(node: PageNode, id: string): boolean {
  for (const child of node.children) {
    if (child.id === id || isDescendant(child, id)) return true;
  }
  return false;
}

function subtreeSize(node: PageNode): number {
  let total = 1;
  for (const child of node.children) total += subtreeSize(child);
  return total;
}

function siblingList(page: SitePage, parentId: string | null): PageNode[] | undefined {
  if (parentId === null) return page.sections;
  return locateNode(page, parentId)?.node.children;
}

/** Instantánea del árbol original, para probar que una mutación no lo alteró. */
export function snapshot(schema: SiteSchema): string {
  return JSON.stringify(schema);
}

/* ------------------------------------------------------------------ crear --- */

/** Crea un nodo nuevo con los valores por defecto del catálogo. */
export function createNode(type: PageComponentType, deps: OpsDeps): PageNode | undefined {
  const defaults = deps.defaults(type);
  if (!defaults) return undefined;
  return {
    id: deps.makeId(type),
    type,
    props: { ...defaults.defaultProps },
    styles: Object.keys(defaults.defaultStyles).length ? { desktop: { ...defaults.defaultStyles } } : {},
    children: [],
  };
}

/** Clona un subárbol conservando props y estilos, con identificadores nuevos. */
export function cloneNode(node: PageNode, deps: OpsDeps): PageNode {
  return {
    id: deps.makeId(node.type),
    type: node.type,
    props: structuredClone(node.props),
    styles: structuredClone(node.styles),
    children: node.children.map(child => cloneNode(child, deps)),
  };
}

/* --------------------------------------------------------------- validación --- */

type Placement = { list: PageNode[]; depth: number };

/**
 * Comprueba que un tipo puede colocarse en `target` y devuelve la lista destino.
 *
 * Concentra todas las reglas de árbol: el padre debe existir y ser contenedor, el
 * tipo debe estar entre sus hijos permitidos, y el nivel no puede superar
 * `MAX_DEPTH`.
 */
function resolvePlacement(page: SitePage, target: DropTarget, type: PageComponentType): Placement | OpsError {
  if (target.parentId === null) {
    return { list: page.sections, depth: 1 };
  }

  const parent = locateNode(page, target.parentId);
  if (!parent) return error('unknown-node', `No existe el contenedor ${target.parentId}.`);
  if (!isContainerType(parent.node.type)) {
    return error('invalid-nesting', `${parent.node.type} no admite hijos.`);
  }
  if (!(PAGE_CHILDREN[parent.node.type] ?? []).includes(type)) {
    return error('invalid-nesting', `${parent.node.type} no admite un ${type} dentro.`);
  }
  if (parent.depth + 1 > MAX_DEPTH) {
    return error('depth-limit', `Se alcanzó la profundidad máxima de ${MAX_DEPTH} niveles.`);
  }
  return { list: parent.node.children, depth: parent.depth + 1 };
}

function isOpsError(value: Placement | OpsError): value is OpsError {
  return 'ok' in value && value.ok === false;
}

/** Reglas exclusivas del primer nivel: navbar primera y única, footer único. */
function topLevelError(page: SitePage, type: PageComponentType): OpsError | null {
  if (type === 'navbar' && page.sections.some(section => section.type === 'navbar')) {
    return error('single-instance', 'La página ya tiene una barra de navegación.');
  }
  if (type === 'footer' && page.sections.some(section => section.type === 'footer')) {
    return error('single-instance', 'La página ya tiene un pie de página.');
  }
  return null;
}

/** Índice real donde se colocará el nodo, aplicando navbar/footer. */
function resolveIndex(list: PageNode[], type: PageComponentType, index: number): number {
  if (type === 'navbar') return 0;
  if (type === 'footer') return list.length;
  return clamp(index, 0, list.length);
}

/** Error de colocación de un nodo existente, sin aplicarlo. Usado por el DnD. */
export function canInsert(
  schema: SiteSchema,
  slug: string | undefined,
  target: DropTarget,
  type: PageComponentType
): OpsError | null {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);
  if (type === 'navbar' || type === 'footer') {
    if (target.parentId !== null) {
      return error('invalid-nesting', `${type} solo puede vivir en el primer nivel.`);
    }
    const topError = topLevelError(page, type);
    if (topError) return topError;
  }
  const placement = resolvePlacement(page, target, type);
  if (isOpsError(placement)) return placement;
  if (countNodes(page.sections) + 1 > MAX_NODES) {
    return error('node-limit', `La página alcanzó el máximo de ${MAX_NODES} nodos.`);
  }
  return null;
}

/** Error al mover un nodo a otro destino, sin aplicarlo. */
export function canMove(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  target: DropTarget
): OpsError | null {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);
  const location = locateNode(page, nodeId);
  if (!location) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  if (target.parentId === nodeId) return error('cycle', 'Un nodo no puede contenerse a sí mismo.');
  if (target.parentId !== null && isDescendant(location.node, target.parentId)) {
    return error('cycle', 'Un nodo no puede moverse dentro de su propio subárbol.');
  }
  if (location.node.type === 'navbar' || location.node.type === 'footer') {
    if (target.parentId !== null) {
      return error('invalid-nesting', `${location.node.type} solo puede vivir en el primer nivel.`);
    }
  }
  const placement = resolvePlacement(page, target, location.node.type);
  return isOpsError(placement) ? placement : null;
}

/* -------------------------------------------------------------- operaciones --- */

/**
 * Coloca un nodo ya construido en `target` sobre un documento clonado.
 *
 * Compartida por insertar y mover: así ambos caminos aplican las mismas reglas.
 */
function placeNode(node: PageNode, page: SitePage, target: DropTarget): OpsError | null {
  const placement = resolvePlacement(page, target, node.type);
  if (isOpsError(placement)) return placement;

  if (target.parentId === null) {
    const topError = topLevelError(page, node.type);
    if (topError) return topError;
  }

  const index = resolveIndex(placement.list, node.type, target.index);
  placement.list.splice(index, 0, node);
  return null;
}

/**
 * Añade un componente nuevo a la página.
 *
 * El nodo se construye con `deps.defaults`, de modo que un `pricing` insertado
 * desde la biblioteca llega con sus props y estilos coherentes.
 */
export function addNode(
  schema: SiteSchema,
  slug: string | undefined,
  target: DropTarget,
  type: PageComponentType,
  deps: OpsDeps
): AddResult {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);

  const node = createNode(type, deps);
  if (!node) return error('unknown-component', `El catálogo no conoce el tipo ${type}.`);
  if (locateNode(page, node.id)) return error('duplicate-id', `El identificador ${node.id} ya existe.`);

  const draft = structuredClone(schema);
  const draftPage = pageOf(draft, slug) as SitePage;
  const failure = placeNode(node, draftPage, target);
  if (failure) return failure;
  return { ok: true, schema: draft, id: node.id };
}

/** Alias semántico: insertar en el primer nivel es insertar una sección. */
export function insertSection(
  schema: SiteSchema,
  slug: string | undefined,
  index: number,
  type: PageComponentType,
  deps: OpsDeps
): AddResult {
  return addNode(schema, slug, { parentId: null, index }, type, deps);
}

/**
 * Inserta una sección ya construida (por ejemplo desde la biblioteca de
 * secciones) en el primer nivel de la página, clonándola para no compartir
 * ids con el original.
 */
export function insertSectionNode(
  schema: SiteSchema,
  slug: string | undefined,
  index: number,
  node: PageNode
): AddResult {
  return insertProvidedNode(schema, slug, { parentId: null, index }, node);
}

/**
 * Inserta un nodo ya construido en cualquier destino (primer nivel o contenedor),
 * clonándolo para no compartir ids con el original. Reutilizado por la
 * biblioteca de secciones y por la edición por IA.
 */
export function insertProvidedNode(
  schema: SiteSchema,
  slug: string | undefined,
  target: DropTarget,
  node: PageNode
): AddResult {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);
  if (!isPageComponentType(node.type)) {
    return error('unknown-component', `El catálogo no conoce el tipo ${node.type}.`);
  }
  if (countNodes(page.sections) + countNodes(node.children) + 1 > MAX_NODES) {
    return error('node-limit', `La página alcanzó el máximo de ${MAX_NODES} nodos.`);
  }

  const draft = structuredClone(schema);
  const draftPage = pageOf(draft, slug) as SitePage;
  const cloned = structuredClone(node);
  const failure = placeNode(cloned, draftPage, target);
  if (failure) return failure;
  return { ok: true, schema: draft, id: cloned.id };
}

/** Mueve un nodo (y su subárbol) a otro destino. */
export function moveNode(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  target: DropTarget
): MutateResult {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);

  const failure = canMove(schema, slug, nodeId, target);
  if (failure) return failure;

  const draft = structuredClone(schema);
  const draftPage = pageOf(draft, slug) as SitePage;
  const location = locateNode(draftPage, nodeId) as NodeLocation;

  const sameList = location.parentId === target.parentId;
  const originalList = siblingList(draftPage, location.parentId) as PageNode[];
  originalList.splice(location.index, 1);

  let index = target.index;
  if (sameList && location.index < index) index -= 1;

  const destination = siblingList(draftPage, target.parentId);
  if (!destination) return error('unknown-node', `No existe el contenedor ${target.parentId}.`);
  destination.splice(resolveIndex(destination, location.node.type, index), 0, location.node);

  return { ok: true, schema: draft };
}

/** Reordena una sección a una posición final dentro del primer nivel. */
export function reorderSection(
  schema: SiteSchema,
  slug: string | undefined,
  from: number,
  to: number
): MutateResult {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);
  const node = page.sections[from];
  if (!node) return error('invalid-target', `No hay sección en la posición ${from}.`);
  return moveNode(schema, slug, node.id, { parentId: null, index: slotFor(from, to) });
}

/** Sube o baja un nodo una posición entre sus hermanos. */
export function moveWithinParent(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  delta: number
): MutateResult {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);
  const location = locateNode(page, nodeId);
  if (!location) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  const list = siblingList(page, location.parentId) as PageNode[];
  const target = location.index + delta;
  if (target < 0 || target >= list.length) {
    return error('invalid-target', 'El nodo ya está en el extremo.');
  }
  return moveNode(schema, slug, nodeId, { parentId: location.parentId, index: slotFor(location.index, target) });
}

/** Duplica un subárbol justo después del original, con identificadores nuevos. */
export function duplicateNode(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  deps: OpsDeps
): AddResult {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);
  const location = locateNode(page, nodeId);
  if (!location) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  if (location.node.type === 'navbar' || location.node.type === 'footer') {
    return error('single-instance', `No se puede duplicar ${location.node.type}: solo puede haber uno.`);
  }
  if (countNodes(page.sections) + subtreeSize(location.node) > MAX_NODES) {
    return error('node-limit', `La página alcanzó el máximo de ${MAX_NODES} nodos.`);
  }

  const draft = structuredClone(schema);
  const draftPage = pageOf(draft, slug) as SitePage;
  const draftLocation = locateNode(draftPage, nodeId) as NodeLocation;
  const copy = cloneNode(draftLocation.node, deps);
  if (locateNode(draftPage, copy.id)) return error('duplicate-id', `El identificador ${copy.id} ya existe.`);
  const list = siblingList(draftPage, draftLocation.parentId) as PageNode[];
  list.splice(draftLocation.index + 1, 0, copy);

  return { ok: true, schema: draft, id: copy.id };
}

/** Elimina un nodo y su subárbol. */
export function removeNode(schema: SiteSchema, slug: string | undefined, nodeId: string): RemoveResult {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);
  const location = locateNode(page, nodeId);
  if (!location) return error('unknown-node', `No existe el nodo ${nodeId}.`);

  const draft = structuredClone(schema);
  const draftPage = pageOf(draft, slug) as SitePage;
  const draftLocation = locateNode(draftPage, nodeId) as NodeLocation;
  const list = siblingList(draftPage, draftLocation.parentId) as PageNode[];
  list.splice(draftLocation.index, 1);

  return {
    ok: true,
    schema: draft,
    removed: { parentId: draftLocation.parentId, index: draftLocation.index, node: draftLocation.node },
  };
}

/** Reinserta un subárbol previamente eliminado, en su hueco original. */
export function restoreNode(
  schema: SiteSchema,
  slug: string | undefined,
  removed: RemovedNode
): AddResult {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);

  const draft = structuredClone(schema);
  const draftPage = pageOf(draft, slug) as SitePage;
  const failure = placeNode(removed.node, draftPage, { parentId: removed.parentId, index: removed.index });
  if (failure) return failure;
  return { ok: true, schema: draft, id: removed.node.id };
}

/* ------------------------------------------------------------- inspector --- */

const STYLE_PROPERTY = /^[a-zA-Z][a-zA-Z0-9]*$/;

/** Valor de una prop según su contrato: tipo, opciones y URLs seguras. */
function validateProp(type: PageComponentType, key: string, value: unknown): string | null {
  const field = PAGE_PROP_FIELDS[type].find(item => item.key === key);
  if (!field) return `Propiedad desconocida: ${key}.`;
  switch (field.kind) {
    case 'text':
    case 'textarea':
      return typeof value === 'string' ? null : 'Debe ser texto.';
    case 'url':
    case 'image':
      return safeUrl(value) ? null : 'URL no válida.';
    case 'select':
      return (field.options ?? []).includes(value as string) ? null : 'Valor no permitido.';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value) ? null : 'Debe ser un número.';
    case 'boolean':
      return typeof value === 'boolean' ? null : 'Debe ser booleano.';
    case 'list':
      return Array.isArray(value) ? null : 'Debe ser una lista.';
  }
}

type Found = { page: SitePage; location: NodeLocation };

function requireNode(schema: SiteSchema, slug: string | undefined, nodeId: string): Found | OpsError {
  const page = pageOf(schema, slug);
  if (!page) return error('unknown-page', `No existe la página ${slug ?? '(primera)'}.`);
  const location = locateNode(page, nodeId);
  if (!location) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  return { page, location };
}

/** Cambia una prop del nodo, validada contra el contrato. */
export function setNodeProp(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  key: string,
  value: unknown
): MutateResult {
  const found = requireNode(schema, slug, nodeId);
  if ('ok' in found) return found;
  const problem = validateProp(found.location.node.type, key, value);
  if (problem) return error('invalid-prop', problem);

  const draft = structuredClone(schema);
  const node = locateNode(pageOf(draft, slug) as SitePage, nodeId)?.node;
  if (!node) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  node.props[key] = value;
  return { ok: true, schema: draft };
}

/** Cambia una propiedad de estilo en un breakpoint, validada. */
export function setNodeStyle(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  property: string,
  value: string | number,
  breakpoint: Breakpoint = 'desktop'
): MutateResult {
  const found = requireNode(schema, slug, nodeId);
  if ('ok' in found) return found;
  if (!STYLE_PROPERTY.test(property)) return error('invalid-style', `Propiedad desconocida: ${property}.`);
  if (!(BREAKPOINTS as readonly string[]).includes(breakpoint)) {
    return error('invalid-style', `Breakpoint desconocido: ${breakpoint}.`);
  }
  if (styleValueToCss(property, value) === null) return error('invalid-style', 'Valor de estilo no válido.');

  const draft = structuredClone(schema);
  const node = locateNode(pageOf(draft, slug) as SitePage, nodeId)?.node;
  if (!node) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  node.styles[breakpoint] = { ...(node.styles[breakpoint] ?? {}), [property]: value };
  return { ok: true, schema: draft };
}

/** Quita una propiedad de estilo de un breakpoint (restablecer un control). */
export function clearNodeStyle(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  property: string,
  breakpoint: Breakpoint = 'desktop'
): MutateResult {
  const found = requireNode(schema, slug, nodeId);
  if ('ok' in found) return found;

  const draft = structuredClone(schema);
  const node = locateNode(pageOf(draft, slug) as SitePage, nodeId)?.node;
  if (!node) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  const map = { ...(node.styles[breakpoint] ?? {}) };
  delete map[property];
  node.styles[breakpoint] = map;
  return { ok: true, schema: draft };
}

/** Restablece una prop a su valor por defecto del catálogo. */
export function resetNodeProp(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  key: string,
  defaultProps: Record<string, unknown>
): MutateResult {
  const found = requireNode(schema, slug, nodeId);
  if ('ok' in found) return found;

  const draft = structuredClone(schema);
  const node = locateNode(pageOf(draft, slug) as SitePage, nodeId)?.node;
  if (!node) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  if (key in defaultProps) node.props[key] = defaultProps[key];
  else delete node.props[key];
  return { ok: true, schema: draft };
}

/** Restablece todas las props y estilos a los valores por defecto del catálogo. */
export function resetNode(
  schema: SiteSchema,
  slug: string | undefined,
  nodeId: string,
  defaultProps: Record<string, unknown>
): MutateResult {
  const found = requireNode(schema, slug, nodeId);
  if ('ok' in found) return found;

  const draft = structuredClone(schema);
  const node = locateNode(pageOf(draft, slug) as SitePage, nodeId)?.node;
  if (!node) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  const known = PAGE_PROP_FIELDS[found.location.node.type].map(field => field.key);
  node.props = Object.fromEntries(Object.entries(defaultProps).filter(([key]) => known.includes(key)));
  node.styles = {};
  return { ok: true, schema: draft };
}

/** Quita todos los estilos del nodo, volviendo a los del catálogo. */
export function resetNodeStyles(schema: SiteSchema, slug: string | undefined, nodeId: string): MutateResult {
  const found = requireNode(schema, slug, nodeId);
  if ('ok' in found) return found;

  const draft = structuredClone(schema);
  const node = locateNode(pageOf(draft, slug) as SitePage, nodeId)?.node;
  if (!node) return error('unknown-node', `No existe el nodo ${nodeId}.`);
  node.styles = {};
  return { ok: true, schema: draft };
}
