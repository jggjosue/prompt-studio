import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { serializeAIJob } from '@/lib/ai-job-serializer';
import { getCreditBalance } from '@/lib/ai-job-service';
import { reserveGenerationCredits } from '@/lib/generation-credit-boundary';
import AIGenerationJob from '@/models/AIGenerationJob';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Trabajo no encontrado.' }, { status: 404, headers });
  await connectToDatabase();
  const original = await AIGenerationJob.findOne({ _id: id, userId, status: 'failed' });
  if (!original) return NextResponse.json({ error: 'Solo puedes reintentar trabajos fallidos.' }, { status: 409, headers });

  // `failed` is terminal. A manual retry creates a new durable job so credit
  // ledger entries and provider idempotency keys cannot collide with the old run.
  const idempotencyKey = `retry:${id}`;
  const duplicate = await AIGenerationJob.findOne({ userId, idempotencyKey });
  if (duplicate) {
    return NextResponse.json({ job: serializeAIJob(duplicate), credits: await getCreditBalance(userId), duplicate: true }, { status: 200, headers });
  }

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
      input: { ...original.input, retryOfJobId: id },
      idempotencyKey,
      creditCost: original.creditCost,
      estimatedCostUsd: original.estimatedCostUsd,
      estimatedInputTokens: original.estimatedInputTokens ?? null,
      estimatedOutputTokens: original.estimatedOutputTokens ?? null,
      maxAttempts: original.maxAttempts,
      notifyOnComplete: original.notifyOnComplete,
      progressMessage: 'Reintento en cola',
    });
  } catch (error) {
    if ((error as { code?: number })?.code !== 11000) throw error;
    job = await AIGenerationJob.findOne({ userId, idempotencyKey });
    if (!job) throw error;
    return NextResponse.json({ job: serializeAIJob(job), credits: await getCreditBalance(userId), duplicate: true }, { status: 200, headers });
  }

  const creditGuard = await reserveGenerationCredits(job);
  if (!creditGuard.allowed) {
    await AIGenerationJob.deleteOne({ _id: job._id, status: 'queued' });
    return NextResponse.json({ error: 'Créditos insuficientes.', credits: await getCreditBalance(userId) }, { status: 402, headers });
  }
  return NextResponse.json({ job: serializeAIJob(job), credits: await getCreditBalance(userId) }, { status: 202, headers });
}
