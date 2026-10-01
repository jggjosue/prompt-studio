import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateCostUsd,
  estimateTokenCount,
  percentile,
  scoreContract,
  summarize,
  type BenchmarkSample,
} from "../../src/lib/generation/text-model-benchmark.ts";

test("percentile returns nearest-rank values", () => {
  assert.equal(percentile([1, 2, 3, 4, 5], 50), 3);
  assert.equal(percentile([1, 2, 3, 4, 5], 95), 5);
  assert.equal(percentile([], 95), 0);
});

test("cost calculator supports runtime and token pricing", () => {
  assert.equal(
    calculateCostUsd({
      durationMs: 10_000,
      hourlyCostUsd: 0.72,
    }),
    0.002,
  );

  assert.equal(
    calculateCostUsd({
      durationMs: 0,
      inputTokens: 1_000_000,
      outputTokens: 500_000,
      inputCostPerMillion: 0.1,
      outputCostPerMillion: 0.3,
    }),
    0.25,
  );
});

test("summarize reports p50/p95, cost, memory and success rate", () => {
  const samples: BenchmarkSample[] = Array.from({ length: 10 }, (_, index) => ({
    caseId: "case",
    concurrency: 1,
    startedAt: "2026-10-01T00:00:00.000Z",
    ttftMs: index + 1,
    totalLatencyMs: (index + 1) * 10,
    outputTokens: 100,
    tokenCountEstimated: false,
    tokensPerSecond: index + 1,
    costUsd: (index + 1) / 1000,
    gpuMemoryUsedMb: 10_000 + index,
    ramUsedMb: 2_000 + index,
  }));
  samples.push({
    caseId: "case",
    concurrency: 1,
    startedAt: "2026-10-01T00:00:00.000Z",
    ttftMs: 1,
    totalLatencyMs: 1,
    outputTokens: 0,
    tokenCountEstimated: true,
    tokensPerSecond: 0,
    error: "failed",
  });

  const summary = summarize(samples);
  assert.equal(summary.samples, 11);
  assert.equal(summary.successRate, 10 / 11);
  assert.equal(summary.p50TtftMs, 5);
  assert.equal(summary.p95TtftMs, 10);
  assert.equal(summary.p50LatencyMs, 50);
  assert.equal(summary.p95LatencyMs, 100);
  assert.equal(summary.peakGpuMemoryUsedMb, 10_009);
  assert.equal(summary.peakRamUsedMb, 2_009);
});

test("contract scoring penalizes broken output constraints", () => {
  const good =
    "Hero\nA professional SaaS prompt for freelancers. FAQ\nUseful details. CTA\nStart now.";
  assert.equal(
    scoreContract(good, {
      minWords: 5,
      maxWords: 50,
      requiredAny: ["saas"],
      forbidden: ["cannot"],
      requiredHeadings: ["hero", "faq", "cta"],
    }),
    100,
  );

  assert.ok(estimateTokenCount("A moderately sized response") > 0);
});
