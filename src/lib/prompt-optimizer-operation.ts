import 'server-only';

import { getAIOperation, type AIOperationCode } from '@/lib/ai-operation-catalog';

export type PromptOptimizerTier = 'basic' | 'advanced' | 'complex';

const PROMPT_OPTIMIZER_OPERATION_BY_TIER: Readonly<Record<PromptOptimizerTier, AIOperationCode>> = Object.freeze({
  basic: 'PROMPT_OPTIMIZER_BASIC',
  advanced: 'PROMPT_OPTIMIZER_ADVANCED',
  complex: 'PROMPT_OPTIMIZER_COMPLEX',
});

export function isPromptOptimizerTier(value: unknown): value is PromptOptimizerTier {
  return value === 'basic' || value === 'advanced' || value === 'complex';
}

export function resolvePromptOptimizerOperation(input: Record<string, unknown>): ReturnType<typeof getAIOperation> {
  const requestedTier = input.optimizerTier;
  if (!isPromptOptimizerTier(requestedTier)) throw new Error('PROMPT_OPTIMIZER_TIER_REQUIRED');
  return getAIOperation(PROMPT_OPTIMIZER_OPERATION_BY_TIER[requestedTier]);
}
