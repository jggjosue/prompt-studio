import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { generateSitePlan } from '@/lib/ai-site-plan';
import { AIPlanError } from '@/lib/editor/ai-site-planner';

export const runtime = 'nodejs';
export const maxDuration = 90;

const headers = () => cacheHeaders('private-no-store');

/**
 * POST /api/page-composer/ai/plan
 *
 * Petición en lenguaje natural → PageSchema validado. El modelo nunca devuelve
 * HTML: se le pide JSON puro y el resultado pasa por `validatePageSchema` y una
 * capa de reparación. Cobra créditos solo cuando el schema es válido.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const body = (await request.json().catch(() => null)) as { prompt?: string; provider?: string; model?: string } | null;
  const prompt = body?.prompt?.trim() ?? '';
  if (!prompt) {
    return NextResponse.json({ error: 'Escribe qué sitio quieres crear.' }, { status: 400, headers: headers() });
  }

  try {
    const result = await generateSitePlan({
      userId,
      request: prompt,
      provider: body?.provider,
      requestedModel: body?.model,
    });
    return NextResponse.json(
      {
        schema: result.schema,
        warnings: result.warnings,
        credits: result.credits,
        model: result.model,
        provider: result.provider,
      },
      { headers: headers() }
    );
  } catch (error) {
    if (error instanceof AIPlanError) {
      const status =
        error.code === 'INSUFFICIENT_CREDITS' ? 402 : error.code === 'EMPTY_PROMPT' || error.code === 'MODEL_NOT_ALLOWED' ? 400 : 422;
      return NextResponse.json({ error: error.message, code: error.code }, { status, headers: headers() });
    }
    return NextResponse.json({ error: 'Error interno al generar el sitio.', code: 'INTERNAL' }, { status: 500, headers: headers() });
  }
}