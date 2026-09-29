import { randomUUID } from 'node:crypto';
import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { hasValidCronSecretHeader } from '@/lib/api-auth';
import { cacheHeaders } from '@/lib/cache-policy';
import { classifyGeminiSmokeFailure, validateGeminiSmokeImage } from '@/lib/gemini-image-smoke';
import { GOOGLE_IMAGE_MODEL } from '@/lib/google-image-config';
import { requestGoogleImage } from '@/lib/google-image-provider';
import { NextResponse } from 'next/server';

/**
 * Production-safe Gemini image smoke test.
 *
 * It deliberately bypasses credits, queue, MongoDB, R2 and chat state. Access
 * requires an administrator session or CRON_SECRET in the Authorization header.
 * Query-string secrets are intentionally rejected to keep credentials out of
 * URLs and access logs.
 */

export const maxDuration = 300;
const MAX_PROMPT_LENGTH = 2_000;

function responseHeaders(correlationId: string) {
  const headers = cacheHeaders('private-no-store');
  headers.set('X-Correlation-Id', correlationId);
  return headers;
}

export async function POST(request: Request) {
  const correlationId = randomUUID();
  const headers = responseHeaders(correlationId);
  const authorized = hasValidCronSecretHeader(request) || await isPremiumJoAdmin();
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized.', correlationId }, { status: 401, headers });
  }

  const raw = await request.json().catch(() => null) as { prompt?: string } | null;
  const prompt = typeof raw?.prompt === 'string' ? raw.prompt.trim() : '';
  if (!prompt || prompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({
      error: 'Prompt requerido; máximo 2000 caracteres.',
      correlationId,
    }, { status: 400, headers });
  }

  const startedAt = performance.now();
  try {
    const { result, model, httpStatus } = await requestGoogleImage({
      prompt,
      requestedModel: GOOGLE_IMAGE_MODEL,
    });
    const image = validateGeminiSmokeImage(result.imageUrl);
    const durationMs = Math.round(performance.now() - startedAt);
    // The log contains allow-listed metadata only; never include prompt or image bytes.
    // eslint-disable-next-line no-console
    console.info(JSON.stringify({
      event: 'gemini_image_smoke', status: 'passed', correlationId,
      provider: 'google', model, providerHttpStatus: httpStatus,
      durationMs, mimeType: image.mimeType, byteLength: image.byteLength,
    }));
    return NextResponse.json({
      ok: true,
      status: 'passed',
      correlationId,
      provider: 'google',
      model,
      providerHttpStatus: httpStatus,
      durationMs,
      image: { mimeType: image.mimeType, byteLength: image.byteLength },
      imageUrl: image.dataUrl,
    }, { headers });
  } catch (error: unknown) {
    const failure = classifyGeminiSmokeFailure(error);
    const durationMs = Math.round(performance.now() - startedAt);
    console.error(JSON.stringify({
      event: 'gemini_image_smoke', status: 'failed', correlationId,
      provider: 'google', model: GOOGLE_IMAGE_MODEL, durationMs, ...failure,
    }));
    return NextResponse.json({
      ok: false,
      status: 'failed',
      correlationId,
      provider: 'google',
      model: GOOGLE_IMAGE_MODEL,
      durationMs,
      failure,
    }, { status: failure.category === 'TIMEOUT' ? 504 : 502, headers });
  }
}
