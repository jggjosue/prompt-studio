import { randomUUID } from "node:crypto";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { cacheHeaders } from "@/lib/cache-policy";
import { rateLimit, rateLimitHeaders, retryAfterSeconds } from "@/lib/rate-limit-core";
import {
  assertRequestSize,
  InMemoryInferenceGuard,
  TextInferenceSecurityError,
  TEXT_INFERENCE_SECURITY,
  sanitizedInferenceLog,
  validateTextGenerationRequest,
} from "@/lib/generation/text-inference-security";
import { generatePromptStudioText } from "@/lib/generation/text-model-router";
import { TextProviderError } from "@/lib/generation/text-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const localGuard = new InMemoryInferenceGuard();
const MODEL = "promptstudio-fast" as const;

type GenerateTextBody = {
  messages?: Array<{
    role?: "system" | "user" | "assistant";
    content?: string;
  }>;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
};

export async function POST(request: Request): Promise<Response> {
  const requestId = randomUUID();
  const baseHeaders = cacheHeaders("private-no-store", {
    "X-Generation-Id": requestId,
    "X-Content-Type-Options": "nosniff",
  });

  const { userId } = await auth();
  if (!userId) {
    return errorResponse(
      "UNAUTHORIZED",
      "Authentication is required.",
      401,
      requestId,
      baseHeaders,
    );
  }

  const quota = await rateLimit({
    key: `generate-text:${userId}`,
    limit: TEXT_INFERENCE_SECURITY.rateLimit.requestsPerWindow,
    windowMs: TEXT_INFERENCE_SECURITY.rateLimit.windowMs,
  });

  if (!quota.ok) {
    const headers = new Headers(baseHeaders);
    for (const [key, value] of Object.entries(rateLimitHeaders(quota))) {
      headers.set(key, value);
    }
    headers.set("Retry-After", String(retryAfterSeconds(quota)));
    return errorResponse(
      "RATE_LIMITED",
      "Too many text generation requests.",
      429,
      requestId,
      headers,
    );
  }

  try {
    assertRequestSize(request.headers.get("content-length"));
  } catch (error) {
    return securityErrorResponse(error, requestId, baseHeaders);
  }

  let raw: GenerateTextBody;
  try {
    raw = (await request.json()) as GenerateTextBody;
  } catch {
    return errorResponse(
      "INVALID_JSON",
      "Request body must be valid JSON.",
      400,
      requestId,
      baseHeaders,
    );
  }

  const messages = Array.isArray(raw.messages)
    ? raw.messages.map((message) => ({
        role: message.role ?? "user",
        content: typeof message.content === "string" ? message.content : "",
      }))
    : [];

  const input = {
    model: MODEL,
    messages,
    maxTokens:
      typeof raw.maxTokens === "number" ? raw.maxTokens : 1_024,
    temperature:
      typeof raw.temperature === "number" ? raw.temperature : 0.7,
    stream: raw.stream !== false,
    signal: request.signal,
  };

  try {
    validateTextGenerationRequest(input);
    localGuard.checkRateLimit(userId);

    const result = await localGuard.withConcurrency(() =>
      generatePromptStudioText(input),
    );

    const headers = new Headers(baseHeaders);
    headers.set(
      "Content-Type",
      result.response.headers.get("content-type") ??
        (input.stream
          ? "text/event-stream; charset=utf-8"
          : "application/json; charset=utf-8"),
    );
    headers.set("X-Accel-Buffering", "no");

    const rateHeaders = rateLimitHeaders(quota);
    for (const [key, value] of Object.entries(rateHeaders)) {
      headers.set(key, value);
    }

    console.info(
      sanitizedInferenceLog({
        requestId,
        actorId: userId,
        model: MODEL,
        messageCount: input.messages.length,
        promptCharacters: input.messages.reduce(
          (sum, message) => sum + message.content.length,
          0,
        ),
        maxTokens: input.maxTokens,
        status: "accepted",
      }),
    );

    return new Response(result.response.body, {
      status: result.response.status,
      headers,
    });
  } catch (error) {
    if (error instanceof TextInferenceSecurityError) {
      return securityErrorResponse(error, requestId, baseHeaders);
    }

    if (error instanceof TextProviderError) {
      const publicError = publicProviderError(error);
      return errorResponse(
        publicError.code,
        publicError.message,
        publicError.status,
        requestId,
        baseHeaders,
      );
    }

    if (request.signal.aborted) {
      return errorResponse(
        "CLIENT_DISCONNECTED",
        "The generation request was cancelled.",
        499,
        requestId,
        baseHeaders,
      );
    }

    console.error({
      event: "text_inference",
      requestId,
      status: "failed",
      errorCode: "INTERNAL_ERROR",
    });

    return errorResponse(
      "INTERNAL_ERROR",
      "Text generation failed.",
      500,
      requestId,
      baseHeaders,
    );
  }
}

function securityErrorResponse(
  error: unknown,
  requestId: string,
  headers: Headers,
): NextResponse {
  if (!(error instanceof TextInferenceSecurityError)) {
    return errorResponse(
      "INVALID_REQUEST",
      "Invalid generation request.",
      400,
      requestId,
      headers,
    );
  }

  const code =
    error.code === "rate_limited"
      ? "RATE_LIMITED"
      : error.code === "concurrency_limited"
        ? "CAPACITY_LIMITED"
        : "INVALID_REQUEST";

  return errorResponse(code, error.message, error.status, requestId, headers);
}

function publicProviderError(error: TextProviderError): {
  code: string;
  message: string;
  status: number;
} {
  switch (error.code) {
    case "provider_timeout":
      return {
        code: "GENERATION_TIMEOUT",
        message: "Text generation timed out.",
        status: 504,
      };
    case "provider_rate_limited":
    case "provider_unavailable":
      return {
        code: "GENERATION_UNAVAILABLE",
        message: "Text generation is temporarily unavailable.",
        status: 503,
      };
    case "provider_bad_request":
      return {
        code: "INVALID_REQUEST",
        message: "The generation request was rejected.",
        status: 400,
      };
    default:
      return {
        code: "GENERATION_UNAVAILABLE",
        message: "Text generation is unavailable.",
        status: 503,
      };
  }
}

function errorResponse(
  code: string,
  message: string,
  status: number,
  requestId: string,
  headers: Headers,
): NextResponse {
  return NextResponse.json(
    {
      error: { code, message },
      generationId: requestId,
    },
    { status, headers },
  );
}
