export type GenerateTextApiRequest = {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
};

export type GenerateTextApiError = {
  error: {
    code:
      | "UNAUTHORIZED"
      | "INVALID_JSON"
      | "INVALID_REQUEST"
      | "RATE_LIMITED"
      | "CAPACITY_LIMITED"
      | "GENERATION_TIMEOUT"
      | "GENERATION_UNAVAILABLE"
      | "CLIENT_DISCONNECTED"
      | "INTERNAL_ERROR";
    message: string;
  };
  generationId: string;
};

export const GENERATE_TEXT_API = {
  path: "/api/ai/generate-text",
  model: "promptstudio-fast",
  generationIdHeader: "X-Generation-Id",
  streamingContentType: "text/event-stream",
} as const;
