import 'server-only';

import { getAIOperation, type AIOperationCode } from '@/lib/ai-operation-catalog';

export type VideoGenerationTier =
  | 'lite-720-8s'
  | 'lite-1080-8s'
  | 'fast-720-8s'
  | 'fast-1080-8s'
  | 'premium-8s';

const VIDEO_OPERATION_BY_TIER: Readonly<Record<VideoGenerationTier, AIOperationCode>> = Object.freeze({
  'lite-720-8s': 'VIDEO_LITE_720_8S',
  'lite-1080-8s': 'VIDEO_LITE_1080_8S',
  'fast-720-8s': 'VIDEO_FAST_720_8S',
  'fast-1080-8s': 'VIDEO_FAST_1080_8S',
  'premium-8s': 'VIDEO_PREMIUM_8S',
});

export function isVideoGenerationTier(value: unknown): value is VideoGenerationTier {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(VIDEO_OPERATION_BY_TIER, value);
}

export function resolveVideoGenerationOperation(input: Record<string, unknown>): ReturnType<typeof getAIOperation> {
  const requestedTier = input.videoTier;
  if (!isVideoGenerationTier(requestedTier)) throw new Error('VIDEO_TIER_REQUIRED');
  const operation = getAIOperation(VIDEO_OPERATION_BY_TIER[requestedTier]);
  if (operation.durationSeconds !== 8) throw new Error('VIDEO_DURATION_UNSUPPORTED');
  return operation;
}
