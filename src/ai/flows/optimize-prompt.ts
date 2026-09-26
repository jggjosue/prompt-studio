'use server';
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { PROMPT_GOALS } from '@/ai/flows/prompt-goals';

/**
 * Interno a propósito: este fichero es `'use server'` y no puede exportar
 * objetos. La lista de objetivos, que sí necesitan la ruta y los tests, está en
 * `@/ai/flows/prompt-goals`.
 */
const PromptGoalSchema = z.enum(PROMPT_GOALS);
const InputSchema = z.object({
  prompt: z.string().min(10).max(20_000),
  goals: z.array(PromptGoalSchema).min(1).max(7),
  sourceProvider: z.string().max(40),
  targetProvider: z.string().max(40),
  targetLanguage: z.string().max(40),
});
const OutputSchema = z.object({
  optimizedPrompt: z.string().min(10).max(20_000),
  summary: z.string().min(10).max(800),
  changes: z.array(z.object({ goal: PromptGoalSchema, change: z.string().min(5).max(500), reason: z.string().min(5).max(500) })).min(1).max(14),
  preservedIntent: z.array(z.string().min(2).max(300)).min(1).max(10),
  warnings: z.array(z.string().min(2).max(400)).max(8),
});
export type OptimizePromptInput = z.infer<typeof InputSchema>;
export type OptimizePromptOutput = z.infer<typeof OutputSchema>;

const optimizer = ai.definePrompt({
  name: 'objectivePromptOptimizer', input: { schema: InputSchema }, output: { schema: OutputSchema },
  prompt: `You are a rigorous prompt engineer. Rewrite the supplied prompt only to satisfy the selected objectives while preserving its original task, constraints, facts, safety boundaries, variables and desired audience.

ORIGINAL PROMPT:
{{{prompt}}}

OBJECTIVES: {{{goals}}}
SOURCE PROVIDER: {{{sourceProvider}}}
TARGET PROVIDER: {{{targetProvider}}}
TARGET LANGUAGE: {{{targetLanguage}}}

Rules:
- Never invent facts, examples, tool capabilities, prices or guarantees.
- Lower cost by removing redundancy and unnecessary output, not essential requirements.
- Improve consistency with explicit role, inputs, constraints, procedure and acceptance criteria.
- Improve realism with physically plausible detail and restrained language when the task is visual.
- Reduce hallucinations by requiring uncertainty disclosure, source boundaries and no unsupported claims.
- For structured output, specify a strict, practical schema and prohibit prose outside it.
- Adapt syntax to the target provider without claiming unsupported features.
- Translate semantic intent, variables, proper nouns, formatting and constraints exactly.
- Return the complete optimized prompt plus a concise, goal-by-goal explanation in the requested structured fields.`,
});
const flow = ai.defineFlow({ name: 'objectivePromptOptimizerFlow', inputSchema: InputSchema, outputSchema: OutputSchema }, async input => {
  const { output } = await optimizer(input);
  if (!output) throw new Error('No structured optimization returned.');
  return output;
});
export async function optimizePrompt(input: OptimizePromptInput) { return flow(input); }
