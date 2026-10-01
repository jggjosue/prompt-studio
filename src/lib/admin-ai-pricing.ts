import 'server-only';

import { AI_OPERATION_CODES, getAIOperation, isAIOperationCode } from '@/lib/ai-operation-catalog';
import connectToDatabase from '@/lib/mongoose';
import AIOperationPricing from '@/models/AIOperationPricing';
import AIProviderPricing from '@/models/AIProviderPricing';

export async function listAdminPricing() {
  await connectToDatabase();
  const [overrides, providers] = await Promise.all([
    AIOperationPricing.find({}).sort({ category: 1, operationCode: 1 }).lean(),
    AIProviderPricing.find({}).sort({ provider: 1, modelId: 1, effectiveAt: -1 }).lean(),
  ]);
  const byCode = new Map(overrides.map((row) => [row.operationCode, row]));
  return {
    operations: AI_OPERATION_CODES.map((code) => {
      const base = getAIOperation(code);
      const override = byCode.get(code);
      return {
        operationCode: code,
        displayName: override?.displayName ?? base.displayName,
        category: override?.category ?? base.category,
        creditCost: override?.creditCost ?? base.creditCost,
        catalogCreditCost: base.creditCost,
        enabled: override?.enabled ?? base.enabled,
        minimumMarginPercent: override?.minimumMarginPercent ?? base.minimumMarginPercent,
        overridden: Boolean(override),
        updatedAt: override?.updatedAt?.toISOString?.() ?? null,
      };
    }),
    providers: providers.map((row) => ({
      id: String(row._id), provider: row.provider, modelId: row.modelId, currency: row.currency,
      inputCostPerMillionTokens: row.inputCostPerMillionTokens ?? null,
      outputCostPerMillionTokens: row.outputCostPerMillionTokens ?? null,
      imageCostUsd: row.imageCostUsd ?? null, videoCostPerSecondUsd: row.videoCostPerSecondUsd ?? null,
      enabled: row.enabled, verifiedAt: row.verifiedAt?.toISOString?.() ?? null, effectiveAt: row.effectiveAt.toISOString(),
    })),
  };
}

export async function updateOperationPricing(input: { operationCode: string; creditCost: number; enabled: boolean; minimumMarginPercent: number }) {
  if (!isAIOperationCode(input.operationCode)) throw new Error('OPERATION_NOT_FOUND');
  if (!Number.isInteger(input.creditCost) || input.creditCost < 0) throw new Error('CREDIT_COST_INVALID');
  if (!Number.isFinite(input.minimumMarginPercent) || input.minimumMarginPercent < 0 || input.minimumMarginPercent > 100) throw new Error('MARGIN_INVALID');
  const base = getAIOperation(input.operationCode);
  await connectToDatabase();
  return AIOperationPricing.findOneAndUpdate(
    { operationCode: input.operationCode },
    { $set: { displayName: base.displayName, category: base.category, creditCost: input.creditCost, isFree: input.creditCost === 0, enabled: input.enabled, quality: base.quality ?? null, resolution: base.resolution ?? null, durationSeconds: base.durationSeconds ?? null, minimumMarginPercent: input.minimumMarginPercent, effectiveAt: new Date(), updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
    { upsert: true, returnDocument: 'after' },
  );
}
