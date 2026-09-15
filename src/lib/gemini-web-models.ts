import type { AIJobKind } from '@/models/AIGenerationJob';

export const GEMINI_WEB_MODELS = {
  'gemini-2.5-flash': { credits: 2, estimatedUsd: 0.08, label: 'Gemini 2.5 Flash' },
  'gemini-2.5-pro': { credits: 5, estimatedUsd: 0.25, label: 'Gemini 2.5 Pro' },
  'gemini-2.0-flash': { credits: 2, estimatedUsd: 0.06, label: 'Gemini 2.0 Flash' },
} as const;

export type GeminiWebModel = keyof typeof GEMINI_WEB_MODELS;

export function isGeminiWebModel(value: unknown): value is GeminiWebModel {
  return typeof value === 'string' && value in GEMINI_WEB_MODELS;
}

/** The quote is server-owned: browser input can select a model, never its price. */
export function geminiWebQuote(kind: AIJobKind, model: GeminiWebModel) {
  const modelQuote = GEMINI_WEB_MODELS[model];
  // Gemini is available for web/project jobs. Images and video retain their
  // provider-specific pricing from the normal job configuration.
  if (kind !== 'project') return null;
  return { credits: modelQuote.credits, estimatedUsd: modelQuote.estimatedUsd, model: modelQuote.label };
}
