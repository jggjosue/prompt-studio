import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { recordObservabilityEvent } from '@/lib/observability-server';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import AIGenerationFeedback, { isFeedbackReason } from '@/models/AIGenerationFeedback';
import AIGenerationJob from '@/models/AIGenerationJob';
import ComponentPurchase from '@/models/ComponentPurchase';
import { outputUrl } from '@/lib/prompt-experiment';
import { recordProjectFunnelEvent } from '@/lib/project-funnel-events';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** Valorar es barato, pero es escritura autenticada: conviene acotarla. */
const FEEDBACK_LIMIT = { limit: 20, windowMs: 60_000 };

/**
 * POST /api/ai/jobs/[id]/feedback
 *
 * Registra el juicio humano sobre el resultado de una generación. Idempotente:
 * repetirlo actualiza la valoración en lugar de crear otra.
 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Inicia sesión para valorar.' },
      { status: 401, headers: headers() }
    );
  }

  const quota = await rateLimit({ key: `ai-feedback:${userId}`, ...FEEDBACK_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const { id } = await context.params;
  // Mismo criterio que el resto de rutas de trabajos: un ObjectId o nada.
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json(
      { error: 'Trabajo no encontrado.' },
      { status: 404, headers: headers() }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (typeof body?.useful !== 'boolean') {
    return NextResponse.json(
      { error: 'Indica si el resultado fue útil.' },
      { status: 400, headers: headers() }
    );
  }
  const useful = body.useful;

  // El motivo y el comentario solo aplican a una valoración negativa: guardarlos
  // en una positiva ensuciaría los agregados.
  const reason = !useful && isFeedbackReason(body.reason) ? body.reason : null;
  const comment =
    !useful && typeof body.comment === 'string' && body.comment.trim()
      ? body.comment.trim().slice(0, 1000)
      : null;
  const rating = typeof body.rating === 'number' && Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5 ? body.rating : null;
  const recommendation = typeof body.recommendation === 'string' && body.recommendation.trim() ? body.recommendation.trim().slice(0, 500) : null;
  const publishReview = body.publishReview === true;
  const publishResult = publishReview && body.publishResult === true;

  await connectToDatabase();

  // El filtro incluye userId: nadie puede valorar la generación de otro, ni
  // averiguar si existe. Un trabajo ajeno responde igual que uno inexistente.
  const job = await AIGenerationJob.findOne({ _id: id, userId });
  if (!job) {
    return NextResponse.json(
      { error: 'Trabajo no encontrado.' },
      { status: 404, headers: headers() }
    );
  }

  // Valorar un trabajo en cola o en proceso no significa nada: aún no hay
  // resultado que juzgar.
  if (job.status !== 'completed' && job.status !== 'failed') {
    return NextResponse.json(
      { error: 'Solo puedes valorar una generación terminada.' },
      { status: 409, headers: headers() }
    );
  }

  const now = new Date();
  const productId = typeof job.input?.productId === 'string' ? job.input.productId : typeof job.input?.promptId === 'string' ? job.input.promptId : null;
  const verifiedPurchase = productId ? Boolean(await ComponentPurchase.exists({ purchaserUserId: userId, productId, status: 'paid' })) : false;
  const generatedUrl = outputUrl(job.result);
  const resultObject = job.result && typeof job.result === 'object' ? job.result as Record<string, unknown> : {};
  const modelUsed = [resultObject.model, job.input?.model, job.provider].find(value => typeof value === 'string') as string | undefined;
  // Upsert contra el índice único {jobId, userId}: dos clics simultáneos no
  // pueden crear dos valoraciones.
  await AIGenerationFeedback.updateOne(
    { jobId: id, userId },
    {
      $set: { useful, reason, comment, rating, recommendation, publishReview, publishResult, resultUrl: publishResult ? generatedUrl : null, modelUsed: modelUsed?.slice(0, 120) ?? null, promptVersionNumber: job.promptVersionNumber ?? null, verifiedPurchase, kind: job.kind, provider: job.provider, updatedAt: now },
      $setOnInsert: { jobId: id, userId, createdAt: now },
    },
    { upsert: true }
  );

  job.feedbackUseful = useful;
  job.updatedAt = now;
  await job.save();
  if (useful && job.projectId) await recordProjectFunnelEvent({ userId, projectId: job.projectId, stage: 'result_approved', occurredAt: now, sourceId: id });

  void recordObservabilityEvent({
    category: 'ai_generation',
    name: 'generation_feedback',
    route: '/api/ai/jobs/[id]/feedback',
    userId,
    status: useful ? 'useful' : 'not-useful',
    metadata: {
      kind: job.kind,
      provider: job.provider,
      jobStatus: job.status,
      reason,
      // El comentario es texto libre del usuario y puede contener datos
      // personales: en observabilidad solo se guarda si lo hubo, no su
      // contenido.
      hasComment: Boolean(comment),
    },
  });

  return NextResponse.json({ useful, reason, rating, publishReview, publishResult, verifiedPurchase }, { headers: headers() });
}

/** DELETE — retira la valoración. El usuario puede cambiar de opinión. */
export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Inicia sesión para modificar tu valoración.' },
      { status: 401, headers: headers() }
    );
  }

  const quota = await rateLimit({ key: `ai-feedback:${userId}`, ...FEEDBACK_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json(
      { error: 'Trabajo no encontrado.' },
      { status: 404, headers: headers() }
    );
  }

  await connectToDatabase();
  await AIGenerationFeedback.deleteOne({ jobId: id, userId });
  await AIGenerationJob.updateOne(
    { _id: id, userId },
    { $set: { feedbackUseful: null, updatedAt: new Date() } }
  );

  return NextResponse.json({ useful: null }, { headers: headers() });
}
