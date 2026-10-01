import assert from "node:assert/strict";
import test from "node:test";

import {
  createAwsSqsGenerationMessage,
  parseAwsSqsGenerationMessage,
} from "../../src/lib/ai-generation/aws-sqs-contract";

test("creates a minimal versioned image generation message", () => {
  const message = createAwsSqsGenerationMessage({
    generationId: "gen_123",
    workload: "image",
    now: new Date("2026-10-01T08:00:00.000Z"),
  });

  assert.deepEqual(message, {
    version: 1,
    generationId: "gen_123",
    workload: "image",
    enqueuedAt: "2026-10-01T08:00:00.000Z",
  });
});

test("rejects messages without a generationId", () => {
  assert.throws(
    () =>
      parseAwsSqsGenerationMessage({
        version: 1,
        generationId: "",
        workload: "image",
        enqueuedAt: "2026-10-01T08:00:00.000Z",
      }),
    /generationId is required/,
  );
});

test("rejects unknown workloads and message versions", () => {
  assert.throws(
    () =>
      parseAwsSqsGenerationMessage({
        version: 1,
        generationId: "gen_123",
        workload: "audio",
        enqueuedAt: "2026-10-01T08:00:00.000Z",
      }),
    /Unsupported generation workload/,
  );

  assert.throws(
    () =>
      parseAwsSqsGenerationMessage({
        version: 2,
        generationId: "gen_123",
        workload: "image",
        enqueuedAt: "2026-10-01T08:00:00.000Z",
      }),
    /Unsupported SQS generation message version/,
  );
});
