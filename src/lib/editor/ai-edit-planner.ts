/**
 * Edición contextual por IA.
 *
 * Arquitectura: subconjunto del `PageSchema` + id del componente + instrucción
 * → IA → operaciones estructuradas (nunca código ejecutable) → validación contra
 * el documento real → nuevo `PageSchema`.
 *
 * El modelo no edita directamente: devuelve una lista de `AIEditOp`, y la capa
 * `applyAIEditOps` valida cada operación antes de aplicarla.
 */

import { PAGE_CHILDREN, PAGE_COMPONENT_TYPES, type PageComponentType } from './page-schema';
import { AIPlanError } from './ai-site-planner';
import { isAIEditOp, type AIEditOp } from './ai-edit-ops';

const OPS_DOC = [
  '- { "op": "updateProps", "nodeId": string, "props": { clave: valor } }  // solo props del contrato',
  '- { "op": "updateStyles", "nodeId": string, "styles": { desktop|tablet|mobile: { propiedad: valor } } }',
  '- { "op": "addChild", "parentId": string, "index"?: number, "node": { type, props, styles, children } }',
  '- { "op": "removeChild", "nodeId": string }',
  '- { "op": "reorderChildren", "parentId": string, "order": [ids en el nuevo orden] }',
  '- { "op": "replaceSection", "nodeId": string, "node": { type, props, styles, children } }  // solo secciones de primer nivel',
].join('\n');

const CONTAINER_RULES = (Object.entries(PAGE_CHILDREN) as Array<[PageComponentType, readonly PageComponentType[] | undefined]>)
  .filter(([, children]) => children && children.length)
  .map(([type, children]) => `- ${type} acepta: ${(children ?? []).join(', ')}`)
  .join('\n');

export function buildAIEditPrompt(instruction: string, subset: unknown, nodeId: string): { system: string; user: string } {
  const system = [
    'Eres el Asistente de Edición del Website Builder de Prompt Studio.',
    'El usuario da una instrucción sobre un componente o sección concreto del documento PageSchema.',
    'Responde SOLO con un array JSON de operaciones estructuradas, sin markdown, sin comentarios ni código ejecutable.',
    `Operaciones permitidas:\n${OPS_DOC}`,
    `Componentes permitidos: ${PAGE_COMPONENT_TYPES.join(', ')}.`,
    `Anidamiento: solo container y columns aceptan hijos.\n${CONTAINER_RULES}`,
    'Reglas: una navbar única y al inicio; un footer único y al final.',
    'URLs seguras: http(s)://, /ruta, #ancla, mailto:. Prohibido javascript: y data:.',
    'Usa los ids reales del documento. Para addChild y replaceSection, los nodos usan la forma {type, props, styles, children}.',
    'Estilos por breakpoint: desktop (base), tablet, mobile (solo lo que cambia).',
  ].join('\n');
  const user = [
    `Instrucción del usuario: ${instruction}`,
    `Componente o sección objetivo: ${nodeId}`,
    `Estado actual (subconjunto del PageSchema): ${JSON.stringify(subset)}`,
    'Devuelve el array de operaciones JSON.',
  ].join('\n');
  return { system, user };
}

function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  if (fenced) return fenced[1];
  const start = trimmed.indexOf('[');
  const end = trimmed.lastIndexOf(']');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

/** Extrae y valida el array de operaciones que devolvió el modelo. */
export function parseAIEditOps(text: string): AIEditOp[] {
  const stripped = stripFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new AIPlanError('INVALID_JSON', 'El modelo no devolvió un JSON válido.');
  }
  if (!Array.isArray(parsed)) {
    throw new AIPlanError('INVALID_JSON', 'El modelo no devolvió una lista de operaciones.');
  }
  const ops = parsed.filter(isAIEditOp);
  if (!ops.length) {
    throw new AIPlanError('INVALID_JSON', 'El modelo no devolvió operaciones reconocidas.');
  }
  return ops;
}

export type AIEditDeps = {
  callModel: (system: string, user: string, model: string) => Promise<string>;
  model?: string;
};

export type AIEditPlanOutput = { ops: AIEditOp[]; model: string };

/** Orquesta: instrucción + subconjunto → modelo → operaciones estructuradas. */
export async function planAIEdit(
  instruction: string,
  subset: unknown,
  nodeId: string,
  deps: AIEditDeps
): Promise<AIEditPlanOutput> {
  const trimmed = instruction.trim();
  if (!trimmed) throw new AIPlanError('EMPTY_PROMPT', 'Escribe qué cambio quieres.');
  if (trimmed.length > 2000) throw new AIPlanError('INPUT_TOO_LARGE', 'La instrucción es demasiado larga.');

  const model = deps.model ?? 'gemini-2.5-flash';
  const { system, user } = buildAIEditPrompt(trimmed, subset, nodeId);

  let text: string;
  try {
    text = await deps.callModel(system, user, model);
  } catch (error) {
    if (error instanceof AIPlanError) throw error;
    throw new AIPlanError('PROVIDER_ERROR', error instanceof Error ? error.message : 'Error del proveedor de IA.');
  }

  return { ops: parseAIEditOps(text), model };
}