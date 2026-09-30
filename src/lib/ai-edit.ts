import 'server-only';

import { estimateAICredits, resolveAIModelId } from '@/lib/ai-credit-config';
import { ensureCreditAccount } from '@/lib/ai-job-service';
import { callPlannerModel } from '@/lib/ai-site-plan';
import { planAIEdit, type AIEditPlanOutput } from '@/lib/editor/ai-edit-planner';
import { AIPlanError } from '@/lib/editor/ai-site-planner';
import { recordObservabilityEvent } from '@/lib/observability-server';
import connectToDatabase from '@/lib/mongoose';
import AICreditAccount from '@/models/AICreditAccount';
import AICreditLedger from '@/models/AICreditLedger';
import mongoose from 'mongoose';

const DEFAULT_PROVIDER = 'google';

function resolveEditModel(provider: string, requestedModel?: string): string {
  const resolved = resolveAIModelId('project', provider, requestedModel);
  return resolved ?? resolveAIModelId('project', provider) ?? 'gemini-2.5-flash';
}

/** Coste estimado en créditos de una edición por IA. */
export function estimateAIEdit(request: string, provider = DEFAULT_PROVIDER, requestedModel?: string) {
  const model = resolveEditModel(provider, requestedModel);
  return estimateAICredits({ provider, model, kind: 'project', input: request });
}

/** Gasta créditos (solo cuando la edición generó operaciones válidas). */
async function spendCredits(userId: string, credits: number, provider: string, model: string): Promise<void> {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const account = await AICreditAccount.findOne({ userId }).session(session);
      if (!account) throw new AIPlanError('INSUFFICIENT_CREDITS', 'Cuenta de créditos no encontrada.');
      const subscription = Math.min(account.subscriptionBalance ?? 0, credits);
      const purchased = credits - subscription;
      account.balance = (account.balance ?? 0) - credits;
      account.subscriptionBalance = (account.subscriptionBalance ?? 0) - subscription;
      account.purchasedBalance = (account.purchasedBalance ?? 0) - purchased;
      account.lifetimeSpent = (account.lifetimeSpent ?? 0) + credits;
      account.updatedAt = new Date();
      await account.save({ session });
      await AICreditLedger.create(
        [
          {
            userId,
            operation: 'capture',
            type: 'AI_USAGE',
            amount: credits,
            balanceImpact: -credits,
            source: purchased ? (subscription ? 'mixed' : 'purchased') : 'subscription',
            provider,
            modelId: model,
            operationName: 'page-composer/ai/edit',
            creditsCharged: credits,
            createdAt: new Date(),
          },
        ],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }
}

export type GenerateAIEditInput = {
  userId: string;
  instruction: string;
  subset: unknown;
  nodeId: string;
  provider?: string;
  requestedModel?: string;
};

export type GenerateAIEditOutput = AIEditPlanOutput & { credits: number; provider: string };

/** Genera operaciones de edición: valida créditos, llama al modelo y cobra. */
export async function generateAIEdit(input: GenerateAIEditInput): Promise<GenerateAIEditOutput> {
  const provider = input.provider ?? DEFAULT_PROVIDER;
  const estimate = estimateAIEdit(input.instruction, provider, input.requestedModel);
  const model = resolveEditModel(provider, input.requestedModel);
  const startedAt = Date.now();

  await connectToDatabase();
  await ensureCreditAccount(input.userId);
  const account = await AICreditAccount.findOne({ userId: input.userId }).lean();
  const balance = (account?.subscriptionBalance ?? account?.balance ?? 0) + (account?.purchasedBalance ?? 0);
  if (balance < estimate.credits) {
    throw new AIPlanError('INSUFFICIENT_CREDITS', `Necesitas ${estimate.credits} créditos y tienes ${balance}.`);
  }

  try {
    const callModel = (system: string, user: string, activeModel: string) =>
      callPlannerModel(provider, activeModel, system, user);
    const { ops, model: activeModel } = await planAIEdit(input.instruction, input.subset, input.nodeId, { callModel, model });

    await spendCredits(input.userId, estimate.credits, provider, activeModel);
    await recordObservabilityEvent({
      category: 'ai_generation',
      name: 'page_composer_ai_edit',
      route: '/api/page-composer/ai/edit',
      userId: input.userId,
      status: 'success',
      durationMs: Date.now() - startedAt,
      value: estimate.credits,
      unit: 'credits',
      costUsd: estimate.estimatedApiCostUsd,
      metadata: { provider, model: activeModel, ops: ops.length },
    });

    return { ops, model: activeModel, credits: estimate.credits, provider };
  } catch (error) {
    await recordObservabilityEvent({
      category: 'ai_generation',
      name: 'page_composer_ai_edit',
      route: '/api/page-composer/ai/edit',
      userId: input.userId,
      status: 'error',
      durationMs: Date.now() - startedAt,
      metadata: { provider, model, code: error instanceof AIPlanError ? error.code : 'unknown' },
    });
    throw error;
  }
}