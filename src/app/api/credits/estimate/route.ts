import { estimateAICredits, type CreditEstimateInput } from '@/lib/ai-credit-config';
import { cacheHeaders } from '@/lib/cache-policy';
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });
  }

  try {
    const raw = await request.json().catch(() => null);
    if (!raw) {
      return NextResponse.json({ error: 'Payload inválido.' }, { status: 400, headers });
    }

    const { provider, model, kind, input, outputTokens, imageCount, videoDurationSeconds } = raw;

    if (!provider || !model || !kind) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos.' }, { status: 400, headers });
    }

    const estimateParams: CreditEstimateInput = {
      provider: String(provider).toLowerCase(),
      model: String(model).toLowerCase(),
      kind: kind as 'project' | 'image' | 'video',
      input: input ?? '',
      outputTokens: typeof outputTokens === 'number' ? outputTokens : undefined,
      imageCount: typeof imageCount === 'number' ? imageCount : undefined,
      videoDurationSeconds: typeof videoDurationSeconds === 'number' ? videoDurationSeconds : undefined,
    };

    const estimate = estimateAICredits(estimateParams);
    
    return NextResponse.json({ estimate }, { headers });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'MODEL_NOT_ALLOWED';
    return NextResponse.json({ error: { code, message: 'La configuración de generación no está disponible.' } }, { status: 400, headers });
  }
}
