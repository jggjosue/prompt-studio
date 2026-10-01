import 'server-only';

import { getAIOperation, type AIOperationCode } from '@/lib/ai-operation-catalog';

export type TextGenerationTier = 'short' | 'long' | 'complex';

const TEXT_OPERATION_BY_TIER: Readonly<Record<TextGenerationTier, AIOperationCode>> = Object.freeze({
  short: 'TEXT_SHORT',
  long: 'TEXT_LONG',
  complex: 'TEXT_COMPLEX',
});

export function isTextGenerationTier(value: unknown): value is TextGenerationTier {
  return value === 'short' || value === 'long' || value === 'complex';
}

export function resolveTextGenerationOperation(input: Record<string, unknown>): ReturnType<typeof getAIOperation> {
  const requestedTier = input.textTier;
  if (!isTextGenerationTier(requestedTier)) {
    throw new Error('TEXT_TIER_REQUIRED');
  }
  return getAIOperation(TEXT_OPERATION_BY_TIER[requestedTier]);
}
