import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import AIGenerationJob from '@/models/AIGenerationJob';
import PromptExperiment from '@/models/PromptExperiment';
import { experimentMetrics, outputUrl } from '@/lib/prompt-experiment';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';

type StoredRun = { key: string; promptLabel: 'A'|'B'; provider: string; jobId: unknown };

const headers = () => cacheHeaders('private-no-store');
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(), { id } = await params;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: headers() });
  if (!/^[a-f0-9]{24}$/i.test(id)) return NextResponse.json({ error: 'Experimento no encontrado.' }, { status: 404, headers: headers() });
  await connectToDatabase();
  const experiment = await PromptExperiment.findOne({ _id: id, userId }).lean();
  if (!experiment) return NextResponse.json({ error: 'Experimento no encontrado.' }, { status: 404, headers: headers() });
  const runs = experiment.runs as StoredRun[];
  const jobs = await AIGenerationJob.find({ _id: { $in: runs.map(run => run.jobId) }, userId }).lean();
  const byId = new Map(jobs.map(job => [String(job._id), job]));
  return NextResponse.json({ experiment: { id, title: experiment.title, promptA: experiment.promptA, promptB: experiment.promptB, preferredRunKey: experiment.preferredRunKey, createdAt: experiment.createdAt, runs: runs.map(run => { const job = byId.get(String(run.jobId)); return { key: run.key, promptLabel: run.promptLabel, provider: run.provider, jobId: String(run.jobId), status: job?.status || 'queued', progress: job?.progress || 0, resultUrl: outputUrl(job?.result), metrics: job ? experimentMetrics(job) : null }; }) } }, { headers: headers() });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(), { id } = await params;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: headers() });
  const quota = await rateLimit({ key: `prompt-experiment-vote:${userId}`, limit: 30, windowMs: 60_000 });
  if (!quota.ok) return tooManyRequests(quota);
  const body = await request.json().catch(() => null) as { preferredRunKey?: unknown }|null;
  const key = typeof body?.preferredRunKey === 'string' ? body.preferredRunKey : '';
  await connectToDatabase();
  const experiment = await PromptExperiment.findOne({ _id: id, userId });
  if (!experiment || !experiment.runs.some((run: { key: string }) => run.key === key)) return NextResponse.json({ error: 'Opción inválida.' }, { status: 400, headers: headers() });
  experiment.preferredRunKey = key; experiment.updatedAt = new Date(); await experiment.save();
  return NextResponse.json({ preferredRunKey: key }, { headers: headers() });
}
