import "server-only";

import connectToDatabase from "@/lib/mongoose";
import {
  getPromptStudioTextPlanLimit,
  utcMonthWindow,
  type PromptStudioTextPlan,
} from "@/lib/generation/promptstudio-text-usage-policy";
import PromptStudioTextUsage from "@/models/PromptStudioTextUsage";

export type TextUsageReservation = {
  allowed: true;
  generationId: string;
  monthlyUsed: number;
  monthlyLimit: number;
  reservedCredits: number;
} | {
  allowed: false;
  reason: "MONTHLY_QUOTA_EXHAUSTED";
  monthlyUsed: number;
  monthlyLimit: number;
};

export async function reservePromptStudioTextUsage(input: {
  generationId: string;
  userId: string;
  plan: PromptStudioTextPlan;
  provider: string;
}): Promise<TextUsageReservation> {
  await connectToDatabase();
  const month = utcMonthWindow();
  const limit = getPromptStudioTextPlanLimit(input.plan);

  const existing = await PromptStudioTextUsage.findOne({
    generationId: input.generationId,
    userId: input.userId,
  }).lean();

  if (existing) {
    return {
      allowed: true,
      generationId: input.generationId,
      monthlyUsed: await countMonthlyUsage(input.userId, month.key),
      monthlyLimit: limit.monthlyGenerations,
      reservedCredits: existing.reservedCredits,
    };
  }

  const monthlyUsed = await countMonthlyUsage(input.userId, month.key);
  if (monthlyUsed >= limit.monthlyGenerations) {
    return {
      allowed: false,
      reason: "MONTHLY_QUOTA_EXHAUSTED",
      monthlyUsed,
      monthlyLimit: limit.monthlyGenerations,
    };
  }

  await PromptStudioTextUsage.create({
    generationId: input.generationId,
    userId: input.userId,
    plan: input.plan,
    logicalModel: "promptstudio-fast",
    provider: input.provider,
    state: "reserved",
    monthKey: month.key,
    reservedCredits: limit.reservedCreditsPerGeneration,
    creditsCharged: 0,
  });

  return {
    allowed: true,
    generationId: input.generationId,
    monthlyUsed: monthlyUsed + 1,
    monthlyLimit: limit.monthlyGenerations,
    reservedCredits: limit.reservedCreditsPerGeneration,
  };
}

export async function completePromptStudioTextUsage(input: {
  generationId: string;
  inputTokens?: number | null;
  outputTokens?: number | null;
  runtimeSeconds?: number | null;
  estimatedCostUsd?: number | null;
  actualCostUsd?: number | null;
  creditsCharged?: number | null;
}): Promise<void> {
  await connectToDatabase();
  await PromptStudioTextUsage.updateOne(
    { generationId: input.generationId, state: "reserved" },
    {
      $set: {
        state: "completed",
        inputTokens: input.inputTokens ?? null,
        outputTokens: input.outputTokens ?? null,
        runtimeSeconds: input.runtimeSeconds ?? null,
        estimatedCostUsd: input.estimatedCostUsd ?? null,
        actualCostUsd: input.actualCostUsd ?? null,
        creditsCharged: Math.max(0, input.creditsCharged ?? 0),
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );
}

export async function refundPromptStudioTextUsage(input: {
  generationId: string;
  state: "failed" | "cancelled";
  errorCode?: string;
}): Promise<void> {
  await connectToDatabase();
  await PromptStudioTextUsage.updateOne(
    { generationId: input.generationId, state: "reserved" },
    {
      $set: {
        state: "refunded",
        creditsCharged: 0,
        errorCode: input.errorCode ?? input.state,
        completedAt: new Date(),
        updatedAt: new Date(),
      },
    },
  );
}

export async function getPromptStudioTextUsage(input: {
  userId?: string;
  plan?: PromptStudioTextPlan;
  logicalModel?: "promptstudio-fast";
  monthKey?: string;
  limit?: number;
}) {
  await connectToDatabase();
  const query: Record<string, unknown> = {};
  if (input.userId) query.userId = input.userId;
  if (input.plan) query.plan = input.plan;
  if (input.logicalModel) query.logicalModel = input.logicalModel;
  if (input.monthKey) query.monthKey = input.monthKey;

  return PromptStudioTextUsage.find(query)
    .sort({ createdAt: -1 })
    .limit(Math.min(Math.max(input.limit ?? 100, 1), 500))
    .lean();
}

async function countMonthlyUsage(userId: string, monthKey: string): Promise<number> {
  return PromptStudioTextUsage.countDocuments({
    userId,
    monthKey,
    state: { $in: ["reserved", "completed"] },
  });
}
