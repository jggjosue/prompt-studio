import assert from "node:assert/strict";
import test from "node:test";

import { isPromptStudioTextStreamingEnabled } from "../../src/lib/generation/promptstudio-text-stream.ts";

test("PromptStudio streaming is opt-in and rollbackable", () => {
  assert.equal(isPromptStudioTextStreamingEnabled(undefined), false);
  assert.equal(isPromptStudioTextStreamingEnabled("false"), false);
  assert.equal(isPromptStudioTextStreamingEnabled("true"), true);
});
