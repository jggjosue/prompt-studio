import 'server-only';

import {
  DEFAULT_MAX_INPUT_CHARS,
  estimateTokens,
  getAIModelConfig,
  type AIModelConfig,
} from '@/lib/ai-credit-config';
import {
  MAX_PROVIDER_COST_PER_CREDIT_USD,
  PROMPT_CREDIT_FLOOR_VALUE_USD,
  PROVIDER_COST_RESERVE_PERCENT,
} from '@/lib/credit-economics';
import { quoteVideoProviderCost, type VideoResolution } from '@/lib/provider-pricing-registry';

export const PROMPT_CREDIT_COMMERCIAL_VALUE_USD = PROMPT_CREDIT_FLOOR_VALUE_USD;
export const DEFAULT_PROVIDER_COST_SHARE = PROVIDER_COST_RESERVE_PERCENT / 100;
export const DEFAULT_SAFETY_BUFFER_PERCENT = 12.5;

export type ProviderUsageEstimate = {
  input?: unknown;
  outputTokens?: number;
  imageCount?: number;
  videoDurationSeconds?: number;
  videoResolution?: VideoResolution;
  videoAudio?: boolean;
};

export type ProviderCostEstimate = {
  provider: string;
  modelId: string;
  rawProviderCostUsd: number;
  safetyCostUsd: number;
  safetyBufferPercent: number;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  pricingStatus: AIModelConfig['pricingStatus'];
  costKnown: boolean;
};

export type OperationMarginEvaluation = ProviderCostEstimate & {
  operationCredits: number;
  commercialValueUsd: number;
  maximumProviderCostUsd: number;
  providerCostShare: number;
  minimumMarginPercent: number;
  estimatedMarginPercent: number | null;
  eligible: boolean;
  reason:
    | 'ELIGIBLE'
    | 'FREE_OPERATION'
    | 'MODEL_NOT_ALLOWED'
    | 'PROVIDER_COST_UNKNOWN'
    | 'PROVIDER_COST_EXCEEDS_MARGIN'
    | 'INVALID_OPERATION_PRICE';
};

const money = (value: number) => Number(value.toFixed(6));
const percent = (value: number) => Number(value.toFixed(2));

function hasKnownPrice(config: AIModelConfig, usage: ProviderUsageEstimate): boolean {
  const needsTokens = usage.input !== undefined || (usage.outputTokens ?? config.defaultOutputTokens) > 0;
  if (needsTokens && (config.inputTokenPriceUsdPerMillion == null || config.outputTokenPriceUsdPerMillion == null)) return false;
  if ((usage.imageCount ?? (config.category === 'image' ? 1 : 0)) > 0 && config.imagePriceUsd == null) return false;
  if ((usage.videoDurationSeconds ?? 0) > 0 && config.videoPriceUsdPerSecond == null) return false;
  return true;
}

export function estimateProviderCost(
  provider: string,
  modelId: string,
  usage: ProviderUsageEstimate = {},
  safetyBufferPercent = DEFAULT_SAFETY_BUFFER_PERCENT,
): ProviderCostEstimate | null {
  const config = getAIModelConfig(provider, modelId);
  if (!config) return null;

  const serializedInput = usage.input === undefined
    ? ''
    : typeof usage.input === 'string'
      ? usage.input
      : JSON.stringify(usage.input ?? '');

  if (serializedInput.length > DEFAULT_MAX_INPUT_CHARS) throw new Error('INPUT_TOO_LARGE');

  const estimatedInputTokens = serializedInput ? estimateTokens(serializedInput) : 0;
  if (estimatedInputTokens > config.maxInputTokens) throw new Error('INPUT_TOKEN_LIMIT');

  const estimatedOutputTokens = Math.min(
    usage.outputTokens ?? config.defaultOutputTokens,
    config.maxOutputTokens,
  );

  if (usage.videoDurationSeconds && usage.videoResolution) {
    const videoQuote = quoteVideoProviderCost({
      provider,
      modelId,
      resolution: usage.videoResolution,
      durationSeconds: usage.videoDurationSeconds,
      audio: usage.videoAudio,
      safetyBufferPercent,
    });
    if (videoQuote) {
      return {
        provider: config.provider,
        modelId: config.modelId,
        rawProviderCostUsd: videoQuote.rawProviderCostUsd,
        safetyCostUsd: videoQuote.safetyCostUsd,
        safetyBufferPercent: Math.max(0, safetyBufferPercent),
        estimatedInputTokens,
        estimatedOutputTokens: 0,
        pricingStatus: 'verified',
        costKnown: true,
      };
    }
  }

  const inputCost = (estimatedInputTokens / 1_000_000) * (config.inputTokenPriceUsdPerMillion ?? 0);
  const outputCost = (estimatedOutputTokens / 1_000_000) * (config.outputTokenPriceUsdPerMillion ?? 0);
  const imageCount = usage.imageCount ?? (config.category === 'image' ? 1 : 0);
  const imageCost = imageCount * (config.imagePriceUsd ?? 0);
  const videoCost = (usage.videoDurationSeconds ?? 0) * (config.videoPriceUsdPerSecond ?? 0);
  const rawProviderCostUsd = inputCost + outputCost + imageCost + videoCost;
  const safetyCostUsd = rawProviderCostUsd * (1 + Math.max(0, safetyBufferPercent) / 100);

  return {
    provider: config.provider,
    modelId: config.modelId,
    rawProviderCostUsd: money(rawProviderCostUsd),
    safetyCostUsd: money(safetyCostUsd),
    safetyBufferPercent: Math.max(0, safetyBufferPercent),
    estimatedInputTokens,
    estimatedOutputTokens,
    pricingStatus: config.pricingStatus,
    costKnown: hasKnownPrice(config, usage),
  };
}

export function evaluateOperationMargin(input: {
  operationCredits: number;
  provider: string;
  modelId: string;
  usage?: ProviderUsageEstimate;
  minimumMarginPercent?: number;
  safetyBufferPercent?: number;
}): OperationMarginEvaluation {
  const minimumMarginPercent = input.minimumMarginPercent ?? 75;
  const providerCostShare = Math.max(0, 1 - minimumMarginPercent / 100);
  const commercialValueUsd = input.operationCredits * PROMPT_CREDIT_COMMERCIAL_VALUE_USD;
  const maximumProviderCostUsd = Math.min(commercialValueUsd * providerCostShare, input.operationCredits * MAX_PROVIDER_COST_PER_CREDIT_USD);

  const base = {
    operationCredits: input.operationCredits,
    commercialValueUsd: money(commercialValueUsd),
    maximumProviderCostUsd: money(maximumProviderCostUsd),
    providerCostShare: percent(providerCostShare * 100),
    minimumMarginPercent,
  };

  if (!Number.isFinite(input.operationCredits) || input.operationCredits < 0) {
    return {
      ...base,
      provider: input.provider,
      modelId: input.modelId,
      rawProviderCostUsd: 0,
      safetyCostUsd: 0,
      safetyBufferPercent: input.safetyBufferPercent ?? DEFAULT_SAFETY_BUFFER_PERCENT,
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      pricingStatus: 'unverified',
      costKnown: false,
      estimatedMarginPercent: null,
      eligible: false,
      reason: 'INVALID_OPERATION_PRICE',
    };
  }

  if (input.operationCredits === 0) {
    return {
      ...base,
      provider: input.provider,
      modelId: input.modelId,
      rawProviderCostUsd: 0,
      safetyCostUsd: 0,
      safetyBufferPercent: input.safetyBufferPercent ?? DEFAULT_SAFETY_BUFFER_PERCENT,
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      pricingStatus: 'unverified',
      costKnown: true,
      estimatedMarginPercent: 100,
      eligible: true,
      reason: 'FREE_OPERATION',
    };
  }

  const estimate = estimateProviderCost(
    input.provider,
    input.modelId,
    input.usage,
    input.safetyBufferPercent,
  );

  if (!estimate) {
    return {
      ...base,
      provider: input.provider,
      modelId: input.modelId,
      rawProviderCostUsd: 0,
      safetyCostUsd: 0,
      safetyBufferPercent: input.safetyBufferPercent ?? DEFAULT_SAFETY_BUFFER_PERCENT,
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      pricingStatus: 'unverified',
      costKnown: false,
      estimatedMarginPercent: null,
      eligible: false,
      reason: 'MODEL_NOT_ALLOWED',
    };
  }

  if (!estimate.costKnown || estimate.pricingStatus !== 'verified') {
    return {
      ...base,
      ...estimate,
      estimatedMarginPercent: null,
      eligible: false,
      reason: 'PROVIDER_COST_UNKNOWN',
    };
  }

  const estimatedMarginPercent = commercialValueUsd > 0
    ? percent(((commercialValueUsd - estimate.safetyCostUsd) / commercialValueUsd) * 100)
    : 100;
  const eligible = estimate.safetyCostUsd <= maximumProviderCostUsd;

  return {
    ...base,
    ...estimate,
    estimatedMarginPercent,
    eligible,
    reason: eligible ? 'ELIGIBLE' : 'PROVIDER_COST_EXCEEDS_MARGIN',
  };
}
