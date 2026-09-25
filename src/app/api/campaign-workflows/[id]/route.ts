import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { campaignControlCenter } from '@/lib/campaign-control-center';
import { projectBudgetSnapshot } from '@/lib/project-budget';
import { getCreditBalance, reserveCredits } from '@/lib/ai-job-service';
import { serializeAIJob } from '@/lib/ai-job-serializer';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import AIGenerationJob from '@/models/AIGenerationJob';
import CampaignWorkflow from '@/models/CampaignWorkflow';
import CreativeProject from '@/models/CreativeProject';

const headers = { 'Cache-Control': 'private, no-store' };
type Task = { stage: string; label: string; jobId: unknown };

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(), { id } = await params;
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Campaña no encontrada.' }, { status: 404, headers });
  await connectToDatabase();
  const campaign = await CampaignWorkflow.findOne({ _id: id, userId }).lean();
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada.' }, { status: 404, headers });
  const tasks = campaign.tasks as Task[];
  const [jobs, project] = await Promise.all([
    AIGenerationJob.find({ _id: { $in: tasks.map(task => task.jobId) }, userId }),
    CreativeProject.findOne({ _id: campaign.projectId, userId }).select('brand prompts exports decisions reviewStatus budget').lean(),
  ]);
  const byId = new Map(jobs.map(job => [String(job._id), serializeAIJob(job)]));
  const serializedJobs = tasks.map(task => byId.get(String(task.jobId))).filter(Boolean);
  const brand = project?.brand;
  const control = campaignControlCenter({
    brief: campaign.brief,
    brandConfigured: Boolean(brand?.name || brand?.voice || brand?.colors?.length || brand?.headingFont || brand?.bodyFont),
    promptCount: project?.prompts?.length ?? tasks.length,
    jobs: serializedJobs.map(job => ({ status: job!.status, progress: job!.progress, creditCost: job!.creditCost, estimatedCostUsd: job!.estimatedCostUsd, actualCostUsd: job!.actualCostUsd, feedbackUseful: job!.feedbackUseful })),
    reviewStatus: project?.reviewStatus ?? 'draft',
    publicationCount: (project?.exports?.length ?? 0) + (project?.decisions?.some((decision: { status?: string }) => decision.status === 'published') ? 1 : 0),
  });
  const budgetSettings = { limitCredits: project?.budget?.limitCredits ?? null, limitUsd: project?.budget?.limitUsd ?? null, warningPercent: project?.budget?.warningPercent ?? 80, approvalCredits: project?.budget?.approvalCredits ?? null, approvalUsd: project?.budget?.approvalUsd ?? null };
  const budget = { ...budgetSettings, ...projectBudgetSnapshot(budgetSettings, serializedJobs.map(job => ({ kind: job!.kind, provider: job!.provider, status: job!.status, creditsState: job!.creditsState, creditCost: job!.creditCost, estimatedCostUsd: job!.estimatedCostUsd, actualCostUsd: job!.actualCostUsd }))) };
  return NextResponse.json({ campaign: { id, name: campaign.name, brief: campaign.brief, audience: campaign.audience, language: campaign.language, projectId: campaign.projectId, tasks: tasks.map(task => ({ stage: task.stage, label: task.label, jobId: String(task.jobId), job: byId.get(String(task.jobId)) || null })), control, budget, createdAt: campaign.createdAt } }, { headers });
}

export async function PATCH(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(), { id } = await params;
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });
  const quota = await rateLimit({ key: `campaign-retry:${userId}`, limit: 5, windowMs: 60_000 });
  if (!quota.ok) return tooManyRequests(quota);
  await connectToDatabase();
  const campaign = await CampaignWorkflow.findOne({ _id: id, userId }).lean();
  if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada.' }, { status: 404, headers });
  let retried = 0, insufficient = false;
  for (const task of campaign.tasks as Task[]) {
    const job = await AIGenerationJob.findOneAndUpdate({ _id: task.jobId, userId, status: 'failed' }, { $set: { status: 'retrying', progress: 0, progressMessage: 'Preparando reintento de campaña', updatedAt: new Date() } }, { returnDocument: 'after' });
    if (!job) continue;
    if (job.creditsState === 'refunded') {
      job.creditsState = 'reserved';
      if (await reserveCredits(job) === null) {
        job.creditsState = 'refunded'; job.status = 'failed'; job.progress = 100; job.progressMessage = 'Créditos insuficientes para reintentar';
        await job.save(); insufficient = true; break;
      }
    }
    job.status = 'queued'; job.progress = 0; job.progressMessage = 'Reintento en cola'; job.attempts = 0; job.lastError = null; job.completedAt = null; job.nextAttemptAt = new Date();
    await job.save(); retried++;
  }
  return NextResponse.json({ retried, insufficient, credits: await getCreditBalance(userId) }, { status: retried ? 202 : 200, headers });
}
