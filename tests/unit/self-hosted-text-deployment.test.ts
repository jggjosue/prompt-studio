import assert from "node:assert/strict";
import test from "node:test";

import { SELF_HOSTED_TEXT_DEPLOYMENT } from "../../src/lib/generation/self-hosted-text-deployment.ts";

test("self-hosted deployment pins model and runtime revisions", () => {
  assert.equal(SELF_HOSTED_TEXT_DEPLOYMENT.provider, "modal");
  assert.equal(SELF_HOSTED_TEXT_DEPLOYMENT.gpu, "L4");
  assert.equal(
    SELF_HOSTED_TEXT_DEPLOYMENT.upstreamRevision,
    "b968826d9c46dd6066d109eabc6255188de91218",
  );
  assert.match(
    SELF_HOSTED_TEXT_DEPLOYMENT.upstreamRevision,
    /^[0-9a-f]{40}$/,
  );
  assert.match(SELF_HOSTED_TEXT_DEPLOYMENT.runtime.image, /^vllm\/vllm-openai:v\d+/);
});

test("deployment exposes the expected OpenAI-compatible endpoints", () => {
  assert.equal(
    SELF_HOSTED_TEXT_DEPLOYMENT.endpoints.chatCompletions,
    "/v1/chat/completions",
  );
  assert.equal(SELF_HOSTED_TEXT_DEPLOYMENT.endpoints.models, "/v1/models");
  assert.equal(SELF_HOSTED_TEXT_DEPLOYMENT.endpoints.health, "/health");
  assert.equal(SELF_HOSTED_TEXT_DEPLOYMENT.servedModelName, "promptstudio-fast");
});
