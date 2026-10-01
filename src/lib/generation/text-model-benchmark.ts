export type BenchmarkSample = {
  caseId: string;
  concurrency: number;
  startedAt: string;
  ttftMs: number;
  totalLatencyMs: number;
  outputTokens: number;
  tokenCountEstimated: boolean;
  tokensPerSecond: number;
  inputTokens?: number;
  costUsd?: number;
  gpuMemoryUsedMb?: number;
  gpuMemoryTotalMb?: number;
  ramUsedMb?: number;
  ramTotalMb?: number;
  contractScore?: number;
  error?: string;
};

export type Summary = {
  samples: number;
  successRate: number;
  p50TtftMs: number;
  p95TtftMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p50TokensPerSecond: number;
  p95TokensPerSecond: number;
  averageCostUsd?: number;
  p95CostUsd?: number;
  peakGpuMemoryUsedMb?: number;
  peakRamUsedMb?: number;
};

export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(rank, sorted.length - 1))];
}

export function estimateTokenCount(text: string): number {
  if (!text.trim()) return 0;
  // Portable fallback for endpoints that do not return streaming usage.
  // The benchmark marks this value as estimated so it is never confused with
  // tokenizer-reported usage.
  return Math.max(1, Math.ceil(text.length / 4));
}

export function calculateCostUsd(args: {
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  hourlyCostUsd?: number;
  inputCostPerMillion?: number;
  outputCostPerMillion?: number;
}): number | undefined {
  const runtimeCost =
    args.hourlyCostUsd == null
      ? 0
      : (args.durationMs / 3_600_000) * args.hourlyCostUsd;
  const tokenCost =
    ((args.inputTokens ?? 0) / 1_000_000) * (args.inputCostPerMillion ?? 0) +
    ((args.outputTokens ?? 0) / 1_000_000) * (args.outputCostPerMillion ?? 0);

  const hasRuntime = args.hourlyCostUsd != null;
  const hasTokenPricing =
    args.inputCostPerMillion != null || args.outputCostPerMillion != null;

  if (!hasRuntime && !hasTokenPricing) return undefined;
  return runtimeCost + tokenCost;
}

export function summarize(samples: BenchmarkSample[]): Summary {
  const successful = samples.filter((sample) => !sample.error);
  const costs = successful
    .map((sample) => sample.costUsd)
    .filter((value): value is number => value != null);

  const gpu = successful
    .map((sample) => sample.gpuMemoryUsedMb)
    .filter((value): value is number => value != null);
  const ram = successful
    .map((sample) => sample.ramUsedMb)
    .filter((value): value is number => value != null);

  return {
    samples: samples.length,
    successRate: samples.length === 0 ? 0 : successful.length / samples.length,
    p50TtftMs: percentile(successful.map((s) => s.ttftMs), 50),
    p95TtftMs: percentile(successful.map((s) => s.ttftMs), 95),
    p50LatencyMs: percentile(successful.map((s) => s.totalLatencyMs), 50),
    p95LatencyMs: percentile(successful.map((s) => s.totalLatencyMs), 95),
    p50TokensPerSecond: percentile(
      successful.map((s) => s.tokensPerSecond),
      50,
    ),
    p95TokensPerSecond: percentile(
      successful.map((s) => s.tokensPerSecond),
      95,
    ),
    averageCostUsd:
      costs.length === 0
        ? undefined
        : costs.reduce((sum, value) => sum + value, 0) / costs.length,
    p95CostUsd: costs.length === 0 ? undefined : percentile(costs, 95),
    peakGpuMemoryUsedMb: gpu.length === 0 ? undefined : Math.max(...gpu),
    peakRamUsedMb: ram.length === 0 ? undefined : Math.max(...ram),
  };
}

export function scoreContract(
  text: string,
  criteria: {
    minWords?: number;
    maxWords?: number;
    requiredAny?: string[];
    forbidden?: string[];
    requiredHeadings?: string[];
  },
): number {
  let score = 100;
  const normalized = text.toLowerCase();
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  if (criteria.minWords != null && words < criteria.minWords) score -= 20;
  if (criteria.maxWords != null && words > criteria.maxWords) score -= 20;

  if (
    criteria.requiredAny?.length &&
    !criteria.requiredAny.some((term) => normalized.includes(term.toLowerCase()))
  ) {
    score -= 20;
  }

  if (
    criteria.forbidden?.some((term) =>
      normalized.includes(term.toLowerCase()),
    )
  ) {
    score -= 20;
  }

  if (
    criteria.requiredHeadings?.some(
      (heading) => !normalized.includes(heading.toLowerCase()),
    )
  ) {
    score -= 20;
  }

  return Math.max(0, score);
}
