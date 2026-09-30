import 'server-only';

import { proxyAnthropicChat, proxyGemini, proxyOpenAIChat } from '@/app/actions';
import { estimateAICredits, type CreditEstimate } from '@/lib/ai-credit-config';
import { resolvePlannerModel } from '@/lib/ai-site-plan-config';
export { resolvePlannerModel } from '@/lib/ai-site-plan-config';
import { ensureCreditAccount } from '@/lib/ai-job-service';
import { AIPlanError, planSite, type SitePlanResult } from '@/lib/editor/ai-site-planner';
import connectToDatabase from '@/lib/mongoose';
import { recordObservabilityEvent } from '@/lib/observability-server';
import AICreditAccount from '@/models/AICreditAccount';
import AICreditLedger from '@/models/AICreditLedger';
import mongoose from 'mongoose';

const DEFAULT_PROVIDER = 'google';

function textFromGemini(result: unknown): string | null {
  const parts = (result as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })?.candidates?.[0]?.content?.parts;
  const text = parts?.[0]?.text;
  return typeof text === 'string' ? text : null;
}

function textFromChat(result: unknown): string | null {
  const choices = (result as { choices?: Array<{ message?: { content?: string } }> })?.choices;
  const text = choices?.[0]?.message?.content;
  return typeof text === 'string' ? text : null;
}

function textFromAnthropic(result: unknown): string | null {
  const content = (result as { content?: unknown })?.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    const parts = content.map(part => (part as { text?: string })?.text).filter((t): t is string => typeof t === 'string');
    return parts.join('');
  }
  return null;
}

/** Llama al proveedor real y devuelve el texto crudo. */
export async function callPlannerModel(provider: string, model: string, system: string, user: string): Promise<string> {
  const prompt = `${system}\n\n${user}`;
  if (provider === 'google') {
    const result = await proxyGemini('', prompt, model);
    if (result && 'error' in result) throw new AIPlanError('PROVIDER_ERROR', String(result.error));
    const text = textFromGemini(result);
    if (text === null) throw new AIPlanError('PROVIDER_ERROR', 'El proveedor no devolvió texto.');
    return text;
  }
  if (provider === 'openai') {
    const result = await proxyOpenAIChat('', system, user, model);
    if (result && 'error' in result) throw new AIPlanError('PROVIDER_ERROR', String(result.error));
    const text = textFromChat(result);
    if (text === null) throw new AIPlanError('PROVIDER_ERROR', 'El proveedor no devolvió texto.');
    return text;
  }
  if (provider === 'anthropic') {
    const result = await proxyAnthropicChat('', system, user, model);
    if (result && 'error' in result) throw new AIPlanError('PROVIDER_ERROR', String(result.error));
    const text = textFromAnthropic(result);
    if (text === null) throw new AIPlanError('PROVIDER_ERROR', 'El proveedor no devolvió texto.');
    return text;
  }
  throw new AIPlanError('MODEL_NOT_ALLOWED', `Proveedor no soportado: ${provider}`);
}

/** Coste estimado en créditos antes de generar, reutilizando la infra de créditos. */
export function estimateSitePlan(request: string, provider = DEFAULT_PROVIDER, requestedModel?: string): CreditEstimate {
  const model = resolvePlannerModel(provider, requestedModel);
  return estimateAICredits({ provider, model, kind: 'project', input: request });
}

/** Gasta créditos de forma optimista (sin reserva previa; el pago solo ocurre tras generar bien). */
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
            operationName: 'page-composer/ai/plan',
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

export type GenerateSitePlanInput = {
  userId: string;
  request: string;
  provider?: string;
  requestedModel?: string;
};

export type GenerateSitePlanOutput = SitePlanResult & { credits: number; model: string; provider: string };

/** Genera un sitio: valida créditos, llama al modelo, valida el schema y cobra. */
export async function generateSitePlan(input: GenerateSitePlanInput): Promise<GenerateSitePlanOutput> {
  const provider = input.provider ?? DEFAULT_PROVIDER;
  const estimate = estimateSitePlan(input.request, provider, input.requestedModel);
  const model = resolvePlannerModel(provider, input.requestedModel);
  const startedAt = Date.now();

  await connectToDatabase();
  await ensureCreditAccount(input.userId);
  const account = await AICreditAccount.findOne({ userId: input.userId }).lean();
  const balance = (account?.subscriptionBalance ?? account?.balance ?? 0) + (account?.purchasedBalance ?? 0);
  if (balance < estimate.credits) {
    throw new AIPlanError(
      'INSUFFICIENT_CREDITS',
      `Necesitas ${estimate.credits} créditos y tienes ${balance}.`
    );
  }

  try {
    const callModel = (system: string, user: string, activeModel: string) =>
      callPlannerModel(provider, activeModel, system, user);
    const { schema, warnings } = await planSite(input.request, { callModel, model });

    await spendCredits(input.userId, estimate.credits, provider, model);
    await recordObservabilityEvent({
      category: 'ai_generation',
      name: 'page_composer_ai_plan',
      route: '/api/page-composer/ai/plan',
      userId: input.userId,
      status: 'success',
      durationMs: Date.now() - startedAt,
      value: estimate.credits,
      unit: 'credits',
      costUsd: estimate.estimatedApiCostUsd,
      metadata: { provider, model, warnings: warnings.length, pages: schema.pages.length },
    });

    return { schema, warnings, credits: estimate.credits, model, provider };
  } catch (error) {
    await recordObservabilityEvent({
      category: 'ai_generation',
      name: 'page_composer_ai_plan',
      route: '/api/page-composer/ai/plan',
      userId: input.userId,
      status: 'error',
      durationMs: Date.now() - startedAt,
      metadata: { provider, model, code: error instanceof AIPlanError ? error.code : 'unknown' },
    });
    throw error;
  }
}
