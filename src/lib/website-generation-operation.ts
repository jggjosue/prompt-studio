import 'server-only';

import { getAIOperation, type AIOperationCode } from '@/lib/ai-operation-catalog';

export type WebsiteGenerationTier = 'simple' | 'advanced' | 'complex';

const WEBSITE_OPERATION_BY_TIER: Readonly<Record<WebsiteGenerationTier, AIOperationCode>> = Object.freeze({
  simple: 'WEBSITE_SIMPLE',
  advanced: 'WEBSITE_ADVANCED',
  complex: 'WEBSITE_COMPLEX',
});

export function isWebsiteGenerationTier(value: unknown): value is WebsiteGenerationTier {
  return value === 'simple' || value === 'advanced' || value === 'complex';
}

export function resolveWebsiteGenerationOperation(input: Record<string, unknown>): ReturnType<typeof getAIOperation> {
  const requestedTier = input.websiteTier;
  if (!isWebsiteGenerationTier(requestedTier)) throw new Error('WEBSITE_TIER_REQUIRED');
  return getAIOperation(WEBSITE_OPERATION_BY_TIER[requestedTier]);
}
