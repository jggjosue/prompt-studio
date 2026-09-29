import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isPremiumJoAdmin } from '@/lib/admin-auth';
import { getCreditBalance, reserveCredits } from '@/lib/ai-job-service';
import { serializeAIJob } from '@/lib/ai-job-serializer';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import AIGenerationJob from '@/models/AIGenerationJob';
import { RATE_LIMITS, rateLimit, tooManyRequests } from '@/lib/rate-limit';

const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  if (!(await isPremiumJoAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers });
  const quota = await rateLimit({ key: `admin-dead-letter-reprocess:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Trabajo no encontrado.' }, { status: 404, headers });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const reason = clean(body?.reason, 500);
  if (body?.rootCauseFixed !== true || reason.length < 8) {
    return NextResponse.json({ error: 'Confirma la corrección de la causa raíz y documenta el motivo.' }, { status: 400, headers });
  }

  await connectToDatabase();
  const original = await AIGenerationJob.findOne({ _id: id, status: 'dead_letter' });
  if (!original) return NextResponse.json({ error: 'Solo se reprocesan trabajos en dead-letter.' }, { status: 409, headers });
  const idempotencyKey = `operator-reprocess:${id}`;
  const existing = await AIGenerationJob.findOne({ userId: original.userId, idempotencyKey });
  if (existing) return NextResponse.json({ job: serializeAIJob(existing), duplicate: true }, { status: 200, headers });

  let job;
  try {
    job = await AIGenerationJob.create({
      userId: original.userId,
      userEmail: original.userEmail,
      kind: original.kind,
      provider: original.provider,
      modelId: original.modelId ?? null,
      operation: original.operation ?? null,
      promptVersionId: original.promptVersionId ?? null,
      promptVersionNumber: original.promptVersionNumber ?? null,
      projectId: original.projectId ?? null,
      outputContractId: original.outputContractId ?? null,
      input: { ...original.input, reprocessOfJobId: id },
      idempotencyKey,
      creditCost: original.creditCost,
      estimatedCostUsd: original.estimatedCostUsd,
      estimatedInputTokens: original.estimatedInputTokens ?? null,
      estimatedOutputTokens: original.estimatedOutputTokens ?? null,
      maxAttempts: original.maxAttempts,
      notifyOnComplete: original.notifyOnComplete,
      progressMessage: 'Reproceso de dead-letter en cola',
    });
  } catch (error) {
    if ((error as { code?: number })?.code !== 11000) throw error;
    job = await AIGenerationJob.findOne({ userId: original.userId, idempotencyKey });
    if (!job) throw error;
    return NextResponse.json({ job: serializeAIJob(job), duplicate: true }, { status: 200, headers });
  }

  const balance = await reserveCredits(job);
  if (balance === null) {
    await AIGenerationJob.deleteOne({ _id: job._id, status: 'queued' });
    return NextResponse.json({ error: 'Créditos insuficientes.', credits: await getCreditBalance(original.userId) }, { status: 402, headers });
  }
  await AIGenerationJob.updateOne(
    { _id: original._id, status: 'dead_letter', reprocessedJobId: null },
    { $set: { reprocessedAt: new Date(), reprocessedJobId: String(job._id), reprocessReason: reason, updatedAt: new Date() } },
  );
  return NextResponse.json({ job: serializeAIJob(job), duplicate: false }, { status: 202, headers });
}
