/**
 * Restricciones del documento del editor, aplicables sin la interfaz.
 *
 * Dos niveles:
 *  - `validateDocument`: invariantes estructurales del árbol normalizado
 *    (raíz, coherencia padre/hijo, ids únicos, referencias de instancias).
 *    Rechaza árboles inválidos antes de guardarlos o cargarlos.
 *  - `layoutViolations`: transiciones de estilo con geometría imposible
 *    (dimensiones negativas o no finitas, geometría vacía).
 */
import { BREAKPOINTS, countNodes, SCHEMA_VERSION, type Breakpoint, type EditorDocument, type EditorNode } from '@/lib/editor/document';

export const MAX_NODE_COUNT = 2000;

/** Anchuras de viewport por breakpoint, iguales a las del lienzo del editor. */
export const VIEWPORT_WIDTH: Record<Breakpoint, number> = {
  desktop: 1440,
  laptop: 1024,
  tablet: 768,
  mobile: 375,
};

export const LAYOUT_CONSTRAINTS = {
  /** `left`/`top` no bajan de cero. */
  minPosition: 0,
  /** Dimensiones no negativas y acotadas: un 60.000 px de alto es un error. */
  minDimension: 0,
  maxDimension: 4096,
} as const;

export type DocumentViolation = { code: string; message: string; id?: string };

/** Propiedades geométricas: se validan contra LAYOUT_CONSTRAINTS. */
const GEOMETRY_KEYS = new Set(['left', 'top', 'width', 'height']);

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export type StyleViolation = { property: string; message: string };

/** Transiciones de estilo con geometría imposible o valores rotos. */
export function layoutViolations(
  patch: Record<string, string | number | null>,
  breakpoint: Breakpoint
): StyleViolation[] {
  const violations: StyleViolation[] = [];
  for (const [property, value] of Object.entries(patch)) {
    if (value === null) continue;
    if (GEOMETRY_KEYS.has(property)) {
      if (typeof value === 'number') {
        const dimensionOk = property === 'left' || property === 'top'
          ? value >= LAYOUT_CONSTRAINTS.minPosition
          : value >= LAYOUT_CONSTRAINTS.minDimension && value <= LAYOUT_CONSTRAINTS.maxDimension;
        if (!Number.isFinite(value) || !dimensionOk) {
          violations.push({ property, message: `${property} fuera de límites (${value}) en ${breakpoint}` });
        }
      } else if (!isNonEmptyString(value)) {
        violations.push({ property, message: `${property} no puede estar vacío en ${breakpoint}` });
      }
      continue;
    }
    // Fuera de la geometría, CSS acepta negativos (margen, z-index): solo se
    // exige que el valor sea un número finito o una cadena no vacía.
    if (!isFiniteNumber(value) && !isNonEmptyString(value)) {
      violations.push({ property, message: `${property} no es un valor de estilo válido en ${breakpoint}` });
    }
  }
  return violations;
}

function invalidStyles(node: EditorNode): boolean {
  if (!node.styles || typeof node.styles !== 'object') return true;
  for (const [breakpoint, styleMap] of Object.entries(node.styles)) {
    if (!(BREAKPOINTS as readonly string[]).includes(breakpoint)) return true;
    if (!styleMap || typeof styleMap !== 'object' || Array.isArray(styleMap)) return true;
  }
  return false;
}

/** Invariantes estructurales del árbol normalizado. */
export function validateDocument(doc: EditorDocument): DocumentViolation[] {
  const violations: DocumentViolation[] = [];
  if (!doc || typeof doc !== 'object') {
    return [{ code: 'document-invalid', message: 'El documento no es un objeto válido.' }];
  }
  if (doc.schemaVersion !== SCHEMA_VERSION) {
    violations.push({ code: 'schema-version', message: `Versión de esquema ${doc.schemaVersion} no soportada (actual ${SCHEMA_VERSION}).` });
  }

  const root = doc.nodes[doc.rootId];
  if (!root) {
    violations.push({ code: 'root-missing', message: 'La raíz no existe entre los nodos.' });
    return violations;
  }
  if (root.type !== 'root') {
    violations.push({ code: 'root-type', message: `La raíz debe ser de tipo root, no ${root.type}.`, id: root.id });
  }
  if (root.parentId !== null) {
    violations.push({ code: 'root-parent', message: 'La raíz no puede tener padre.', id: root.id });
  }

  const inParents = new Map<string, string>();
  for (const [id, node] of Object.entries(doc.nodes)) {
    if (id !== node.id) {
      violations.push({ code: 'id-mismatch', message: `La clave ${id} no coincide con el id del nodo.`, id });
    }
    if (invalidStyles(node)) {
      violations.push({ code: 'invalid-styles', message: 'La estructura de estilos del nodo no es válida.', id: node.id });
    }
    if (node.instanceOf && !doc.definitions[node.instanceOf.definitionId]) {
      violations.push({ code: 'instance-definition-missing', message: 'La definición de la instancia no existe.', id: node.id });
    }
    const seen = new Set<string>();
    for (const child of node.children) {
      if (seen.has(child)) violations.push({ code: 'duplicate-children', message: 'El mismo hijo aparece dos veces.', id });
      seen.add(child);
      if (!doc.nodes[child]) violations.push({ code: 'dangling-child', message: `El hijo ${child} no existe entre los nodos.`, id });
      if (inParents.has(child)) violations.push({ code: 'two-parents', message: `El nodo ${child} vive bajo dos padres.`, id });
      inParents.set(child, id);
      if (child === doc.rootId) violations.push({ code: 'root-in-children', message: 'La raíz no puede ser hija de nadie.', id });
    }
  }

  for (const [id, node] of Object.entries(doc.nodes)) {
    if (node.parentId === null) continue;
    const parent = doc.nodes[node.parentId];
    if (!parent) {
      violations.push({ code: 'dangling-parent', message: `El padre ${node.parentId} no existe.`, id });
    } else if (!parent.children.includes(id)) {
      violations.push({ code: 'parent-mismatch', message: 'El padre no lista al nodo entre sus hijos.', id });
    }
  }

  for (const definition of Object.values(doc.definitions)) {
    if (!doc.nodes[definition.rootId]) {
      violations.push({ code: 'definition-root-missing', message: `La raíz de la definición ${definition.rootId} no existe.` });
    }
  }

  if (countNodes(doc) > MAX_NODE_COUNT) {
    violations.push({ code: 'too-many-nodes', message: `El documento supera los ${MAX_NODE_COUNT} nodos.` });
  }

  return violations;
}

export function isValidDocument(doc: EditorDocument): boolean {
  return validateDocument(doc).length === 0;
}