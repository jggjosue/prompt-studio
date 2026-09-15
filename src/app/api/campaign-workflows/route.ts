import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { AI_JOB_COSTS, isProviderForKind } from '@/lib/ai-job-config';
import { AIGenerationJob, getCreditBalance, refundCredits, reserveCredits } from '@/lib/ai-job-service';
import { compileBrandContext, type BrandKitContext } from '@/lib/brand-kit';
import { buildCampaignTasks, campaignCredits } from '@/lib/campaign-orchestrator';
import { budgetNumber, evaluateBudgetOperation } from '@/lib/project-budget';
import { rateLimit, RATE_LIMITS, tooManyRequests } from '@/lib/rate-limit';
import BrandKit from '@/models/BrandKit';
import CampaignWorkflow from '@/models/CampaignWorkflow';
import CreativeProject from '@/models/CreativeProject';

const headers = { 'Cache-Control': 'private, no-store' };
const clean = (value: unknown, length: number) => typeof value === 'string' ? value.trim().slice(0, length) : '';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ campaigns: [] }, { status: 401, headers });
  await connectToDatabase();
  const rows = await CampaignWorkflow.find({ userId }).sort({ createdAt: -1 }).limit(30).lean();
  return NextResponse.json({ campaigns: rows.map(row => ({ id: String(row._id), name: row.name, language: row.language, count: row.tasks.length, createdAt: row.createdAt })) }, { headers });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para crear campañas.' }, { status: 401, headers });
  const quota = await rateLimit({ key: `campaign-workflow:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const name = clean(body?.name, 160) || 'Nueva campaña';
  const brief = clean(body?.brief, 10_000);
  const audience = clean(body?.audience, 1_500);
  const language = clean(body?.language, 80) || 'Español';
  const brandKitId = clean(body?.brandKitId, 80);
  const imageProvider = clean(body?.imageProvider, 40) || 'google';
  const videoProvider = clean(body?.videoProvider, 40) || 'runway';
  const textProvider = clean(body?.textProvider, 40) || 'openai';
  const budget = { limitCredits: budgetNumber(body?.budgetLimitCredits, 100_000), limitUsd: budgetNumber(body?.budgetLimitUsd, 1_000_000), warningPercent: Math.max(1, Math.min(100, Math.round(Number(body?.budgetWarningPercent) || 80))), approvalCredits: budgetNumber(body?.approvalCredits, 100_000), approvalUsd: budgetNumber(body?.approvalUsd, 1_000_000) };
  if (brief.length < 20) return NextResponse.json({ error: 'El brief necesita al menos 20 caracteres.' }, { status: 400, headers });

  await connectToDatabase();
  let brandKit: BrandKitContext | null = null;
  if (brandKitId) {
    if (!mongoose.isValidObjectId(brandKitId)) return NextResponse.json({ error: 'Brand Kit inválido.' }, { status: 400, headers });
    const row = await BrandKit.findOne({ _id: brandKitId, userId }).lean();
    if (!row) return NextResponse.json({ error: 'El Brand Kit no pertenece a tu cuenta.' }, { status: 403, headers });
    brandKit = { id: String(row._id), name: row.name, logoUrl: row.logoUrl, colors: row.colors, headingFont: row.headingFont, bodyFont: row.bodyFont, tone: row.tone, audience: row.audience, products: row.products, allowedWords: row.allowedWords, forbiddenWords: row.forbiddenWords, visualReferences: row.visualReferences };
  }

  const tasks = buildCampaignTasks({ brief: brandKit ? `${brief}${compileBrandContext(brandKit)}` : brief, audience, language, imageProvider, videoProvider, textProvider });
  if (tasks.some(task => !isProviderForKind(task.kind, task.provider))) return NextResponse.json({ error: 'Uno de los proveedores no es compatible.' }, { status: 400, headers });
  const total = tasks.reduce((sum, task) => ({ credits: sum.credits + AI_JOB_COSTS[task.kind].credits, estimatedUsd: sum.estimatedUsd + AI_JOB_COSTS[task.kind].estimatedUsd }), { credits: 0, estimatedUsd: 0 });
  const budgetDecision = evaluateBudgetOperation(budget, [], total, body?.projectBudgetApproved === true);
  if (!budgetDecision.allowed) return NextResponse.json({ error: budgetDecision.approvalRequired ? 'La campaña requiere aprobación manual por su costo.' : 'La campaña excede el presupuesto definido.', approvalRequired: budgetDecision.approvalRequired, exceedsCredits: budgetDecision.exceedsCredits, exceedsUsd: budgetDecision.exceedsUsd, projection: { credits: budgetDecision.nextCredits, usd: budgetDecision.nextUsd } }, { status: 409, headers });
  const user = await (await clerkClient()).users.getUser(userId);
  const email = user.primaryEmailAddress?.emailAddress;
  if (!email) return NextResponse.json({ error: 'Tu cuenta necesita un correo principal.' }, { status: 400, headers });

  const project = await CreativeProject.create({ userId, name, brief, audience, budget, brand: brandKit ? { name: brandKit.name, voice: brandKit.tone, colors: brandKit.colors, headingFont: brandKit.headingFont, bodyFont: brandKit.bodyFont } : {}, prompts: tasks.map(task => ({ title: task.label, content: task.prompt, versionId: null, addedAt: new Date() })) });
  const created: any[] = [], reserved: any[] = [];
  try {
    for (const task of tasks) {
      const cost = AI_JOB_COSTS[task.kind];
      const job = await AIGenerationJob.create({ userId, userEmail: email, kind: task.kind, provider: task.provider, projectId: String(project._id), input: { prompt: task.prompt, campaign: true, campaignStage: task.stage, brandKitId: brandKit?.id ?? null }, idempotencyKey: `campaign-${crypto.randomUUID()}`, creditCost: cost.credits, estimatedCostUsd: cost.estimatedUsd, notifyOnComplete: false });
      created.push(job);
      if (await reserveCredits(job) === null) throw new Error('INSUFFICIENT');
      reserved.push(job);
    }
    const campaign = await CampaignWorkflow.create({ userId, projectId: String(project._id), name, brief, audience, language, tasks: tasks.map((task, index) => ({ stage: task.stage, label: task.label, jobId: created[index]._id })) });
    return NextResponse.json({ id: String(campaign._id), projectId: String(project._id), estimatedCredits: campaignCredits(tasks), credits: await getCreditBalance(userId) }, { status: 201, headers });
  } catch (error) {
    for (const job of reserved) await refundCredits(job);
    await AIGenerationJob.deleteMany({ _id: { $in: created.map(job => job._id) } });
    await CreativeProject.deleteOne({ _id: project._id, userId });
    if (error instanceof Error && error.message === 'INSUFFICIENT') return NextResponse.json({ error: `Créditos insuficientes. La campaña completa requiere ${campaignCredits(tasks)} créditos.` }, { status: 402, headers });
    throw error;
  }
}
