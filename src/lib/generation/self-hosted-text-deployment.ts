export const SELF_HOSTED_TEXT_DEPLOYMENT = {
  provider: "modal",
  appName: "promptstudio-text-model",
  gpu: "L4",
  servedModelName: "promptstudio-fast",
  upstreamModelId: "Qwen/Qwen3-8B",
  upstreamRevision: "b968826d9c46dd6066d109eabc6255188de91218",
  runtime: {
    engine: "vllm",
    image: "vllm/vllm-openai:v0.11.0",
    port: 8000,
    maxModelLen: 32768,
    gpuMemoryUtilization: 0.9,
  },
  endpoints: {
    health: "/health",
    models: "/v1/models",
    chatCompletions: "/v1/chat/completions",
  },
  environmentVariables: {
    url: "PROMPTSTUDIO_TEXT_MODEL_URL",
    apiKey: "PROMPTSTUDIO_TEXT_MODEL_API_KEY",
  },
} as const;
