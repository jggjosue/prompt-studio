/**
 * Objetivos de optimización de prompts.
 *
 * Vive fuera de `optimize-prompt.ts` por dos motivos, y ambos rompieron algo:
 *
 * 1. Ese fichero lleva `'use server'`, y Next **solo admite exportaciones de
 *    funciones asíncronas** en un fichero así. Exportar el esquema de Zod desde
 *    allí hacía fallar el build con `A "use server" file can only export async
 *    functions, found object` — después de compilar, al recopilar datos de
 *    página.
 * 2. Importar el flujo arrastra `@/ai/genkit`, que no resuelve al ejecutar los
 *    tests con Node a secas.
 *
 * Módulo sin dependencias a propósito: cualquier import añadido aquí viaja
 * también a la ruta de API y a los tests.
 */

export const PROMPT_GOALS = [
  'lower-cost',
  'consistency',
  'realism',
  'fewer-hallucinations',
  'structured-output',
  'provider-adaptation',
  'translation',
] as const;

export type PromptGoal = (typeof PROMPT_GOALS)[number];

export function isPromptGoal(value: unknown): value is PromptGoal {
  return typeof value === 'string' && (PROMPT_GOALS as readonly string[]).includes(value);
}
