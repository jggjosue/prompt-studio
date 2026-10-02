import {
  TEXT_INFERENCE_SECURITY,
  type TextGenerationRequest,
  validateTextGenerationRequest,
} from "./text-inference-security";

const SERVED_MODEL = "promptstudio-fast";

export async function callSelfHostedTextModel(
  request: TextGenerationRequest,
): Promise<Response> {
  const validated = validateTextGenerationRequest(request);
  const baseUrl = requiredServerSecret("PROMPTSTUDIO_TEXT_MODEL_URL").replace(
    /\/$/,
    "",
  );
  const apiKey = requiredServerSecret("PROMPTSTUDIO_TEXT_MODEL_API_KEY");

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error("Text inference timed out")),
    TEXT_INFERENCE_SECURITY.requestTimeoutMs,
  );

  try {
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: SERVED_MODEL,
        messages: validated.messages,
        max_tokens: validated.maxTokens,
        temperature: validated.temperature ?? 0.7,
        stream: validated.stream ?? true,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function requiredServerSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required server-only environment variable: ${name}`);
  }
  return value;
}
