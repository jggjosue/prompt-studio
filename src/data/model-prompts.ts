/**
 * Registro estático de los catálogos de prompts por modelo.
 *
 * Antes se leían del disco con `path.join(process.cwd(), 'public/prompts/…')`.
 * Al sacar las fuentes de `public/` esa ruta dejó de existir, y aunque se
 * ajustara seguiría siendo frágil: un fichero bajo `src/` al que solo se llega
 * por una ruta construida en runtime no lo incluye el trazado de dependencias
 * de Next, así que funcionaría en local y fallaría en producción.
 *
 * Con imports estáticos el bundler los empaqueta y el fallo, si lo hubiera,
 * sería en build y no en una petición de usuario.
 *
 * Solo hay tres ficheros. Los modelos de `src/lib/models-data.ts` (`veo-3-1`,
 * `nano-banana-pro`, `sora-2-pro`, `flux-2-pro`, `z-image`) no tienen catálogo
 * propio: antes caían en el `catch` silenciosamente y ahora devuelven `null`
 * de forma explícita.
 */
import ampPrompts from './prompts/amp.json';
import anthropicPrompts from './prompts/anthropic.json';
import claudeChromePrompts from './prompts/claude-chrome.json';
import type { ChromeToolRaw } from '@/lib/prompt-catalog';

const MODEL_PROMPTS: Record<string, unknown> = {
  amp: ampPrompts,
  anthropic: anthropicPrompts,
};

/** Catálogo de un modelo, o `null` si no tiene. */
export function getModelPromptData(modelId: string): unknown | null {
  return MODEL_PROMPTS[modelId] ?? null;
}

/**
 * Herramientas de Chrome, que se combinan con el catálogo de Anthropic.
 * El JSON es un array en la raíz, con la forma que espera `ChromeToolRaw`.
 */
export function getClaudeChromeData(): ChromeToolRaw[] {
  return claudeChromePrompts as unknown as ChromeToolRaw[];
}
