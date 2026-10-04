import { createHash } from "node:crypto";

export type TextRolloutStage = "off" | "internal" | "canary" | "primary";

export type TextRolloutPolicy = {
  stage: TextRolloutStage;
  canaryPercent: number;
  internalUserIds: Set<string>;
};

export type TextRolloutMetrics = {
  samples: number;
  successRate: number;
  p95TtftMs: number | null;
  p95LatencyMs: number | null;
  costPerGenerationUsd: number;
  qualityScore?: number | null;
};

export const TEXT_ROLLOUT_GATES = {
  minSamples: 100,
  minSuccessRate: 0.97,
  maxP95TtftMs: 2_500,
  maxP95LatencyMs: 15_000,
  minQualityScore: 4,
  maxCostRegressionRatio: 1,
} as const;

export function getTextRolloutPolicy(
  env: NodeJS.ProcessEnv = process.env,
): TextRolloutPolicy {
  const stage = parseStage(env.PROMPTSTUDIO_TEXT_ROLLOUT_STAGE);
  return {
    stage,
    canaryPercent: clampPercent(Number(env.PROMPTSTUDIO_TEXT_CANARY_PERCENT ?? 0)),
    internalUserIds: new Set(
      (env.PROMPTSTUDIO_TEXT_INTERNAL_USER_IDS ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  };
}

export function shouldUsePromptStudioAI(input: {
  userId: string;
  generationId: string;
  policy?: TextRolloutPolicy;
}): boolean {
  const policy = input.policy ?? getTextRolloutPolicy();

  if (policy.stage === "off") return false;
  if (policy.stage === "primary") return true;
  if (policy.stage === "internal") return policy.internalUserIds.has(input.userId);
  if (policy.internalUserIds.has(input.userId)) return true;

  return deterministicBucket(input.userId, input.generationId) < policy.canaryPercent;
}

export function evaluateTextRolloutGates(input: {
  candidate: TextRolloutMetrics;
  baselineCostPerGenerationUsd: number;
}): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const metrics = input.candidate;

  if (metrics.samples < TEXT_ROLLOUT_GATES.minSamples) reasons.push("insufficient_samples");
  if (metrics.successRate < TEXT_ROLLOUT_GATES.minSuccessRate) reasons.push("success_rate");
  if (metrics.p95TtftMs === null || metrics.p95TtftMs > TEXT_ROLLOUT_GATES.maxP95TtftMs) {
    reasons.push("p95_ttft");
  }
  if (metrics.p95LatencyMs === null || metrics.p95LatencyMs > TEXT_ROLLOUT_GATES.maxP95LatencyMs) {
    reasons.push("p95_latency");
  }
  if (
    metrics.qualityScore !== undefined &&
    metrics.qualityScore !== null &&
    metrics.qualityScore < TEXT_ROLLOUT_GATES.minQualityScore
  ) {
    reasons.push("quality");
  }
  if (
    input.baselineCostPerGenerationUsd > 0 &&
    metrics.costPerGenerationUsd >
      input.baselineCostPerGenerationUsd * TEXT_ROLLOUT_GATES.maxCostRegressionRatio
  ) {
    reasons.push("cost");
  }

  return { pass: reasons.length === 0, reasons };
}

function deterministicBucket(userId: string, generationId: string): number {
  const digest = createHash("sha256").update(`${userId}:${generationId}`).digest();
  return digest.readUInt32BE(0) % 100;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.floor(value)));
}

function parseStage(value: string | undefined): TextRolloutStage {
  return value === "internal" || value === "canary" || value === "primary"
    ? value
    : "off";
}
