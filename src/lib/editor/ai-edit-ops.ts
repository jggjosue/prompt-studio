/**
 * Operaciones estructuradas de edición por IA.
 *
 * El modelo devuelve una lista de operaciones tipadas (nunca código ejecutable).
 * Cada operación se valida contra el `PageSchema` real antes de aplicarse: nodos
 * existentes, anidamiento permitido, props según el contrato, estilos seguros y
 * reordenaciones que sean permutaciones de los hijos actuales. Lo que no pasa la
 * validación se rechaza con un mensaje; nunca se aplica a ciegas.
 *
 * Además, el documento compuesto se valida una última vez antes de devolverlo:
 * es lo que entra al lienzo, y una combinación de operaciones individualmente
 * válidas no garantiza por sí sola que el resultado lo sea.
 */

import {
  PAGE_CHILDREN,
  PAGE_PROP_FIELDS,
  isPageComponentType,
  safeUrl,
  styleValueToCss,
  validatePageSchema,
  type NodeStyles,
  type PageComponentType,
  type PageNode,
  type SiteSchema,
  type StyleMap,
} from './page-schema';
import {
  cloneNode,
  insertProvidedNode,
  locateNode,
  removeNode,
  type OpsDeps,
} from './page-schema-ops';

export type AIEditOp =
  | { op: 'updateProps'; nodeId: string; props: Record<string, unknown> }
  | { op: 'updateStyles'; nodeId: string; styles: NodeStyles }
  | { op: 'addChild'; parentId: string; index?: number; node: PageNode }
  | { op: 'removeChild'; nodeId: string }
  | { op: 'reorderChildren'; parentId: string; order: string[] }
  | { op: 'replaceSection'; nodeId: string; node: PageNode };

export type AIEditOutcome =
  | { ok: true; schema: SiteSchema; applied: AIEditOp[]; rejected: string[] }
  | { ok: false; error: string; rejected: string[] };

const AI_EDIT_OP_TYPES = [
  'updateProps',
  'updateStyles',
  'addChild',
  'removeChild',
  'reorderChildren',
  'replaceSection',
] as const;

export function isAIEditOp(value: unknown): value is AIEditOp {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const op = value as Record<string, unknown>;
  const hasTarget = typeof op.nodeId === 'string' || typeof op.parentId === 'string';
  if (!hasTarget) return false;
  return (AI_EDIT_OP_TYPES as readonly string[]).includes(String(op.op));
}

function pageOf(schema: SiteSchema, slug: string | undefined) {
  return slug === undefined ? schema.pages[0] : schema.pages.find(page => page.slug === slug);
}

/** Valida una prop contra el contrato y devuelve el valor limpio, o `undefined`. */
function cleanProp(type: PageComponentType, key: string, value: unknown): unknown {
  const field = PAGE_PROP_FIELDS[type].find(item => item.key === key);
  if (!field) return undefined;
  switch (field.kind) {
    case 'text':
    case 'textarea':
      return typeof value === 'string' ? value : undefined;
    case 'url':
    case 'image':
      return safeUrl(value);
    case 'select':
      return (field.options ?? []).includes(value as string) ? value : undefined;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    case 'boolean':
      return typeof value === 'boolean' ? value : undefined;
    case 'list':
      return Array.isArray(value) ? value : undefined;
  }
}

function cleanStyles(raw: unknown): NodeStyles {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out: NodeStyles = {};
  for (const breakpoint of ['desktop', 'tablet', 'mobile'] as const) {
    const map = (raw as Record<string, unknown>)[breakpoint];
    if (!map || typeof map !== 'object' || Array.isArray(map)) continue;
    const clean: StyleMap = {};
    for (const [property, value] of Object.entries(map as Record<string, unknown>)) {
      if (typeof value !== 'string' && typeof value !== 'number') continue;
      if (styleValueToCss(property, value) === null) continue;
      clean[property] = value;
    }
    if (Object.keys(clean).length) out[breakpoint] = clean;
  }
  return out;
}

function applyOne(schema: SiteSchema, slug: string | undefined, op: AIEditOp, deps: OpsDeps):
  | { schema: SiteSchema }
  | { error: string } {
  const page = pageOf(schema, slug);
  if (!page) return { error: 'Página no encontrada.' };

  switch (op.op) {
    case 'updateProps': {
      const location = locateNode(page, op.nodeId);
      if (!location) return { error: `Nodo desconocido: ${op.nodeId}` };
      const node = location.node;
      const props: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(op.props ?? {})) {
        const clean = cleanProp(node.type, key, value);
        if (clean !== undefined) props[key] = clean;
      }
      if (!Object.keys(props).length) return { error: `Ninguna prop válida para ${op.nodeId}.` };

      const draft = structuredClone(schema);
      const draftPage = pageOf(draft, slug);
      const target = locateNode(draftPage!, op.nodeId)?.node;
      if (!target) return { error: `Nodo desconocido: ${op.nodeId}` };
      Object.assign(target.props, props);
      return { schema: draft };
    }

    case 'updateStyles': {
      const location = locateNode(page, op.nodeId);
      if (!location) return { error: `Nodo desconocido: ${op.nodeId}` };
      const styles = cleanStyles(op.styles);
      if (!Object.keys(styles).length) return { error: `Estilos inválidos para ${op.nodeId}.` };

      const draft = structuredClone(schema);
      const draftPage = pageOf(draft, slug);
      const target = locateNode(draftPage!, op.nodeId)?.node;
      if (!target) return { error: `Nodo desconocido: ${op.nodeId}` };
      for (const [breakpoint, map] of Object.entries(styles) as Array<[keyof NodeStyles, StyleMap]>) {
        if (target.styles[breakpoint]) Object.assign(target.styles[breakpoint], map);
        else target.styles[breakpoint] = { ...map };
      }
      return { schema: draft };
    }

    case 'addChild': {
      const parent = locateNode(page, op.parentId);
      if (!parent) return { error: `Contenedor desconocido: ${op.parentId}` };
      if (!isPageComponentType(op.node.type)) return { error: `Tipo desconocido: ${op.node.type}` };
      if (!(PAGE_CHILDREN[parent.node.type] ?? []).includes(op.node.type)) {
        return { error: `${parent.node.type} no admite ${op.node.type}.` };
      }
      const cloned = cloneNode(op.node, deps);
      const result = insertProvidedNode(schema, slug, { parentId: op.parentId, index: op.index ?? parent.node.children.length }, cloned);
      if (!result.ok) return { error: result.message };
      return { schema: result.schema };
    }

    case 'removeChild': {
      const result = removeNode(schema, slug, op.nodeId);
      if (!result.ok) return { error: result.message };
      return { schema: result.schema };
    }

    case 'reorderChildren': {
      const parent = locateNode(page, op.parentId);
      if (!parent) return { error: `Contenedor desconocido: ${op.parentId}` };
      const current = parent.node.children.map(child => child.id);
      if (!Array.isArray(op.order)) return { error: 'Orden inválido.' };
      const unique = [...new Set(op.order)];
      if (unique.length !== current.length || current.some(id => !op.order.includes(id))) {
        return { error: 'El orden debe ser una permutación de los hijos actuales.' };
      }
      const draft = structuredClone(schema);
      const draftPage = pageOf(draft, slug);
      const target = locateNode(draftPage!, op.parentId)?.node;
      if (!target) return { error: `Contenedor desconocido: ${op.parentId}` };
      target.children = op.order.map(id => target.children.find(child => child.id === id)!);
      return { schema: draft };
    }

    case 'replaceSection': {
      const location = locateNode(page, op.nodeId);
      if (!location) return { error: `Nodo desconocido: ${op.nodeId}` };
      if (location.parentId !== null) return { error: 'Solo se pueden reemplazar secciones de primer nivel.' };
      if (!isPageComponentType(op.node.type)) return { error: `Tipo desconocido: ${op.node.type}` };

      const removed = removeNode(schema, slug, op.nodeId);
      if (!removed.ok) return { error: removed.message };
      const cloned = cloneNode(op.node, deps);
      const inserted = insertProvidedNode(removed.schema, slug, { parentId: null, index: location.index }, cloned);
      if (!inserted.ok) return { error: inserted.message };
      return { schema: inserted.schema };
    }
  }
}

/**
 * Aplica una lista de operaciones de IA, validando cada una contra el documento.
 * Las operaciones inválidas se descartan con su motivo; el resto se aplica.
 */
export function applyAIEditOps(
  schema: SiteSchema,
  slug: string | undefined,
  ops: readonly AIEditOp[],
  deps: OpsDeps
): AIEditOutcome {
  let current = structuredClone(schema);
  const applied: AIEditOp[] = [];
  const rejected: string[] = [];

  for (const op of ops) {
    const result = applyOne(current, slug, op, deps);
    if ('error' in result) {
      rejected.push(result.error);
      continue;
    }
    current = result.schema;
    applied.push(op);
  }

  if (!applied.length) {
    return { ok: false, error: rejected[0] ?? 'Ninguna operación pudo aplicarse.', rejected };
  }

  // Puerta final. Cada operación se validó por separado, pero lo que entra al
  // lienzo es el documento compuesto: una combinación de operaciones
  // individualmente válidas podría aun así dejarlo inválido. Se comprueba con el
  // mismo validador que usa el resto del editor y, si falla, no se aplica nada
  // — mejor un «no se pudo aplicar» que un schema roto en el documento.
  if (!validatePageSchema(current).ok) {
    rejected.push('La edición dejaba el documento inválido; no se ha aplicado.');
    return {
      ok: false,
      error: 'La edición resultaba en un documento inválido, así que se ha descartado.',
      rejected,
    };
  }

  return { ok: true, schema: current, applied, rejected };
}

/** Describe una operación en lenguaje humano, para el diff/preview. */
export function describeAIEditOp(op: AIEditOp): string {
  switch (op.op) {
    case 'updateProps':
      return `Actualizar props de ${op.nodeId} (${Object.keys(op.props ?? {}).join(', ') || 'vacío'})`;
    case 'updateStyles':
      return `Actualizar estilos de ${op.nodeId}`;
    case 'addChild':
      return `Añadir ${op.node.type} dentro de ${op.parentId}`;
    case 'removeChild':
      return `Eliminar ${op.nodeId}`;
    case 'reorderChildren':
      return `Reordenar hijos de ${op.parentId}`;
    case 'replaceSection':
      return `Reemplazar ${op.nodeId} por ${op.node.type}`;
  }
}