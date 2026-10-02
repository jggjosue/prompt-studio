import "server-only";

export type PromptStudioTextPlan = "free" | "creator" | "pro" | "studio";

export type PromptStudioTextPlanLimit = {
  monthlyGenerations: number;
  reservedCreditsPerGeneration: number;
};

const DEFAULT_LIMITS: Record<PromptStudioTextPlan, PromptStudioTextPlanLimit> = {
  free: { monthlyGenerations: 25, reservedCreditsPerGeneration: 1 },
  creator: { monthlyGenerations: 250, reservedCreditsPerGeneration: 1 },
  pro: { monthlyGenerations: 1_000, reservedCreditsPerGeneration: 1 },
  studio: { monthlyGenerations: 5_000, reservedCreditsPerGeneration: 1 },
};

export function getPromptStudioTextPlanLimit(
  plan: PromptStudioTextPlan,
  env: NodeJS.ProcessEnv = process.env,
): PromptStudioTextPlanLimit {
  const prefix = `PROMPTSTUDIO_TEXT_${plan.toUpperCase()}`;
  return {
    monthlyGenerations: positiveInteger(
      env[`${prefix}_MONTHLY_GENERATIONS`],
      DEFAULT_LIMITS[plan].monthlyGenerations,
    ),
    reservedCreditsPerGeneration: positiveNumber(
      env[`${prefix}_CREDITS_PER_GENERATION`],
      DEFAULT_LIMITS[plan].reservedCreditsPerGeneration,
    ),
  };
}

export function utcMonthWindow(now = new Date()): {
  key: string;
  start: Date;
  end: Date;
} {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return {
    key: `${start.getUTCFullYear()}-${String(start.getUTCMonth() + 1).padStart(2, "0")}`,
    start,
    end,
  };
}

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function positiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
