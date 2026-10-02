import type { LogicalTextModel, TextProviderId } from "./text-provider";

export type TextRoutingConfig = {
  enabled: boolean;
  primary: TextProviderId;
  fallback?: TextProviderId;
  externalModel: string;
};

export function getTextRoutingConfig(
  env: NodeJS.ProcessEnv = process.env,
): TextRoutingConfig {
  const enabled = env.PROMPTSTUDIO_TEXT_MODEL_ENABLED === "true";
  const primary = parseProvider(
    env.PROMPTSTUDIO_TEXT_PRIMARY_PROVIDER,
    enabled ? "self-hosted" : "external",
  );
  const fallback =
    env.PROMPTSTUDIO_TEXT_FALLBACK_PROVIDER === "none"
      ? undefined
      : parseProvider(
          env.PROMPTSTUDIO_TEXT_FALLBACK_PROVIDER,
          primary === "self-hosted" ? "external" : "self-hosted",
        );

  return {
    enabled,
    primary,
    fallback,
    externalModel:
      env.PROMPTSTUDIO_TEXT_EXTERNAL_MODEL ?? "gpt-4.1-mini",
  };
}

export const LOGICAL_TEXT_MODELS: Record<
  LogicalTextModel,
  { label: string; defaultProvider: TextProviderId }
> = {
  "promptstudio-fast": {
    label: "PromptStudio Fast",
    defaultProvider: "self-hosted",
  },
};

function parseProvider(
  value: string | undefined,
  fallback: TextProviderId,
): TextProviderId {
  if (value == null || value === "") return fallback;
  if (value === "self-hosted" || value === "external") return value;
  throw new Error(`Unsupported text provider: ${value}`);
}
