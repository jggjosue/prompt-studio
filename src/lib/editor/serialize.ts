/**
 * Serialización estable del documento del editor.
 *
 * El documento ya es JSON plano; esto garantiza que **serializar y reparsificar
 * no cambie el significado**: claves ordenadas (idempotente), un parseador que
 * migra y valida antes de devolver, y una huella determinista para comparar
 * estados sin depender del orden de las claves.
 */
import { SCHEMA_VERSION, migrateDocument, type EditorDocument } from '@/lib/editor/document';
import { validateDocument } from '@/lib/editor/constraints';

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const object = value as Record<string, unknown>;
  const keys = Object.keys(object).sort();
  const body = keys.map(key => `${JSON.stringify(key)}:${stableStringify(object[key])}`).join(',');
  return `{${body}}`;
}

export function serializeDocument(doc: EditorDocument): string {
  return stableStringify(doc);
}

export type ParseResult = { document: EditorDocument } | { error: string };

export function parseDocument(json: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return { error: 'JSON inválido' };
  }
  const migrated = migrateDocument(raw as Parameters<typeof migrateDocument>[0]);
  if (!migrated) {
    return { error: 'documento no reconocido o de una versión futura' };
  }
  const violations = validateDocument(migrated);
  if (violations.length > 0) {
    return { error: violations.map(violation => violation.code).join(', ') };
  }
  return { document: migrated };
}

/**
 * Huella determinista del documento: misma información, misma huella,
 * independientemente del orden en que se construyeron las claves.
 */
export function documentFingerprint(doc: EditorDocument): string {
  const json = serializeDocument(doc);
  let hash = 5381;
  for (let i = 0; i < json.length; i += 1) {
    hash = ((hash << 5) + hash + json.charCodeAt(i)) >>> 0;
  }
  return `${SCHEMA_VERSION}:${hash.toString(16).padStart(8, '0')}`;
}

export function assertRoundTrip(doc: EditorDocument): EditorDocument {
  const result = parseDocument(serializeDocument(doc));
  if ('error' in result) throw new Error(`Round-trip inválido: ${result.error}`);
  return result.document;
}