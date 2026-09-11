import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { serializeAIJob } from '@/lib/ai-job-serializer';
import { getCreditBalance, reserveCredits } from '@/lib/ai-job-service';
import AIGenerationJob from '@/models/AIGenerationJob';

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const headers = cacheHeaders('private-no-store');
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Trabajo no encontrado.' }, { status: 404, headers });
  await connectToDatabase();
  const job = await AIGenerationJob.findOne({ _id: id, userId, status: 'failed' });
  if (!job) return NextResponse.json({ error: 'Solo puedes reintentar trabajos fallidos.' }, { status: 409, headers });
  if (job.creditsState === 'refunded') {
    job.creditsState = 'reserved';
    const balance = await reserveCredits(job);
    if (balance === null) {
      job.creditsState = 'refunded';
      return NextResponse.json({ error: 'Créditos insuficientes.', credits: await getCreditBalance(userId) }, { status: 402, headers });
    }
  }
  job.status = 'queued';
  job.progress = 0;
  job.progressMessage = 'Reintento en cola';
  job.attempts = 0;
  job.lastError = null;
  job.nextAttemptAt = new Date();
  job.completedAt = null;
  job.updatedAt = new Date();
  await job.save();
  return NextResponse.json({ job: serializeAIJob(job), credits: await getCreditBalance(userId) }, { status: 202, headers });
}
