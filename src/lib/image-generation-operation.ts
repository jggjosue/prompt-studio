import 'server-only';

import { getAIOperation, type AIOperationCode } from '@/lib/ai-operation-catalog';

export type ImageGenerationTier = 'lite-1k' | 'quality-1k' | 'quality-2k' | 'quality-4k';

const IMAGE_OPERATION_BY_TIER: Readonly<Record<ImageGenerationTier, AIOperationCode>> = Object.freeze({
  'lite-1k': 'IMAGE_LITE_1K',
  'quality-1k': 'IMAGE_QUALITY_1K',
  'quality-2k': 'IMAGE_QUALITY_2K',
  'quality-4k': 'IMAGE_QUALITY_4K',
});

export function isImageGenerationTier(value: unknown): value is ImageGenerationTier {
  return value === 'lite-1k' || value === 'quality-1k' || value === 'quality-2k' || value === 'quality-4k';
}

export function resolveImageGenerationOperation(input: Record<string, unknown>): ReturnType<typeof getAIOperation> {
  const requestedTier = input.imageTier;
  if (!isImageGenerationTier(requestedTier)) throw new Error('IMAGE_TIER_REQUIRED');
  return getAIOperation(IMAGE_OPERATION_BY_TIER[requestedTier]);
}
