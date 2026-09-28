import type { AIJobKind } from '@/models/AIGenerationJob';
import { GOOGLE_IMAGE_MODEL } from '@/lib/google-image-config';

export type AIModelCategory = 'text' | 'project' | 'image' | 'video';

export type AIModelConfig = {
  provider: string;
  modelId: string;
  category: AIModelCategory;
  minimumCredits: number;
  inputTokenPriceUsdPerMillion?: number | null;
  outputTokenPriceUsdPerMillion?: number | null;
  imagePriceUsd?: number | null;
  videoPriceUsdPerSecond?: number | null;
  defaultOutputTokens: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  maxCredits: number;
  enabled: boolean;
  pricingStatus: 'verified' | 'legacy-estimate' | 'unverified';
};

export const TARGET_COST_PER_CREDIT_USD = 0.005;
export const DEFAULT_MAX_INPUT_CHARS = 1_000_000;
export const DEFAULT_MAX_CREDITS_PER_GENERATION = 100;

const model = (config: Omit<AIModelConfig, 'maxCredits' | 'maxInputTokens' | 'maxOutputTokens'> & Partial<Pick<AIModelConfig, 'maxCredits' | 'maxInputTokens' | 'maxOutputTokens'>>): AIModelConfig => ({
  maxCredits: config.maxCredits ?? DEFAULT_MAX_CREDITS_PER_GENERATION,
  maxInputTokens: config.maxInputTokens ?? 200_000,
  maxOutputTokens: config.maxOutputTokens ?? 8_000,
  ...config,
});

/**
 * The keys are intentionally explicit. A client may request a model, but it
 * can only select one that is present and enabled in this server-owned map.
 * Pricing marked legacy-estimate must be replaced when that provider is used
 * in production; it is never inferred from a client-supplied value.
 */
export const AI_MODEL_CONFIG: Record<string, AIModelConfig> = {
   'google:gemini-2.5-flash': model({ provider: 'google', modelId: 'gemini-2.5-flash', category: 'project', minimumCredits: 20, inputTokenPriceUsdPerMillion: 0.30, outputTokenPriceUsdPerMillion: 2.50, defaultOutputTokens: 4_000, pricingStatus: 'verified', enabled: true }),
   'google:gemini-2.0-flash': model({ provider: 'google', modelId: 'gemini-2.0-flash', category: 'project', minimumCredits: 10, inputTokenPriceUsdPerMillion: null, outputTokenPriceUsdPerMillion: null, defaultOutputTokens: 4_000, pricingStatus: 'unverified', enabled: true }),
   'google:gemini-2.5-pro': model({ provider: 'google', modelId: 'gemini-2.5-pro', category: 'project', minimumCredits: 50, inputTokenPriceUsdPerMillion: 1.25, outputTokenPriceUsdPerMillion: 10, defaultOutputTokens: 4_000, pricingStatus: 'verified', enabled: true }),
   [`google:${GOOGLE_IMAGE_MODEL}`]: model({ provider: 'google', modelId: GOOGLE_IMAGE_MODEL, category: 'image', minimumCredits: 10, imagePriceUsd: null, defaultOutputTokens: 0, pricingStatus: 'unverified', enabled: true }),
   // Compatibility aliases exposed by the product UI. They all resolve to the
   // current Google image model; the retired Imagen 4 endpoint is never called.
   'google:imagen-4.0-fast-generate-001': model({ provider: 'google', modelId: GOOGLE_IMAGE_MODEL, category: 'image', minimumCredits: 10, imagePriceUsd: null, defaultOutputTokens: 0, pricingStatus: 'unverified', enabled: true }),
   'google:nano-banana-2-lite': model({ provider: 'google', modelId: GOOGLE_IMAGE_MODEL, category: 'image', minimumCredits: 5, imagePriceUsd: null, defaultOutputTokens: 0, pricingStatus: 'unverified', enabled: true }),
   'google:nano-banana-2': model({ provider: 'google', modelId: GOOGLE_IMAGE_MODEL, category: 'image', minimumCredits: 10, imagePriceUsd: null, defaultOutputTokens: 0, pricingStatus: 'unverified', enabled: true }),
   'google:nano-banana-pro': model({ provider: 'google', modelId: GOOGLE_IMAGE_MODEL, category: 'image', minimumCredits: 25, imagePriceUsd: null, defaultOutputTokens: 0, pricingStatus: 'unverified', enabled: true }),
   'google:veo-2.0-generate-001': model({ provider: 'google', modelId: 'veo-2.0-generate-001', category: 'video', minimumCredits: 20, videoPriceUsdPerSecond: null, defaultOutputTokens: 0, pricingStatus: 'unverified', enabled: true }),
   'google:veo-fast': model({ provider: 'google', modelId: 'veo-2.0-generate-001', category: 'video', minimumCredits: 60, videoPriceUsdPerSecond: null, defaultOutputTokens: 0, pricingStatus: 'verified', enabled: true }),
   'google:veo-quality': model({ provider: 'google', modelId: 'veo-2.0-generate-001', category: 'video', minimumCredits: 120, videoPriceUsdPerSecond: null, defaultOutputTokens: 0, pricingStatus: 'verified', enabled: true }),
   'google:veo-cinematic': model({ provider: 'google', modelId: 'veo-2.0-generate-001', category: 'video', minimumCredits: 400, videoPriceUsdPerSecond: null, defaultOutputTokens: 0, pricingStatus: 'verified', enabled: true }),
   'openai:gpt-4o': model({ provider: 'openai', modelId: 'gpt-4o', category: 'project', minimumCredits: 4, inputTokenPriceUsdPerMillion: 2.50, outputTokenPriceUsdPerMillion: 10, defaultOutputTokens: 4_000, pricingStatus: 'legacy-estimate', enabled: true }),
   'openai:dall-e-3': model({ provider: 'openai', modelId: 'dall-e-3', category: 'image', minimumCredits: 10, imagePriceUsd: 0.04, defaultOutputTokens: 0, pricingStatus: 'legacy-estimate', enabled: true }),
   'openai:gpt-image-1-mini': model({ provider: 'openai', modelId: 'gpt-image-1-mini', category: 'image', minimumCredits: 15, imagePriceUsd: null, defaultOutputTokens: 0, pricingStatus: 'unverified', enabled: true }),
   'fal:fal-ai/flux/schnell': model({ provider: 'fal', modelId: 'fal-ai/flux/schnell', category: 'image', minimumCredits: 10, imagePriceUsd: null, defaultOutputTokens: 0, pricingStatus: 'unverified', enabled: true }),
   'anthropic:claude-3-5-sonnet-20240620': model({ provider: 'anthropic', modelId: 'claude-3-5-sonnet-20240620', category: 'project', minimumCredits: 8, inputTokenPriceUsdPerMillion: 3, outputTokenPriceUsdPerMillion: 15, defaultOutputTokens: 4_000, pricingStatus: 'legacy-estimate', enabled: true }),
 };

export type CreditEstimateInput = {
  provider: string;
  model: string;
  kind: AIJobKind;
  input: unknown;
  outputTokens?: number;
  imageCount?: number;
  videoDurationSeconds?: number;
};

export type CreditEstimate = {
  credits: number;
  estimatedApiCostUsd: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  maxCredits: number;
  pricingStatus: AIModelConfig['pricingStatus'];
};

export function getAIModelConfig(provider: string, modelId: string): AIModelConfig | null {
  const config = AI_MODEL_CONFIG[`${provider.toLowerCase()}:${modelId}`];
  return config?.enabled ? config : null;
}

export function resolveAIModelId(kind: AIJobKind, provider: string, requestedModel?: string): string | null {
  const explicit = requestedModel?.trim();
  if (explicit) {
    const config = getAIModelConfig(provider, explicit);
    return config && (config.category === kind || (kind === 'project' && config.category === 'text')) ? explicit : null;
  }
  const defaults: Record<string, string> = {
    'google:image': 'nano-banana-2',
    'google:video': 'veo-fast',
    'google:project': 'gemini-2.5-flash',
    'openai:image': 'dall-e-3',
    'openai:project': 'gpt-4o',
    'anthropic:project': 'claude-3-5-sonnet-20240620',
    'fal:image': 'fal-ai/flux/schnell',
  };
  const modelId = defaults[`${provider.toLowerCase()}:${kind}`];
  return modelId && getAIModelConfig(provider, modelId) ? modelId : null;
}

export function estimateTokens(value: unknown): number {
  const text = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateAICredits(input: CreditEstimateInput): CreditEstimate {
  const config = getAIModelConfig(input.provider, input.model);
  if (!config) throw new Error('MODEL_NOT_ALLOWED');
  if (!(config.category === input.kind || (input.kind === 'project' && config.category === 'text'))) throw new Error('MODEL_KIND_NOT_ALLOWED');

  const serializedInput = typeof input.input === 'string' ? input.input : JSON.stringify(input.input ?? '');
  if (serializedInput.length > DEFAULT_MAX_INPUT_CHARS) throw new Error('INPUT_TOO_LARGE');

  const estimatedInputTokens = estimateTokens(serializedInput);
  if (estimatedInputTokens > config.maxInputTokens) throw new Error('INPUT_TOKEN_LIMIT');
  const estimatedOutputTokens = Math.min(input.outputTokens ?? config.defaultOutputTokens, config.maxOutputTokens);
  const inputCost = (estimatedInputTokens / 1_000_000) * (config.inputTokenPriceUsdPerMillion ?? 0);
  const outputCost = (estimatedOutputTokens / 1_000_000) * (config.outputTokenPriceUsdPerMillion ?? 0);
  const imageCost = (input.imageCount ?? (config.category === 'image' ? 1 : 0)) * (config.imagePriceUsd ?? 0);
  const videoCost = (input.videoDurationSeconds ?? 0) * (config.videoPriceUsdPerSecond ?? 0);
  const estimatedApiCostUsd = inputCost + outputCost + imageCost + videoCost;
  const calculatedCredits = Math.ceil(estimatedApiCostUsd / TARGET_COST_PER_CREDIT_USD);
  const credits = Math.min(config.maxCredits, Math.max(config.minimumCredits, calculatedCredits));

  return {
    credits,
    estimatedApiCostUsd: Number(estimatedApiCostUsd.toFixed(6)),
    estimatedInputTokens,
    estimatedOutputTokens,
    maxCredits: config.maxCredits,
    pricingStatus: config.pricingStatus,
  };
}

export function splitCreditConsumption(totalCredits: number, subscriptionCredits: number) {
  const subscriptionUsed = Math.min(Math.max(0, subscriptionCredits), Math.max(0, totalCredits));
  return {
    subscriptionCredits: subscriptionUsed,
    purchasedCredits: Math.max(0, totalCredits - subscriptionUsed),
  };
}
