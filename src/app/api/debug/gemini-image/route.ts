import { hasValidCronSecret } from '@/lib/api-auth';
import { cacheHeaders } from '@/lib/cache-policy';
import { ai } from '@/ai/genkit';
import { NextResponse } from 'next/server';

/**
 * @fileOverview Debug-only isolated Gemini image generation endpoint.
 *
 * Purpose: prove Gemini image generation independently from credits,
 * R2/storage, DB persistence, conversation state, and caching.
 *
 * Returns a browser-displayable data: URI (not an https:// signed URL)
 * so the image renders without depending on external storage.
 *
 * PROTECT/REMOVE before production exposure.
 * Access requires a valid `CRON_SECRET` (header `Authorization: Bearer <secret>`
 * or `?secret=<secret>`). See `src/lib/api-auth.ts`.
 */

export const maxDuration = 300;

async function toDataUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith('data:')) return imageUrl;
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`No se pudo obtener la imagen desde ${imageUrl}.`);
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get('content-type') || 'image/png';
  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  if (!hasValidCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401, headers });
  }

  const raw = await request.json().catch(() => null) as { prompt?: string } | null;
  if (!raw || typeof raw.prompt !== 'string' || !raw.prompt.trim()) {
    return NextResponse.json({ error: 'Prompt requerido.' }, { status: 400, headers });
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

    const dataUrl = await toDataUrl(imageUrl);
    return NextResponse.json({ imageUrl: dataUrl }, { headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido del proveedor.';
    return NextResponse.json({ error: message }, { status: 500, headers });
  }
}
