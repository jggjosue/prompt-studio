import type { AIJobKind } from '@/models/AIGenerationJob';

export const GEMINI_TEXT_MODEL = 'gemini-3.1-flash-lite' as const;

export const GEMINI_WEB_MODELS = {
  [GEMINI_TEXT_MODEL]: { credits: 2, estimatedUsd: 0.01, label: 'Gemini 3.1 Flash-Lite' },
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
