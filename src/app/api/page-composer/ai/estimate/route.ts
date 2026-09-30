import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { estimateSitePlan, resolvePlannerModel } from '@/lib/ai-site-plan';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/**
 * POST /api/page-composer/ai/estimate
 *
 * Devuelve el coste estimado en créditos antes de generar, para que el editor
 * lo muestre al usuario. No cobra ni reserva nada.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const body = (await request.json().catch(() => null)) as { prompt?: string; provider?: string; model?: string } | null;
  const prompt = body?.prompt?.trim() ?? '';
  if (!prompt) {
    return NextResponse.json({ error: 'Escribe una petición.' }, { status: 400, headers: headers() });
  }

  const provider = body?.provider ?? 'google';
  try {
    const estimate = estimateSitePlan(prompt, provider, body?.model);
    return NextResponse.json(
      {
        credits: estimate.credits,
        estimatedCostUsd: estimate.estimatedApiCostUsd,
        pricingStatus: estimate.pricingStatus,
        model: resolvePlannerModel(provider, body?.model),
      },
      { headers: headers() }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Estimación no disponible.';
    const status = message === 'MODEL_NOT_ALLOWED' ? 400 : message === 'INPUT_TOKEN_LIMIT' ? 413 : 500;
    return NextResponse.json({ error: message, code: message }, { status, headers: headers() });
  }
}