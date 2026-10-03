import { MAX_PROVIDER_COST_PER_CREDIT_USD } from '@/lib/credit-economics';

export type VideoResolution = '720p' | '1024p' | '1080p' | '4k';
export const PROVIDER_PRICING_SAFETY_BUFFER_PERCENT = 12.5;

const VIDEO_USD_PER_SECOND: Record<string, Partial<Record<VideoResolution, number>>> = {
  'google:veo-3.1-lite-generate-preview': { '720p': 0.05, '1080p': 0.08 },
  'google:veo-3.1-fast-generate-preview': { '720p': 0.10, '1080p': 0.12, '4k': 0.30 },
  'google:veo-3.1-generate-preview': { '720p': 0.40, '1080p': 0.40, '4k': 0.60 },
  'vertex:veo-3.1-lite-generate-001:audio': { '720p': 0.05, '1080p': 0.08 },
  'vertex:veo-3.1-lite-generate-001:video': { '720p': 0.03, '1080p': 0.05 },
  'vertex:veo-3.1-fast-generate-001:audio': { '720p': 0.10, '1080p': 0.12, '4k': 0.30 },
  'vertex:veo-3.1-fast-generate-001:video': { '720p': 0.08, '1080p': 0.10, '4k': 0.25 },
  'vertex:veo-3.1-generate-001:audio': { '720p': 0.40, '1080p': 0.40, '4k': 0.60 },
  'vertex:veo-3.1-generate-001:video': { '720p': 0.20, '1080p': 0.20, '4k': 0.40 },
};

export function quoteVideoProviderCost(input: {
  provider: string; modelId: string; resolution: VideoResolution;
  durationSeconds: number; audio?: boolean; safetyBufferPercent?: number;
}) {
  const suffix = input.provider === 'vertex' ? (input.audio === false ? ':video' : ':audio') : '';
  const prices = VIDEO_USD_PER_SECOND[`${input.provider}:${input.modelId}${suffix}`];
  if (!prices) return null;
  if (!Number.isFinite(input.durationSeconds) || input.durationSeconds <= 0) throw new Error('VIDEO_DURATION_UNSUPPORTED');
  if (input.provider === 'google' && ![4, 6, 8].includes(input.durationSeconds)) throw new Error('VIDEO_DURATION_UNSUPPORTED');
  if (input.provider === 'google' && (input.resolution === '1080p' || input.resolution === '4k') && input.durationSeconds !== 8) throw new Error('VIDEO_DURATION_RESOLUTION_UNSUPPORTED');
  const pricePerSecondUsd = prices[input.resolution];
  if (pricePerSecondUsd == null) throw new Error('VIDEO_RESOLUTION_UNSUPPORTED');
  const rawProviderCostUsd = pricePerSecondUsd * input.durationSeconds;
  const safetyBufferPercent = input.safetyBufferPercent ?? PROVIDER_PRICING_SAFETY_BUFFER_PERCENT;
  const safetyCostUsd = rawProviderCostUsd * (1 + Math.max(0, safetyBufferPercent) / 100);
  return {
    pricePerSecondUsd,
    rawProviderCostUsd: Number(rawProviderCostUsd.toFixed(6)),
    safetyCostUsd: Number(safetyCostUsd.toFixed(6)),
    requiredCredits: Math.ceil(safetyCostUsd / MAX_PROVIDER_COST_PER_CREDIT_USD),
    verifiedAt: '2026-10-03',
  };
}


export type ImageResolution = '0.5k' | '1k' | '2k' | '4k';

const IMAGE_USD_PER_OUTPUT: Record<string, Partial<Record<ImageResolution, number>>> = {
  'google:gemini-3.1-flash-lite-image': { '1k': 0.0336 },
  'google:gemini-3.1-flash-image': { '0.5k': 0.045, '1k': 0.067, '2k': 0.101, '4k': 0.151 },
  'google:gemini-3-pro-image': { '1k': 0.134, '2k': 0.134, '4k': 0.24 },
};

export function quoteImageProviderCost(input: {
  provider: string; modelId: string; resolution: ImageResolution;
  imageCount?: number; safetyBufferPercent?: number;
}) {
  const prices = IMAGE_USD_PER_OUTPUT[`${input.provider}:${input.modelId}`];
  if (!prices) return null;
  const pricePerImageUsd = prices[input.resolution];
  if (pricePerImageUsd == null) throw new Error('IMAGE_RESOLUTION_UNSUPPORTED');
  const imageCount = Math.max(1, Math.floor(input.imageCount ?? 1));
  const rawProviderCostUsd = pricePerImageUsd * imageCount;
  const safetyBufferPercent = input.safetyBufferPercent ?? PROVIDER_PRICING_SAFETY_BUFFER_PERCENT;
  const safetyCostUsd = rawProviderCostUsd * (1 + Math.max(0, safetyBufferPercent) / 100);
  return {
    pricePerImageUsd, imageCount,
    rawProviderCostUsd: Number(rawProviderCostUsd.toFixed(6)),
    safetyCostUsd: Number(safetyCostUsd.toFixed(6)),
    requiredCredits: Math.ceil(safetyCostUsd / MAX_PROVIDER_COST_PER_CREDIT_USD),
    verifiedAt: '2026-10-03',
  };
}

export function creditsForProtectedProviderCost(providerCostUsd: number, safetyBufferPercent = PROVIDER_PRICING_SAFETY_BUFFER_PERCENT) {
  const safeCost = Math.max(0, providerCostUsd) * (1 + Math.max(0, safetyBufferPercent) / 100);
  return Math.ceil(safeCost / MAX_PROVIDER_COST_PER_CREDIT_USD);
}
