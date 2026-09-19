import { estimateAICredits } from '@/lib/ai-credit-config';
import { captureCredits, getCreditBalance, refundCredits, reserveCredits } from '@/lib/ai-job-service';
import { providerUsage } from '@/lib/generation-pricing';
import type { AIJobKind } from '@/models/AIGenerationJob';
import AIGenerationJob from '@/models/AIGenerationJob';
import 'server-only';

export class AICreditError extends Error {
  readonly code: 'INSUFFICIENT_CREDITS' | 'MODEL_NOT_ALLOWED' | 'CREDIT_LIMIT';
  readonly required: number;
  readonly available: number;

  constructor(code: AICreditError['code'], required: number, available: number) {
    super(code);
    this.name = 'AICreditError';
    this.code = code;
    this.required = required;
    this.available = available;
  }
}

export async function runMeteredInlineAI<T>(input: {
  userId: string;
  userEmail: string;
  kind: AIJobKind;
  provider: string;
  modelId: string;
  operation: string;
  requestId: string;
  payload: Record<string, unknown>;
  execute: () => Promise<T>;
}) {
  const estimate = estimateAICredits({ provider: input.provider, model: input.modelId, kind: input.kind, input: input.payload });
  if (estimate.credits > estimate.maxCredits) throw new AICreditError('CREDIT_LIMIT', estimate.credits, estimate.maxCredits);

  const existing = await AIGenerationJob.findOne({ userId: input.userId, idempotencyKey: input.requestId });
  if (existing?.status === 'completed') return { result: existing.result as T, creditsCharged: existing.creditsCharged ?? existing.creditCost, duplicate: true };
  if (existing) throw new Error('REQUEST_IN_PROGRESS');

  const job = await AIGenerationJob.create({
    userId: input.userId, userEmail: input.userEmail, kind: input.kind, provider: input.provider, modelId: input.modelId, operation: input.operation,
    input: input.payload, idempotencyKey: input.requestId, creditCost: estimate.credits, estimatedCostUsd: estimate.estimatedApiCostUsd,
    estimatedInputTokens: estimate.estimatedInputTokens, estimatedOutputTokens: estimate.estimatedOutputTokens,
  });
  const balance = await reserveCredits(job);
  if (balance === null) {
    await AIGenerationJob.deleteOne({ _id: job._id });
    const current = await getCreditBalance(input.userId);
    throw new AICreditError('INSUFFICIENT_CREDITS', estimate.credits, current.balance);
  }

  try {
    const result = await input.execute();
    const usage = providerUsage(result);
    job.result = result && typeof result === 'object' ? result as Record<string, unknown> : { output: result };
    job.actualInputTokens = usage.inputTokens;
    job.actualOutputTokens = usage.outputTokens;
    job.actualCostUsd = usage.costUsd;
    job.status = 'completed';
    job.progress = 100;
    job.completedAt = new Date();
    job.updatedAt = new Date();
    await captureCredits(job);
    await job.save();
    return { result, creditsCharged: job.creditsCharged ?? job.creditCost, duplicate: false };
  } catch (error) {
    await refundCredits(job);
    job.status = 'failed';
    job.lastError = error instanceof Error ? error.message.slice(0, 500) : 'AI request failed';
    job.completedAt = new Date();
    job.updatedAt = new Date();
    await job.save();
    throw error;
  }
}