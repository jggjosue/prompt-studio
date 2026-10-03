import 'server-only';

import { getAIOperation, isAIOperationCode, type AIOperationCode } from '@/lib/ai-operation-catalog';
import { evaluateOperationMargin, type ProviderUsageEstimate } from '@/lib/ai-provider-pricing-engine';
import connectToDatabase from '@/lib/mongoose';
import AIOperationPricing from '@/models/AIOperationPricing';
import { quoteImageProviderCost, quoteVideoProviderCost } from '@/lib/provider-pricing-registry';

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

  let creditCost = override?.creditCost ?? base.creditCost;
  if (!override && base.category === 'image' && input.usage?.imageResolution) {
    const quote = quoteImageProviderCost({ provider: input.provider, modelId: input.modelId, resolution: input.usage.imageResolution, imageCount: input.usage.imageCount });
    if (quote) creditCost = quote.requiredCredits;
  }
  if (!override && base.category === 'video' && input.usage?.videoDurationSeconds && input.usage.videoResolution) {
    const quote = quoteVideoProviderCost({ provider: input.provider, modelId: input.modelId, resolution: input.usage.videoResolution, durationSeconds: input.usage.videoDurationSeconds, audio: input.usage.videoAudio });
    if (quote) creditCost = quote.requiredCredits;
  }
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
