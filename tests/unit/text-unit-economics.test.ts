import assert from "node:assert/strict";
import test from "node:test";

import {
  percentile,
  summarizeTextUnitEconomics,
} from "../../src/lib/generation/text-unit-economics.ts";
import { evaluateTextEconomicsAlerts } from "../../src/lib/generation/text-economics-alerts.ts";

test("unit economics calculates spend, active users, and nearest-rank percentiles", () => {
  const metrics = summarizeTextUnitEconomics([
    { generationId: "1", userId: "a", logicalModel: "promptstudio-fast", provider: "self-hosted", status: "completed", inputTokens: 100, outputTokens: 200, ttftMs: 100, latencyMs: 1000, runtimeSeconds: 1, actualCostUsd: 0.01, createdAt: new Date() },
    { generationId: "2", userId: "b", logicalModel: "promptstudio-fast", provider: "self-hosted", status: "completed", inputTokens: 200, outputTokens: 300, ttftMs: 300, latencyMs: 3000, runtimeSeconds: 3, actualCostUsd: 0.03, createdAt: new Date() },
    { generationId: "3", userId: "a", logicalModel: "promptstudio-fast", provider: "self-hosted", status: "failed", ttftMs: 200, latencyMs: 2000, estimatedCostUsd: 0.01, createdAt: new Date() },
  ]);

  assert.equal(metrics.generations, 3);
  assert.equal(metrics.successful, 2);
  assert.equal(metrics.failed, 1);
  assert.equal(metrics.activeUsers, 2);
  assert.equal(metrics.inputTokens, 300);
  assert.equal(metrics.outputTokens, 500);
  assert.equal(metrics.spendUsd, 0.05);
  assert.equal(metrics.p50TtftMs, 200);
  assert.equal(metrics.p95LatencyMs, 3000);
});

test("percentile ignores missing values", () => {
  assert.equal(percentile([null, 10, undefined, 20, 30], 0.95), 30);
  assert.equal(percentile([null, undefined], 0.5), null);
});

test("alerts cover failure rate, latency, and spend", () => {
  const alerts = evaluateTextEconomicsAlerts({
    generations: 100,
    successful: 90,
    failed: 10,
    activeUsers: 10,
    successRate: 0.9,
    inputTokens: 0,
    outputTokens: 0,
    runtimeSeconds: 0,
    spendUsd: 90,
    costPerGenerationUsd: 0.9,
    costPerActiveUserUsd: 9,
    p50TtftMs: 100,
    p95TtftMs: 200,
    p50LatencyMs: 1000,
    p95LatencyMs: 35_000,
  }, {
    warningFailureRate: 0.03,
    criticalFailureRate: 0.08,
    warningP95LatencyMs: 15_000,
    criticalP95LatencyMs: 30_000,
    warningMonthlySpendUsd: 50,
    criticalMonthlySpendUsd: 80,
  });

  assert.deepEqual(alerts.map((alert) => alert.code).sort(), [
    "FAILURE_RATE",
    "MONTHLY_SPEND",
    "P95_LATENCY",
  ]);
  assert.ok(alerts.every((alert) => alert.severity === "critical"));
});
