import {
  TextProviderError,
  type TextGenerationInput,
  type TextGenerationResult,
  type TextProvider,
} from "./text-provider";

export class ExternalOpenAITextProvider implements TextProvider {
  readonly id = "external" as const;

  constructor(private readonly upstreamModel: string) {}

  async generate(input: TextGenerationInput): Promise<TextGenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new TextProviderError(
        "provider_not_configured",
        "External text provider is not configured.",
        this.id,
        false,
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.upstreamModel,
        messages: input.messages,
        max_tokens: input.maxTokens,
        temperature: input.temperature ?? 0.7,
        stream: input.stream ?? true,
      }),
      signal: input.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      throw new TextProviderError(
        response.status === 429
          ? "provider_rate_limited"
          : response.status >= 500
            ? "provider_unavailable"
            : response.status === 401 || response.status === 403
              ? "provider_authentication"
              : "provider_bad_request",
        "External text provider request failed.",
        this.id,
        response.status === 429 || response.status >= 500,
        response.status,
      );
    }

    return {
      provider: this.id,
      model: input.model,
      upstreamModel: this.upstreamModel,
      response,
    };
  }
}
