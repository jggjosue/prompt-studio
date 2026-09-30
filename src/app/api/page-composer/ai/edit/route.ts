import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { generateAIEdit } from '@/lib/ai-edit';
import { AIPlanError } from '@/lib/editor/ai-site-planner';

export const runtime = 'nodejs';
export const maxDuration = 90;

const headers = () => cacheHeaders('private-no-store');

/**
 * POST /api/page-composer/ai/edit
 *
 * Edición contextual por IA: subconjunto del PageSchema + id + instrucción →
 * operaciones estructuradas (nunca código ejecutable). El cliente valida y aplica
 * las operaciones contra su documento real; aquí solo se generan y se cobran los
 * créditos estimados.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() });

  const body = (await request.json().catch(() => null)) as {
    instruction?: string;
    nodeId?: string;
    subset?: unknown;
    provider?: string;
    model?: string;
  } | null;

  const instruction = body?.instruction?.trim() ?? '';
  const nodeId = typeof body?.nodeId === 'string' ? body.nodeId : '';
  if (!instruction) {
    return NextResponse.json({ error: 'Escribe qué cambio quieres.' }, { status: 400, headers: headers() });
  }
  if (!nodeId) {
    return NextResponse.json({ error: 'Falta el componente seleccionado.' }, { status: 400, headers: headers() });
  }

  try {
    const result = await generateAIEdit({
      userId,
      instruction,
      subset: body?.subset ?? null,
      nodeId,
      provider: body?.provider,
      requestedModel: body?.model,
    });
    return NextResponse.json(
      { ops: result.ops, credits: result.credits, model: result.model, provider: result.provider },
      { headers: headers() }
    );
  } catch (error) {
    if (error instanceof AIPlanError) {
      const status =
        error.code === 'INSUFFICIENT_CREDITS' ? 402 : error.code === 'EMPTY_PROMPT' || error.code === 'MODEL_NOT_ALLOWED' ? 400 : 422;
      return NextResponse.json({ error: error.message, code: error.code }, { status, headers: headers() });
    }
    return NextResponse.json({ error: 'Error interno al editar.', code: 'INTERNAL' }, { status: 500, headers: headers() });
  }
}