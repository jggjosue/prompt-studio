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
