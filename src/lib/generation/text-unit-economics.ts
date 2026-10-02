import "server-only";

export type TextGenerationTelemetry = {
  generationId: string;
  userId?: string | null;
  plan?: string | null;
  logicalModel: string;
  modelRevision?: string | null;
  provider: string;
  runtime?: string | null;
  status: string;
  errorCategory?: string | null;
  inputTokens?: number | null;
  outputTokens?: number | null;
  ttftMs?: number | null;
  latencyMs?: number | null;
  runtimeSeconds?: number | null;
  estimatedCostUsd?: number | null;
  actualCostUsd?: number | null;
  coldStart?: boolean | null;
  concurrency?: number | null;
  queueDepth?: number | null;
  createdAt: Date;
};

export type TextUnitEconomics = {
  generations: number;
  successful: number;
  failed: number;
  activeUsers: number;
  successRate: number;
  inputTokens: number;
  outputTokens: number;
  runtimeSeconds: number;
  spendUsd: number;
  costPerGenerationUsd: number;
  costPerActiveUserUsd: number;
  p50TtftMs: number | null;
  p95TtftMs: number | null;
  p50LatencyMs: number | null;
  p95LatencyMs: number | null;
};

export function summarizeTextUnitEconomics(
  rows: readonly TextGenerationTelemetry[],
): TextUnitEconomics {
  const successfulRows = rows.filter((row) => row.status === "completed");
  const failed = rows.filter((row) =>
    ["failed", "refunded", "cancelled"].includes(row.status),
  ).length;
  const activeUsers = new Set(
    rows.map((row) => row.userId).filter((value): value is string => Boolean(value)),
  ).size;
  const spendUsd = sum(rows.map((row) => row.actualCostUsd ?? row.estimatedCostUsd ?? 0));

  return {
    generations: rows.length,
    successful: successfulRows.length,
    failed,
    activeUsers,
    successRate: rows.length === 0 ? 1 : successfulRows.length / rows.length,
    inputTokens: sum(rows.map((row) => row.inputTokens ?? 0)),
    outputTokens: sum(rows.map((row) => row.outputTokens ?? 0)),
    runtimeSeconds: sum(rows.map((row) => row.runtimeSeconds ?? 0)),
    spendUsd,
    costPerGenerationUsd: rows.length === 0 ? 0 : spendUsd / rows.length,
    costPerActiveUserUsd: activeUsers === 0 ? 0 : spendUsd / activeUsers,
    p50TtftMs: percentile(rows.map((row) => row.ttftMs), 0.5),
    p95TtftMs: percentile(rows.map((row) => row.ttftMs), 0.95),
    p50LatencyMs: percentile(rows.map((row) => row.latencyMs), 0.5),
    p95LatencyMs: percentile(rows.map((row) => row.latencyMs), 0.95),
  };
}

export function percentile(
  values: readonly (number | null | undefined)[],
  p: number,
): number | null {
  const sorted = values
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value))
    .sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const index = Math.max(0, Math.ceil(p * sorted.length) - 1);
  return sorted[index];
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}
