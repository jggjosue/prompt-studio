import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { AI_JOB_COSTS } from '@/lib/ai-job-config';
import { AIGenerationJob, getCreditBalance, refundCredits, reserveCredits } from '@/lib/ai-job-service';
import { EXPERIMENT_PROVIDERS, experimentRunKey } from '@/lib/prompt-experiment';
import { rateLimit, RATE_LIMITS, tooManyRequests } from '@/lib/rate-limit';
import PromptExperiment from '@/models/PromptExperiment';

const headers = () => cacheHeaders('private-no-store');
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ experiments: [] }, { status: 401, headers: headers() });
  await connectToDatabase();
  const experiments = await PromptExperiment.find({ userId }).sort({ createdAt: -1 }).limit(30).select('title preferredRunKey createdAt runs').lean();
  return NextResponse.json({ experiments }, { headers: headers() });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para crear experimentos.' }, { status: 401, headers: headers() });
  const quota = await rateLimit({ key: `prompt-experiments:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  const body = await request.json().catch(() => null) as Record<string, unknown>|null;
  const title = clean(body?.title, 160) || 'Experimento A/B', promptA = clean(body?.promptA, 20_000), promptB = clean(body?.promptB, 20_000);
  if (promptA.length < 10 || promptB.length < 10 || promptA === promptB) return NextResponse.json({ error: 'Los prompts deben ser diferentes y tener al menos 10 caracteres.' }, { status: 400, headers: headers() });
  const user = await (await clerkClient()).users.getUser(userId), userEmail = user.primaryEmailAddress?.emailAddress;
  if (!userEmail) return NextResponse.json({ error: 'Tu cuenta necesita un correo principal.' }, { status: 400, headers: headers() });
  await connectToDatabase();
  const cost = AI_JOB_COSTS.image;
  const created: any[] = [];
  const reserved: any[] = [];
  try {
    for (const label of ['A', 'B'] as const) for (const provider of EXPERIMENT_PROVIDERS) {
      const job = await AIGenerationJob.create({ userId, userEmail, kind: 'image', provider, input: { prompt: label === 'A' ? promptA : promptB, experiment: true, promptLabel: label }, idempotencyKey: `ab-${crypto.randomUUID()}`, creditCost: cost.credits, estimatedCostUsd: cost.estimatedUsd, notifyOnComplete: false });
      created.push(job);
      if (await reserveCredits(job) === null) throw new Error('INSUFFICIENT_CREDITS');
      reserved.push(job);
    }
    const runs = created.map((job, index) => { const promptLabel = index < 2 ? 'A' : 'B'; const provider = EXPERIMENT_PROVIDERS[index % 2]; return { key: experimentRunKey(promptLabel, provider), promptLabel, provider, jobId: job._id }; });
    const experiment = await PromptExperiment.create({ userId, title, promptA, promptB, providers: EXPERIMENT_PROVIDERS, runs });
    return NextResponse.json({ id: String(experiment._id), credits: await getCreditBalance(userId) }, { status: 201, headers: headers() });
  } catch (error) {
    for (const job of reserved) await refundCredits(job);
    for (const job of created) await AIGenerationJob.deleteOne({ _id: job._id });
    if (error instanceof Error && error.message === 'INSUFFICIENT_CREDITS') return NextResponse.json({ error: 'Se requieren 4 créditos disponibles para las cuatro ejecuciones.' }, { status: 402, headers: headers() });
    throw error;
  }
}
