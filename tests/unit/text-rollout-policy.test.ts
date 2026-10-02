import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateTextRolloutGates,
  getTextRolloutPolicy,
  shouldUsePromptStudioAI,
} from "../../src/lib/generation/text-rollout-policy.ts";

test("rollout is off by default and supports instant rollback", () => {
  const policy = getTextRolloutPolicy({});
  assert.equal(policy.stage, "off");
  assert.equal(shouldUsePromptStudioAI({ userId: "u", generationId: "g", policy }), false);
});

test("internal rollout only enables allowlisted users", () => {
  const policy = getTextRolloutPolicy({
    PROMPTSTUDIO_TEXT_ROLLOUT_STAGE: "internal",
    PROMPTSTUDIO_TEXT_INTERNAL_USER_IDS: "a,b",
  });
  assert.equal(shouldUsePromptStudioAI({ userId: "a", generationId: "1", policy }), true);
  assert.equal(shouldUsePromptStudioAI({ userId: "c", generationId: "1", policy }), false);
});

test("0 percent canary remains disabled for non-internal users", () => {
  const policy = getTextRolloutPolicy({
    PROMPTSTUDIO_TEXT_ROLLOUT_STAGE: "canary",
    PROMPTSTUDIO_TEXT_CANARY_PERCENT: "0",
  });
  assert.equal(shouldUsePromptStudioAI({ userId: "a", generationId: "1", policy }), false);
});

test("primary stage sends all traffic to PromptStudio AI", () => {
  const policy = getTextRolloutPolicy({ PROMPTSTUDIO_TEXT_ROLLOUT_STAGE: "primary" });
  assert.equal(shouldUsePromptStudioAI({ userId: "any", generationId: "any", policy }), true);
});

test("promotion gates require measured reliability latency and cost", () => {
  const result = evaluateTextRolloutGates({
    candidate: {
      samples: 200,
      successRate: 0.99,
      p95TtftMs: 2_000,
      p95LatencyMs: 12_000,
      costPerGenerationUsd: 0.01,
      qualityScore: 4.3,
    },
    baselineCostPerGenerationUsd: 0.02,
  });
  assert.deepEqual(result, { pass: true, reasons: [] });
});

test("failed gates explain why rollout must not advance", () => {
  const result = evaluateTextRolloutGates({
    candidate: {
      samples: 50,
      successRate: 0.9,
      p95TtftMs: 4_000,
      p95LatencyMs: 20_000,
      costPerGenerationUsd: 0.03,
      qualityScore: 3.5,
    },
    baselineCostPerGenerationUsd: 0.02,
  });
  assert.deepEqual(result.reasons.sort(), [
    "cost",
    "insufficient_samples",
    "p95_latency",
    "p95_ttft",
    "quality",
    "success_rate",
  ]);
});
