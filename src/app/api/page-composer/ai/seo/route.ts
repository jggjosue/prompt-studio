import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { generateSeo } from '@/lib/ai-edit';
import { AIPlanError } from '@/lib/editor/ai-site-planner';

export const runtime = 'nodejs';
export const maxDuration = 90;

const headers = () => cacheHeaders('private-no-store');

/**
 * POST /api/page-composer/ai/seo
 *
 * Genera un patch de SEO estructurado (title, description, og…) para la página.
 * El resultado es **editable** en el editor antes de guardarse. Cobra créditos.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const body = (await request.json().catch(() => null)) as {
    instruction?: string;
    pageContext?: unknown;
    hostname?: string;
    provider?: string;
    model?: string;
  } | null;

  const instruction = body?.instruction?.trim() ?? '';
  if (!instruction) {
    return NextResponse.json({ error: 'Escribe qué SEO quieres generar.' }, { status: 400, headers: headers() });
  }

  try {
    const result = await generateSeo({
      userId,
      instruction,
      pageContext: body?.pageContext ?? null,
      hostname: typeof body?.hostname === 'string' && body.hostname ? body.hostname : 'sitio.prompstudio.com',
      provider: body?.provider,
      requestedModel: body?.model,
    });
    return NextResponse.json(
      { seo: result.seo, credits: result.credits, model: result.model, provider: result.provider },
      { headers: headers() }
    );
  } catch (error) {
    if (error instanceof AIPlanError) {
      const status =
        error.code === 'INSUFFICIENT_CREDITS' ? 402 : error.code === 'EMPTY_PROMPT' || error.code === 'MODEL_NOT_ALLOWED' ? 400 : 422;
      return NextResponse.json({ error: error.message, code: error.code }, { status, headers: headers() });
    }
    return NextResponse.json({ error: 'Error interno al generar SEO.', code: 'INTERNAL' }, { status: 500, headers: headers() });
  }
}