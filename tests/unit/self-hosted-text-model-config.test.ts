import assert from "node:assert/strict";
import test from "node:test";

import {
  SELF_HOSTED_TEXT_MODEL,
  SELF_HOSTED_TEXT_MODEL_REF,
} from "../../src/lib/generation/self-hosted-text-model-config.ts";

test("self-hosted text model is pinned to an immutable Hugging Face revision", () => {
  assert.equal(SELF_HOSTED_TEXT_MODEL.modelId, "Qwen/Qwen3-8B");
  assert.match(SELF_HOSTED_TEXT_MODEL.revision, /^[0-9a-f]{40}$/);
  assert.equal(
    SELF_HOSTED_TEXT_MODEL.revision,
    "b968826d9c46dd6066d109eabc6255188de91218",
  );

  assert.equal(
    SELF_HOSTED_TEXT_MODEL_REF,
    "Qwen/Qwen3-8B@b968826d9c46dd6066d109eabc6255188de91218",
  );

  for (const url of [
    SELF_HOSTED_TEXT_MODEL.sourceUrl,
    SELF_HOSTED_TEXT_MODEL.modelCardUrl,
    SELF_HOSTED_TEXT_MODEL.licenseUrl,
  ]) {
    assert.match(url, new RegExp(SELF_HOSTED_TEXT_MODEL.revision));
    assert.doesNotMatch(url, /\/main(?:\/|$)|\/master(?:\/|$)|\/latest(?:\/|$)/);
  }
});

test("approved self-hosted text model records the reviewed commercial license", () => {
  assert.equal(SELF_HOSTED_TEXT_MODEL.license, "Apache-2.0");
});
