import { estimateAICredits, resolveAIModelId } from '@/lib/ai-credit-config';
import { isAIJobKind, isProviderForKind } from '@/lib/ai-job-config';
import { serializeAIJob } from '@/lib/ai-job-serializer';
import { AIGenerationJob, getCreditBalance, reserveCredits } from '@/lib/ai-job-service';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { contractInstructions } from '@/lib/output-contract';
import { evaluateBudgetOperation } from '@/lib/project-budget';
import { isProviderObjective } from '@/lib/provider-quality';
import { recommendedProvider } from '@/lib/provider-quality-server';
import { RATE_LIMITS, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { getServerSubscriptionStatus, hasDownloadPlan } from '@/lib/server-subscription-status';
import BrandKit from '@/models/BrandKit';
import CreativeProject from '@/models/CreativeProject';
import OutputContract from '@/models/OutputContract';
import PromptVersion from '@/models/PromptVersion';
import { auth, clerkClient } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { isPromptStudioAdminEmail } from '@/lib/prompt-studio-admin';

const headers = () => cacheHeaders('private-no-store');
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para generar contenido.' }, { status: 401, headers: headers() });
  // Se limita por usuario, no por IP: el coste se imputa a la cuenta.
  const quota = await rateLimit({ key: `ai-jobs:${userId}`, ...RATE_LIMITS.expensiveAuthed });
  if (!quota.ok) return tooManyRequests(quota);
  const raw = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!raw || !isAIJobKind(raw.kind)) return NextResponse.json({ error: 'Tipo de trabajo inválido.' }, { status: 400, headers: headers() });
  let provider = clean(raw.provider, 40).toLowerCase();
  if (provider === 'auto') {
    const objective = isProviderObjective(raw.objective) ? raw.objective : 'balanced';
    provider = (await recommendedProvider(raw.kind, objective, userId, clean(raw.projectId, 80) || undefined)).provider;
  }
  const idempotencyKey = clean(request.headers.get('Idempotency-Key') || raw.idempotencyKey, 120);
  const input = raw.input && typeof raw.input === 'object' && !Array.isArray(raw.input) ? raw.input as Record<string, unknown> : {};
  const prompt = clean(input.prompt, 20_000);
  if (JSON.stringify(input).length > 50_000) return NextResponse.json({ error: 'La configuración supera el límite permitido.' }, { status: 413, headers: headers() });
  if (!isProviderForKind(raw.kind, provider) || idempotencyKey.length < 8 || !prompt) {
    return NextResponse.json({ error: 'Proveedor, prompt o clave idempotente inválidos.' }, { status: 400, headers: headers() });
  }
  const requestedModel = clean(input.model, 80);
  const modelId = resolveAIModelId(raw.kind, provider, requestedModel);
  if (!modelId) return NextResponse.json({ error: { code: 'MODEL_NOT_ALLOWED', message: 'El modelo solicitado no está disponible para esta operación.' } }, { status: 400, headers: headers() });
  if (provider === 'google' && raw.kind === 'project' && !hasDownloadPlan(await getServerSubscriptionStatus())) {
    return NextResponse.json({ error: { code: 'PLAN_REQUIRED', message: 'Gemini para generación web requiere una suscripción Premium activa.' } }, { status: 403, headers: headers() });
  }
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userEmail = user.primaryEmailAddress?.emailAddress;
  if (!userEmail) return NextResponse.json({ error: 'Tu cuenta necesita un correo principal.' }, { status: 400, headers: headers() });
  await connectToDatabase();
  const promptVersionId = clean(raw.promptVersionId, 80);
  let promptVersionNumber: number | null = null;
  if (promptVersionId) {
    if (!mongoose.isValidObjectId(promptVersionId)) return NextResponse.json({ error: 'Identificador de versión inválido.' }, { status: 400, headers: headers() });
    const version = await PromptVersion.findOne({ _id: promptVersionId, userId }).select('version content').lean();
    if (!version) return NextResponse.json({ error: 'La versión del prompt no pertenece al usuario.' }, { status: 403, headers: headers() });
    if (version.content !== prompt) return NextResponse.json({ error: 'El contenido no coincide con la versión seleccionada.' }, { status: 409, headers: headers() });
    promptVersionNumber = version.version;
  }
  const brandKitId = clean(raw.brandKitId, 80) || clean(input.brandKitId, 80);
  if (brandKitId && (!mongoose.isValidObjectId(brandKitId) || !(await BrandKit.exists({ _id: brandKitId, userId })))) {
    return NextResponse.json({ error: 'El Brand Kit no pertenece al usuario.' }, { status: 403, headers: headers() });
  }
  const projectId = clean(raw.projectId, 80);
  let project = null;
  if (projectId) {
    if (!mongoose.isValidObjectId(projectId)) return NextResponse.json({ error: 'El proyecto no pertenece al usuario o está archivado.' }, { status: 403, headers: headers() });
    project = await CreativeProject.findOne({ _id: projectId, userId, status: 'active' }).select('budget outputContractId').lean();
    if (!project) return NextResponse.json({ error: 'El proyecto no pertenece al usuario o está archivado.' }, { status: 403, headers: headers() });
  }
  const existing = await AIGenerationJob.findOne({ userId, idempotencyKey });
  if (existing) return NextResponse.json({ job: serializeAIJob(existing), credits: await getCreditBalance(userId), duplicate: true }, { status: 200, headers: headers() });
  let cost;
  try {
    cost = estimateAICredits({ provider, model: modelId, kind: raw.kind, input });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'MODEL_NOT_ALLOWED';
    return NextResponse.json({ error: { code, message: 'La configuración de generación no está disponible.' } }, { status: 400, headers: headers() });
  }
  // El superadministrador puede probar el flujo en desarrollo sin saldo.
  if (isPromptStudioAdminEmail(userEmail)) cost = { ...cost, credits: 0 };
  const requestedContractId = clean(raw.outputContractId, 80) || project?.outputContractId || '';
  let outputContract = null;
  if (requestedContractId) {
    if (raw.kind !== 'project' || !mongoose.isValidObjectId(requestedContractId)) return NextResponse.json({ error: 'El contrato de salida solo se admite para texto, código o datos estructurados.' }, { status: 400, headers: headers() });
    outputContract = await OutputContract.findOne({ _id: requestedContractId, userId, $or: [{ projectId: null }, { projectId: projectId || null }] }).lean();
    if (!outputContract) return NextResponse.json({ error: 'El contrato de salida no pertenece al usuario o proyecto.' }, { status: 403, headers: headers() });
  }
  if (project) {
    const jobs = await AIGenerationJob.find({ projectId, userId }).select('kind provider status creditsState creditCost estimatedCostUsd actualCostUsd').lean();
    const settings = { limitCredits: project.budget?.limitCredits ?? null, limitUsd: project.budget?.limitUsd ?? null, warningPercent: project.budget?.warningPercent ?? 80, approvalCredits: project.budget?.approvalCredits ?? null, approvalUsd: project.budget?.approvalUsd ?? null };
    const decision = evaluateBudgetOperation(settings, jobs.map(job => ({ kind: job.kind, provider: job.provider, status: job.status, creditsState: job.creditsState, creditCost: job.creditCost, estimatedCostUsd: job.estimatedCostUsd, actualCostUsd: job.actualCostUsd ?? null })), { credits: cost.credits, estimatedUsd: cost.estimatedApiCostUsd }, raw.projectBudgetApproved === true);
    if (!decision.allowed) return NextResponse.json({ error: decision.approvalRequired ? 'Esta operación requiere aprobación manual por su costo.' : 'La operación excede el presupuesto del proyecto.', approvalRequired: decision.approvalRequired, exceedsCredits: decision.exceedsCredits, exceedsUsd: decision.exceedsUsd, projection: { credits: decision.nextCredits, usd: decision.nextUsd }, budget: settings }, { status: 409, headers: headers() });
  }
  let job;
  try {
    job = await AIGenerationJob.create({
      userId, userEmail, kind: raw.kind, provider, modelId, operation: raw.kind, input: { ...input, prompt, brandKitId: brandKitId || null, ...(outputContract ? { outputContractInstructions: contractInstructions(outputContract) } : {}) }, idempotencyKey, promptVersionId: promptVersionId || null, promptVersionNumber, projectId: projectId || null, outputContractId: outputContract ? String(outputContract._id) : null,
      creditCost: cost.credits, estimatedCostUsd: cost.estimatedApiCostUsd, estimatedInputTokens: cost.estimatedInputTokens, estimatedOutputTokens: cost.estimatedOutputTokens,
      notifyOnComplete: raw.notifyOnComplete !== false,
    });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      const duplicate = await AIGenerationJob.findOne({ userId, idempotencyKey });
      if (duplicate) return NextResponse.json({ job: serializeAIJob(duplicate), credits: await getCreditBalance(userId), duplicate: true }, { headers: headers() });
    }
    throw error;
  }
  const balance = await reserveCredits(job);
  if (balance === null) {
    await AIGenerationJob.deleteOne({ _id: job._id });
    const credits = await getCreditBalance(userId);
    return NextResponse.json({ error: { code: 'INSUFFICIENT_CREDITS', message: `Necesitas ${cost.credits} créditos para esta generación y tienes ${credits.balance}.` }, required: cost.credits, credits }, { status: 402, headers: headers() });
  }
  return NextResponse.json({ job: serializeAIJob(job), credits: { balance }, duplicate: false }, { status: 202, headers: headers() });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: headers() });
  await connectToDatabase();
  const jobs = await AIGenerationJob.find({ userId }).sort({ createdAt: -1 }).limit(50);
  return NextResponse.json({ jobs: jobs.map(serializeAIJob), credits: await getCreditBalance(userId) }, { headers: headers() });
}
