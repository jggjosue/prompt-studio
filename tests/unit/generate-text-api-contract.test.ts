import assert from "node:assert/strict";
import test from "node:test";

import { GENERATE_TEXT_API } from "../../src/lib/generation/generate-text-api-contract.ts";

test("public generate-text contract exposes only logical model identity", () => {
  assert.equal(GENERATE_TEXT_API.path, "/api/ai/generate-text");
  assert.equal(GENERATE_TEXT_API.model, "promptstudio-fast");

  const serialized = JSON.stringify(GENERATE_TEXT_API).toLowerCase();
  assert.doesNotMatch(serialized, /qwen/);
  assert.doesNotMatch(serialized, /modal/);
  assert.doesNotMatch(serialized, /runpod/);
  assert.doesNotMatch(serialized, /api[_-]?key/);
});

test("generation correlation id is returned through a stable header", () => {
  assert.equal(GENERATE_TEXT_API.generationIdHeader, "X-Generation-Id");
  assert.equal(GENERATE_TEXT_API.streamingContentType, "text/event-stream");
});
