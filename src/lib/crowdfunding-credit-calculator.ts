import 'server-only';

import { getAIOperation } from '@/lib/ai-operation-catalog';
import { getFounderRewardTier } from '@/lib/founder-credit-tiers';

const SHOWCASE_OPERATIONS = [
  'TEXT_LONG',
  'PROMPT_OPTIMIZER_ADVANCED',
  'IMAGE_QUALITY_1K',
  'VIDEO_FAST_720_8S',
  'WEBSITE_ADVANCED',
  'WEBSITE_AI_EDIT_SECTION',
  'CODE_AUDIT_STANDARD',
  'COMPONENT_AI_GENERATION',
] as const;

export function calculateCrowdfundingCredits(pledgeAmountCents: number) {
  const tier = getFounderRewardTier(pledgeAmountCents);
  if (!tier) throw new Error('FOUNDER_TIER_INVALID');

  return {
    pledgeAmountCents,
    baseCredits: tier.baseCredits,
    bonusPercent: tier.bonusPercent,
    bonusCredits: tier.bonusCredits,
    totalCredits: tier.totalCredits,
    examples: SHOWCASE_OPERATIONS.map((code) => {
      const operation = getAIOperation(code);
      return {
        operationCode: operation.code,
        displayName: operation.displayName,
        creditCost: operation.creditCost,
        maxOperations: operation.creditCost > 0 ? Math.floor(tier.totalCredits / operation.creditCost) : null,
      };
    }),
  };
}
