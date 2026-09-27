import { hasValidCronSecret } from '@/lib/api-auth';
import { ai } from '@/ai/genkit';
import { NextResponse } from 'next/server';

/**
 * @fileOverview Debug-only isolated Gemini image generation endpoint.
 *
 * Purpose: prove Gemini image generation independently from credits,
 * R2/storage, DB persistence, conversation state, and caching.
 *
 * PROTECT/REMOVE before production exposure.
 * Access requires a valid `CRON_SECRET` (header `Authorization: Bearer <secret>`
 * or `?secret=<secret>`). See `src/lib/api-auth.ts`.
 */

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const raw = await request.json().catch(() => null) as { prompt?: string } | null;
  if (!raw || typeof raw.prompt !== 'string' || !raw.prompt.trim()) {
    return NextResponse.json({ error: 'Prompt requerido.' }, { status: 400 });
  }

  const prompt = raw.prompt.trim();

  try {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt,
      config: { imageGenerationConfig: { numberOfImages: 1 } },
    });

    const imageUrl = media?.url;
    if (!imageUrl) {
      throw new Error('Gemini no devolvió una imagen.');
    }

    return NextResponse.json({ imageUrl });
  } catch (err: unknown) {
    // Return the original categorized provider error, not a generic fallback.
    const message = err instanceof Error ? err.message : 'Error desconocido del proveedor.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
