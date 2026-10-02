import { createHash, timingSafeEqual } from "node:crypto";

export const TEXT_INFERENCE_SECURITY = {
  maxRequestBytes: 64 * 1024,
  maxMessages: 32,
  maxMessageCharacters: 24_000,
  maxTotalCharacters: 48_000,
  maxOutputTokens: 2_048,
  requestTimeoutMs: 45_000,
  maxConcurrentRequestsPerInstance: 8,
  rateLimit: {
    windowMs: 60_000,
    requestsPerWindow: 20,
  },
} as const;

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type TextGenerationRequest = {
  messages: ChatMessage[];
  maxTokens: number;
  temperature?: number;
  stream?: boolean;
};

export class TextInferenceSecurityError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "request_too_large"
      | "too_many_messages"
      | "message_too_large"
      | "prompt_too_large"
      | "invalid_output_tokens"
      | "invalid_temperature"
      | "rate_limited"
      | "concurrency_limited",
    public readonly status: number,
  ) {
    super(message);
    this.name = "TextInferenceSecurityError";
  }
}

export function assertRequestSize(contentLength: string | null): void {
  if (contentLength == null) return;
  const bytes = Number(contentLength);
  if (
    Number.isFinite(bytes) &&
    bytes > TEXT_INFERENCE_SECURITY.maxRequestBytes
  ) {
    throw new TextInferenceSecurityError(
      "Request body exceeds the text inference limit.",
      "request_too_large",
      413,
    );
  }
}

export function validateTextGenerationRequest(
  input: TextGenerationRequest,
): TextGenerationRequest {
  if (
    !Array.isArray(input.messages) ||
    input.messages.length === 0 ||
    input.messages.length > TEXT_INFERENCE_SECURITY.maxMessages
  ) {
    throw new TextInferenceSecurityError(
      "Invalid number of messages.",
      "too_many_messages",
      400,
    );
  }

  let totalCharacters = 0;

  for (const message of input.messages) {
    if (
      !["system", "user", "assistant"].includes(message.role) ||
      typeof message.content !== "string"
    ) {
      throw new TextInferenceSecurityError(
        "Invalid message.",
        "message_too_large",
        400,
      );
    }

    if (
      message.content.length > TEXT_INFERENCE_SECURITY.maxMessageCharacters
    ) {
      throw new TextInferenceSecurityError(
        "A message exceeds the character limit.",
        "message_too_large",
        413,
      );
    }

    totalCharacters += message.content.length;
  }

  if (totalCharacters > TEXT_INFERENCE_SECURITY.maxTotalCharacters) {
    throw new TextInferenceSecurityError(
      "Prompt exceeds the total character limit.",
      "prompt_too_large",
      413,
    );
  }

  if (
    !Number.isInteger(input.maxTokens) ||
    input.maxTokens < 1 ||
    input.maxTokens > TEXT_INFERENCE_SECURITY.maxOutputTokens
  ) {
    throw new TextInferenceSecurityError(
      "maxTokens is outside the allowed range.",
      "invalid_output_tokens",
      400,
    );
  }

  if (
    input.temperature != null &&
    (!Number.isFinite(input.temperature) ||
      input.temperature < 0 ||
      input.temperature > 2)
  ) {
    throw new TextInferenceSecurityError(
      "temperature is outside the allowed range.",
      "invalid_temperature",
      400,
    );
  }

  return input;
}

export function fingerprintIdentifier(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

export function safeEqualSecret(
  provided: string | undefined,
  expected: string,
): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sanitizedInferenceLog(input: {
  requestId: string;
  actorId?: string;
  model: string;
  messageCount: number;
  promptCharacters: number;
  maxTokens: number;
  durationMs?: number;
  status: "accepted" | "completed" | "rejected" | "failed";
  errorCode?: string;
}) {
  return {
    event: "text_inference",
    requestId: input.requestId,
    actorFingerprint: input.actorId
      ? fingerprintIdentifier(input.actorId)
      : undefined,
    model: input.model,
    messageCount: input.messageCount,
    promptCharacters: input.promptCharacters,
    maxTokens: input.maxTokens,
    durationMs: input.durationMs,
    status: input.status,
    errorCode: input.errorCode,
  };
}

export class InMemoryInferenceGuard {
  private readonly buckets = new Map<
    string,
    { windowStartedAt: number; requests: number }
  >();
  private concurrent = 0;

  checkRateLimit(actorKey: string, now = Date.now()): void {
    const config = TEXT_INFERENCE_SECURITY.rateLimit;
    const current = this.buckets.get(actorKey);

    if (!current || now - current.windowStartedAt >= config.windowMs) {
      this.buckets.set(actorKey, { windowStartedAt: now, requests: 1 });
      return;
    }

    if (current.requests >= config.requestsPerWindow) {
      throw new TextInferenceSecurityError(
        "Text generation rate limit exceeded.",
        "rate_limited",
        429,
      );
    }

    current.requests += 1;
  }

  async withConcurrency<T>(operation: () => Promise<T>): Promise<T> {
    if (
      this.concurrent >=
      TEXT_INFERENCE_SECURITY.maxConcurrentRequestsPerInstance
    ) {
      throw new TextInferenceSecurityError(
        "Text generation capacity is temporarily full.",
        "concurrency_limited",
        503,
      );
    }

    this.concurrent += 1;
    try {
      return await operation();
    } finally {
      this.concurrent -= 1;
    }
  }
}
