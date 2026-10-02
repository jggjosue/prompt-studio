import assert from "node:assert/strict";
import test from "node:test";

import {
  InMemoryInferenceGuard,
  TEXT_INFERENCE_SECURITY,
  TextInferenceSecurityError,
  fingerprintIdentifier,
  safeEqualSecret,
  sanitizedInferenceLog,
  validateTextGenerationRequest,
} from "../../src/lib/generation/text-inference-security.ts";

test("accepts a bounded generation request", () => {
  const request = validateTextGenerationRequest({
    messages: [{ role: "user", content: "Create a product prompt." }],
    maxTokens: 500,
    temperature: 0.7,
  });

  assert.equal(request.maxTokens, 500);
});

test("rejects oversized prompt and output token requests", () => {
  assert.throws(
    () =>
      validateTextGenerationRequest({
        messages: [
          {
            role: "user",
            content: "x".repeat(
              TEXT_INFERENCE_SECURITY.maxMessageCharacters + 1,
            ),
          },
        ],
        maxTokens: 10,
      }),
    TextInferenceSecurityError,
  );

  assert.throws(
    () =>
      validateTextGenerationRequest({
        messages: [{ role: "user", content: "ok" }],
        maxTokens: TEXT_INFERENCE_SECURITY.maxOutputTokens + 1,
      }),
    TextInferenceSecurityError,
  );
});

test("rate guard rejects requests above the per-window limit", () => {
  const guard = new InMemoryInferenceGuard();
  const now = 1_000;

  for (
    let i = 0;
    i < TEXT_INFERENCE_SECURITY.rateLimit.requestsPerWindow;
    i += 1
  ) {
    guard.checkRateLimit("user-1", now);
  }

  assert.throws(
    () => guard.checkRateLimit("user-1", now),
    (error: unknown) =>
      error instanceof TextInferenceSecurityError &&
      error.code === "rate_limited" &&
      error.status === 429,
  );
});

test("sanitized logs never include actor id or prompt content", () => {
  const log = sanitizedInferenceLog({
    requestId: "req-1",
    actorId: "user-secret-id",
    model: "promptstudio-fast",
    messageCount: 2,
    promptCharacters: 123,
    maxTokens: 200,
    status: "completed",
  });

  const serialized = JSON.stringify(log);
  assert.doesNotMatch(serialized, /user-secret-id/);
  assert.equal(log.actorFingerprint, fingerprintIdentifier("user-secret-id"));
  assert.equal("prompt" in log, false);
  assert.equal("messages" in log, false);
});

test("secret comparison is timing-safe for equal-length values", () => {
  assert.equal(safeEqualSecret("same-secret", "same-secret"), true);
  assert.equal(safeEqualSecret("wrong-value", "same-secret"), false);
  assert.equal(safeEqualSecret(undefined, "same-secret"), false);
});
