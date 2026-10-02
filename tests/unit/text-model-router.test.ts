import assert from "node:assert/strict";
import test from "node:test";

import { getTextRoutingConfig } from "../../src/lib/generation/text-model-config.ts";
import { generatePromptStudioText } from "../../src/lib/generation/text-model-router.ts";
import {
  TextProviderError,
  type TextGenerationInput,
  type TextProvider,
} from "../../src/lib/generation/text-provider.ts";

const input: TextGenerationInput = {
  model: "promptstudio-fast",
  messages: [{ role: "user", content: "Create a product prompt." }],
  maxTokens: 200,
};

test("feature flag defaults routing to external when self-hosted is disabled", () => {
  const config = getTextRoutingConfig({});
  assert.equal(config.enabled, false);
  assert.equal(config.primary, "external");
});

test("feature flag selects self-hosted as primary when enabled", () => {
  const config = getTextRoutingConfig({
    PROMPTSTUDIO_TEXT_MODEL_ENABLED: "true",
  });
  assert.equal(config.enabled, true);
  assert.equal(config.primary, "self-hosted");
  assert.equal(config.fallback, "external");
});

test("router selects self-hosted provider through logical model id", async () => {
  process.env.PROMPTSTUDIO_TEXT_MODEL_ENABLED = "true";
  delete process.env.PROMPTSTUDIO_TEXT_PRIMARY_PROVIDER;

  const result = await generatePromptStudioText(input, {
    selfHosted: provider("self-hosted", "promptstudio-fast"),
    external: provider("external", "external-test"),
  });

  assert.equal(result.provider, "self-hosted");
  assert.equal(result.model, "promptstudio-fast");
});

test("router falls back on retryable provider failure", async () => {
  process.env.PROMPTSTUDIO_TEXT_MODEL_ENABLED = "true";
  delete process.env.PROMPTSTUDIO_TEXT_PRIMARY_PROVIDER;

  const failing: TextProvider = {
    id: "self-hosted",
    async generate() {
      throw new TextProviderError(
        "provider_unavailable",
        "temporary",
        "self-hosted",
        true,
        503,
      );
    },
  };

  const result = await generatePromptStudioText(input, {
    selfHosted: failing,
    external: provider("external", "fallback-test"),
  });

  assert.equal(result.provider, "external");
  assert.equal(result.upstreamModel, "fallback-test");
});

test("router does not fallback on authentication errors", async () => {
  process.env.PROMPTSTUDIO_TEXT_MODEL_ENABLED = "true";
  delete process.env.PROMPTSTUDIO_TEXT_PRIMARY_PROVIDER;

  const failing: TextProvider = {
    id: "self-hosted",
    async generate() {
      throw new TextProviderError(
        "provider_authentication",
        "bad secret",
        "self-hosted",
        false,
        401,
      );
    },
  };

  await assert.rejects(
    () =>
      generatePromptStudioText(input, {
        selfHosted: failing,
        external: provider("external", "fallback-test"),
      }),
    (error: unknown) =>
      error instanceof TextProviderError &&
      error.code === "provider_authentication",
  );
});

function provider(
  id: "self-hosted" | "external",
  upstreamModel: string,
): TextProvider {
  return {
    id,
    async generate(request) {
      return {
        provider: id,
        model: request.model,
        upstreamModel,
        response: new Response("ok"),
      };
    },
  };
}
