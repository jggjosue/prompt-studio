export type LogicalTextModel = "promptstudio-fast";

export type TextRole = "system" | "user" | "assistant";

export type TextMessage = {
  role: TextRole;
  content: string;
};

export type TextGenerationInput = {
  model: LogicalTextModel;
  messages: TextMessage[];
  maxTokens: number;
  temperature?: number;
  stream?: boolean;
  signal?: AbortSignal;
};

export type TextGenerationResult = {
  provider: TextProviderId;
  model: LogicalTextModel;
  upstreamModel: string;
  response: Response;
};

export type TextProviderId = "self-hosted" | "external";

export type TextProvider = {
  id: TextProviderId;
  generate(input: TextGenerationInput): Promise<TextGenerationResult>;
};

export type TextProviderErrorCode =
  | "provider_disabled"
  | "provider_not_configured"
  | "provider_timeout"
  | "provider_rate_limited"
  | "provider_authentication"
  | "provider_bad_request"
  | "provider_unavailable"
  | "provider_error";

export class TextProviderError extends Error {
  constructor(
    public readonly code: TextProviderErrorCode,
    message: string,
    public readonly provider: TextProviderId,
    public readonly retryable: boolean,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "TextProviderError";
  }
}
