import {
  type GeminiImageSuccess,
  parseGeminiImageResponse,
} from '@/lib/gemini-image-parser';
import {
  GOOGLE_IMAGE_API_VERSION,
  googleImageModelFor,
} from '@/lib/google-image-config';
import { safeProviderResponseError } from '@/lib/provider-error-safety';

type FetchLike = typeof fetch;

export class GoogleImageProviderError extends Error {
  status: number | null;
  code: string;
  finishReason: string | null;

  constructor(input: { message: string; status?: number | null; code: string; finishReason?: string | null }) {
    super(input.message);
    this.name = 'GoogleImageProviderError';
    this.status = input.status ?? null;
    this.code = input.code;
    this.finishReason = input.finishReason ?? null;
  }
}

export function googleImageApiKey(env: NodeJS.ProcessEnv = process.env): string {
  return env.GEMINI_API_KEY?.trim() || env.GOOGLE_API_KEY?.trim() || '';
}

export async function requestGoogleImage(input: {
  prompt: string;
  requestedModel?: string | null;
  apiKey?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}): Promise<{ result: GeminiImageSuccess; model: string; httpStatus: number }> {
  const apiKey = input.apiKey?.trim() || googleImageApiKey();
  if (!apiKey) {
    throw new GoogleImageProviderError({
      message: 'La credencial de Google no está configurada.',
      code: 'CREDENTIAL_MISSING',
    });
  }
  const prompt = input.prompt.trim();
  if (!prompt) {
    throw new GoogleImageProviderError({ message: 'El prompt está vacío.', status: 400, code: 'BAD_REQUEST' });
  }

  const model = googleImageModelFor(input.requestedModel);
  const endpoint = `https://generativelanguage.googleapis.com/${GOOGLE_IMAGE_API_VERSION}/models/${model}:generateContent`;
  const response = await (input.fetchImpl ?? fetch)(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
    }),
    signal: AbortSignal.timeout(input.timeoutMs ?? 270_000),
  });

  if (!response.ok) {
    const safeError = await safeProviderResponseError(response);
    throw new GoogleImageProviderError({
      message: `Google image provider returned HTTP ${response.status}.`,
      status: response.status,
      code: safeError.code,
    });
  }

  const payload = await response.json().catch(() => null);
  if (!payload) {
    throw new GoogleImageProviderError({
      message: 'Google image provider returned invalid JSON.',
      status: response.status,
      code: 'INVALID_PROVIDER_RESPONSE',
    });
  }
  const result = parseGeminiImageResponse(payload);
  if (result.kind === 'NO_IMAGE') {
    throw new GoogleImageProviderError({
      message: 'Google image provider returned no image.',
      status: response.status,
      code: 'NO_IMAGE',
      finishReason: result.finishReason,
    });
  }
  return { result, model, httpStatus: response.status };
}
