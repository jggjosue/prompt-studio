import 'server-only';

import { getAIOperation, isAIOperationCode, type AIOperationCode } from '@/lib/ai-operation-catalog';
import { evaluateOperationMargin, type ProviderUsageEstimate } from '@/lib/ai-provider-pricing-engine';
import connectToDatabase from '@/lib/mongoose';
import AIOperationPricing from '@/models/AIOperationPricing';

export async function resolveRuntimeOperationPricing(input: {
  operationCode: string;
  provider: string;
  modelId: string;
  usage?: ProviderUsageEstimate;
}) {
  if (!isAIOperationCode(input.operationCode)) throw new Error('OPERATION_NOT_FOUND');
  const base = getAIOperation(input.operationCode as AIOperationCode);
  await connectToDatabase();
  const override = await AIOperationPricing.findOne({ operationCode: input.operationCode }).lean();
  const enabled = override?.enabled ?? base.enabled;
  if (!enabled) throw new Error('OPERATION_DISABLED');

  const creditCost = override?.creditCost ?? base.creditCost;
  const minimumMarginPercent = override?.minimumMarginPercent ?? base.minimumMarginPercent;
  if (creditCost === 0) {
    return { operation: base, creditCost, minimumMarginPercent, overridden: Boolean(override), margin: null };
  }

  const margin = evaluateOperationMargin({
    operationCredits: creditCost,
    provider: input.provider,
    modelId: input.modelId,
    usage: input.usage,
    minimumMarginPercent,
  });
  if (!margin.eligible) throw new Error(`PRICING_MARGIN_BLOCKED:${margin.reason}`);

  return { operation: base, creditCost, minimumMarginPercent, overridden: Boolean(override), margin };
}
