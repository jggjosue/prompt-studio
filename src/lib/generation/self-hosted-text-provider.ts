import {
  TEXT_INFERENCE_SECURITY,
  validateTextGenerationRequest,
} from "./text-inference-security";
import {
  TextProviderError,
  type TextGenerationInput,
  type TextGenerationResult,
  type TextProvider,
} from "./text-provider";

const UPSTREAM_MODEL = "promptstudio-fast";

export class SelfHostedTextProvider implements TextProvider {
  readonly id = "self-hosted" as const;

  async generate(input: TextGenerationInput): Promise<TextGenerationResult> {
    const url = process.env.PROMPTSTUDIO_TEXT_MODEL_URL?.replace(/\/$/, "");
    const apiKey = process.env.PROMPTSTUDIO_TEXT_MODEL_API_KEY;

    if (!url || !apiKey) {
      throw new TextProviderError(
        "provider_not_configured",
        "Self-hosted text provider is not configured.",
        this.id,
        false,
      );
    }

    validateTextGenerationRequest({
      messages: input.messages,
      maxTokens: input.maxTokens,
      temperature: input.temperature,
      stream: input.stream,
    });

    const timeoutController = new AbortController();
    const timeout = setTimeout(
      () => timeoutController.abort(),
      TEXT_INFERENCE_SECURITY.requestTimeoutMs,
    );
    const signal = combineSignals(input.signal, timeoutController.signal);

    try {
      const response = await fetch(`${url}/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: UPSTREAM_MODEL,
          messages: input.messages,
          max_tokens: input.maxTokens,
          temperature: input.temperature ?? 0.7,
          stream: input.stream ?? true,
        }),
        signal,
        cache: "no-store",
      });

      if (!response.ok) {
        throw normalizeHttpError(this.id, response.status);
      }

      return {
        provider: this.id,
        model: input.model,
        upstreamModel: UPSTREAM_MODEL,
        response,
      };
    } catch (error) {
      if (error instanceof TextProviderError) throw error;
      if (signal.aborted) {
        throw new TextProviderError(
          "provider_timeout",
          "Self-hosted text provider timed out.",
          this.id,
          true,
        );
      }
      throw new TextProviderError(
        "provider_unavailable",
        "Self-hosted text provider is unavailable.",
        this.id,
        true,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}

function normalizeHttpError(
  provider: "self-hosted",
  status: number,
): TextProviderError {
  if (status === 401 || status === 403) {
    return new TextProviderError(
      "provider_authentication",
      "Text provider authentication failed.",
      provider,
      false,
      status,
    );
  }
  if (status === 429) {
    return new TextProviderError(
      "provider_rate_limited",
      "Text provider rate limit reached.",
      provider,
      true,
      status,
    );
  }
  if (status >= 500) {
    return new TextProviderError(
      "provider_unavailable",
      "Text provider is unavailable.",
      provider,
      true,
      status,
    );
  }
  return new TextProviderError(
    "provider_bad_request",
    "Text provider rejected the request.",
    provider,
    false,
    status,
  );
}

function combineSignals(
  first: AbortSignal | undefined,
  second: AbortSignal,
): AbortSignal {
  if (!first) return second;
  return AbortSignal.any([first, second]);
}
