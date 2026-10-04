/**
 * Canonical Google image-generation configuration.
 *
 * Keep the provider model and REST version in one place so the queue runner,
 * Genkit fallback and production verifier cannot silently drift apart.
 */
export const GOOGLE_IMAGE_MODEL = 'gemini-3.1-flash-image';
export const GOOGLE_IMAGE_API_VERSION = 'v1';
export const GOOGLE_IMAGE_ENDPOINT_LABEL = 'v1/models/:generateContent';

export const RETIRED_GOOGLE_IMAGE_MODELS = new Set([
  'imagen-4.0-generate-001',
  'imagen-4.0-ultra-generate-001',
  'imagen-4.0-fast-generate-001',
  'gemini-2.0-flash-preview-image-generation',
]);

const GOOGLE_IMAGE_MODEL_ALIASES: Record<string, string> = {
  'nano-banana-2-lite': 'gemini-3.1-flash-lite-image',
  'nano-banana-2': 'gemini-3.1-flash-image',
  'nano-banana-pro': 'gemini-3-pro-image',
};

export function googleImageModelFor(requestedModel?: string | null): string {
  const model = requestedModel?.trim();
  if (!model || RETIRED_GOOGLE_IMAGE_MODELS.has(model)) return GOOGLE_IMAGE_MODEL;
  if (GOOGLE_IMAGE_MODEL_ALIASES[model]) return GOOGLE_IMAGE_MODEL_ALIASES[model];
  return model.startsWith('gemini-') ? model : GOOGLE_IMAGE_MODEL;
}
