import { ExternalOpenAITextProvider } from "./external-openai-text-provider";
import { getTextRoutingConfig } from "./text-model-config";
import {
  TextProviderError,
  type TextGenerationInput,
  type TextGenerationResult,
  type TextProvider,
  type TextProviderId,
} from "./text-provider";
import { SelfHostedTextProvider } from "./self-hosted-text-provider";

export type TextRouterDependencies = {
  selfHosted?: TextProvider;
  external?: TextProvider;
};

export async function generatePromptStudioText(
  input: TextGenerationInput,
  dependencies: TextRouterDependencies = {},
): Promise<TextGenerationResult> {
  const config = getTextRoutingConfig();

  if (input.model === "promptstudio-fast" && !config.enabled) {
    return providerFor(config.primary, config, dependencies).generate(input);
  }

  const primary = providerFor(config.primary, config, dependencies);

  try {
    return await primary.generate(input);
  } catch (error) {
    if (
      !(error instanceof TextProviderError) ||
      !error.retryable ||
      !config.fallback ||
      config.fallback === config.primary
    ) {
      throw error;
    }

    const fallback = providerFor(config.fallback, config, dependencies);
    return fallback.generate(input);
  }
}

function providerFor(
  id: TextProviderId,
  config: ReturnType<typeof getTextRoutingConfig>,
  dependencies: TextRouterDependencies,
): TextProvider {
  if (id === "self-hosted") {
    if (!config.enabled) {
      throw new TextProviderError(
        "provider_disabled",
        "Self-hosted text provider is disabled.",
        "self-hosted",
        false,
      );
    }
    return dependencies.selfHosted ?? new SelfHostedTextProvider();
  }

  return (
    dependencies.external ??
    new ExternalOpenAITextProvider(config.externalModel)
  );
}
