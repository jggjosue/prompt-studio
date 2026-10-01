import 'server-only';

import { getAIOperation, type AIOperationCode } from '@/lib/ai-operation-catalog';

export type WebsiteAIEditTier = 'small' | 'section' | 'complex' | 'redesign';

const WEBSITE_EDIT_OPERATION_BY_TIER: Readonly<Record<WebsiteAIEditTier, AIOperationCode>> = Object.freeze({
  small: 'WEBSITE_AI_EDIT_SMALL',
  section: 'WEBSITE_AI_EDIT_SECTION',
  complex: 'WEBSITE_AI_EDIT_COMPLEX',
  redesign: 'WEBSITE_AI_REDESIGN',
});

export function isWebsiteAIEditTier(value: unknown): value is WebsiteAIEditTier {
  return value === 'small' || value === 'section' || value === 'complex' || value === 'redesign';
}

export function resolveWebsiteAIEditOperation(input: Record<string, unknown>): ReturnType<typeof getAIOperation> {
  const requestedTier = input.websiteEditTier;
  if (!isWebsiteAIEditTier(requestedTier)) throw new Error('WEBSITE_EDIT_TIER_REQUIRED');
  return getAIOperation(WEBSITE_EDIT_OPERATION_BY_TIER[requestedTier]);
}
