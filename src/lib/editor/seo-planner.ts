/**
 * Generación de SEO por IA.
 *
 * El modelo devuelve un **patch estructurado** de SEO (title, description, og…),
 * nunca HTML ni código. El resultado se valida (longitudes, URLs) y se muestra
 * **editable** antes de guardarlo en la página. Reutiliza la infra de IA y de
 * créditos existente.
 */

import { AIPlanError } from './ai-site-planner';
import { validateSeoPatch, type SeoPatch } from './page-seo';

export function buildSeoPrompt(instruction: string, pageContext: unknown, hostname: string): { system: string; user: string } {
  const system = [
    'Eres el asistente de SEO del Website Builder de Prompt Studio.',
    'Dado el contexto de una página publicada, genera metadatos SEO en español o inglés según la instrucción.',
    'Responde SOLO con un objeto JSON, sin markdown ni comentarios.',
    'Formato: {"title": string ≤ 70 caracteres, "description": string ≤ 165, "ogTitle": string, "ogDescription": string, "ogImage"?: ruta /images/… o URL http(s)}.',
    'El título debe ser claro y accionable; la descripción debe invitar al clic sin relleno.',
    'No inventes imágenes: si no hay una imagen del sitio, omite ogImage.',
  ].join('\n');
  const user = [
    `Instrucción: ${instruction}`,
    `Hostname del sitio: ${hostname}`,
    `Contexto de la página: ${JSON.stringify(pageContext)}`,
    'Devuelve el objeto JSON de SEO.',
  ].join('\n');
  return { system, user };
}

function stripFences(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  if (fenced) return fenced[1];
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);
  return trimmed;
}

/** Extrae y valida el patch de SEO que devolvió el modelo. */
export function parseSeoResult(text: string): SeoPatch {
  const stripped = stripFences(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch {
    throw new AIPlanError('INVALID_JSON', 'El modelo no devolvió un JSON válido.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new AIPlanError('INVALID_JSON', 'El modelo no devolvió un objeto de SEO.');
  }
  const record = parsed as Record<string, unknown>;
  const patch: SeoPatch = {};
  for (const key of ['title', 'description', 'ogTitle', 'ogDescription', 'ogImage'] as const) {
    if (typeof record[key] === 'string' && record[key].trim()) patch[key] = (record[key] as string).trim();
  }
  const errors = validateSeoPatch(patch);
  if (errors.length) throw new AIPlanError('INVALID_SCHEMA', errors[0]);
  if (!patch.title && !patch.description) {
    throw new AIPlanError('INVALID_SCHEMA', 'El modelo no devolvió título ni descripción.');
  }
  return patch;
}

export type SeoDeps = {
  callModel: (system: string, user: string, model: string) => Promise<string>;
  model?: string;
};

export type SeoPlanOutput = { seo: SeoPatch; model: string };

export async function planSeo(
  instruction: string,
  pageContext: unknown,
  hostname: string,
  deps: SeoDeps
): Promise<SeoPlanOutput> {
  const trimmed = instruction.trim();
  if (!trimmed) throw new AIPlanError('EMPTY_PROMPT', 'Escribe qué SEO quieres generar.');
  if (trimmed.length > 2000) throw new AIPlanError('INPUT_TOO_LARGE', 'La instrucción es demasiado larga.');

  const model = deps.model ?? 'gemini-2.5-flash';
  const { system, user } = buildSeoPrompt(trimmed, pageContext, hostname);

  let text: string;
  try {
    text = await deps.callModel(system, user, model);
  } catch (error) {
    if (error instanceof AIPlanError) throw error;
    throw new AIPlanError('PROVIDER_ERROR', error instanceof Error ? error.message : 'Error del proveedor de IA.');
  }

  return { seo: parseSeoResult(text), model };
}