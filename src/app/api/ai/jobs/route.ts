import { estimateAICredits, resolveAIModelId } from '@/lib/ai-credit-config';
import { isAIJobKind, isProviderForKind } from '@/lib/ai-job-config';
import { serializeAIJob } from '@/lib/ai-job-serializer';
import { AIGenerationJob, getCreditBalance } from '@/lib/ai-job-service';
import { reserveGenerationCredits } from '@/lib/generation-credit-boundary';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { contractInstructions } from '@/lib/output-contract';
import { humanVerificationDecision } from '@/lib/human-verification';
import { dispatchGenerationJob } from '@/lib/generation-queue-dispatch';
import { recordObservabilityEvent } from '@/lib/observability-server';
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
import { resolveTextGenerationOperation } from '@/lib/text-generation-operation';
import { resolvePromptOptimizerOperation } from '@/lib/prompt-optimizer-operation';
import { resolveImageGenerationOperation } from '@/lib/image-generation-operation';
import { resolveVideoGenerationOperation } from '@/lib/video-generation-operation';
import { resolveWebsiteGenerationOperation } from '@/lib/website-generation-operation';
import { resolveWebsiteAIEditOperation } from '@/lib/website-ai-edit-operation';
import { resolveCodeAuditOperation } from '@/lib/code-audit-operation';
import { resolveComponentOperation } from '@/lib/component-ai-operation';
import { resolveRuntimeOperationPricing } from '@/lib/runtime-operation-pricing';

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
    project = await CreativeProject.findOne({ _id: projectId, userId, status: 'active' }).select('budget outputContractId reviewStatus changeRequests').lean();
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
  let operationCode: string | null = null;
  if (raw.kind === 'text') {
    try {
      const operation = input.optimizerTier !== undefined
        ? resolvePromptOptimizerOperation(input)
        : resolveTextGenerationOperation(input);
      operationCode = operation.code;
      cost = { ...cost, credits: operation.creditCost };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'AI_OPERATION_TIER_REQUIRED';
      const optimizing = input.optimizerTier !== undefined;
      return NextResponse.json({
        error: {
          code,
          message: optimizing
            ? 'Selecciona el nivel del optimizador: basic, advanced o complex.'
            : 'Selecciona el nivel de generación de texto: short, long o complex.',
        },
      }, { status: 400, headers: headers() });
    }
  }
  if (raw.kind === 'image') {
    try {
      const operation = resolveImageGenerationOperation(input);
      operationCode = operation.code;
      cost = { ...cost, credits: operation.creditCost };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'IMAGE_TIER_REQUIRED';
      return NextResponse.json({
        error: {
          code,
          message: 'Selecciona el nivel de imagen: lite-1k, quality-1k, quality-2k o quality-4k.',
        },
      }, { status: 400, headers: headers() });
    }
  }
  if (raw.kind === 'video') {
    try {
      const operation = resolveVideoGenerationOperation(input);
      operationCode = operation.code;
      cost = { ...cost, credits: operation.creditCost };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'VIDEO_TIER_REQUIRED';
      return NextResponse.json({
        error: {
          code,
          message: 'Selecciona un preset de video válido de 8 segundos.',
        },
      }, { status: 400, headers: headers() });
    }
  }
  if (raw.kind === 'web') {
    try {
      const editing = input.websiteEditTier !== undefined;
      const operation = editing
        ? resolveWebsiteAIEditOperation(input)
        : resolveWebsiteGenerationOperation(input);
      operationCode = operation.code;
      cost = { ...cost, credits: operation.creditCost };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'WEBSITE_OPERATION_TIER_REQUIRED';
      const editing = input.websiteEditTier !== undefined;
      return NextResponse.json({
        error: {
          code,
          message: editing
            ? 'Selecciona el nivel de edición AI: small, section, complex o redesign.'
            : 'Selecciona el nivel del sitio web: simple, advanced o complex.',
        },
      }, { status: 400, headers: headers() });
    }
  }
  if (raw.kind === 'project' && input.codeAuditTier !== undefined) {
    try {
      const resolved = resolveCodeAuditOperation(input);
      operationCode = resolved.operation.code;
      cost = { ...cost, credits: resolved.creditCost };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'CODE_AUDIT_TIER_REQUIRED';
      return NextResponse.json({
        error: {
          code,
          message: 'Selecciona el nivel de auditoría: small, standard, advanced o project.',
        },
      }, { status: 400, headers: headers() });
    }
  }
  if (input.componentOperation !== undefined) {
    try {
      const operation = resolveComponentOperation(input);
      operationCode = operation.code;
      cost = { ...cost, credits: operation.creditCost };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'COMPONENT_OPERATION_REQUIRED';
      return NextResponse.json({
        error: {
          code,
          message: 'Selecciona la operación del componente: preview, analysis, modification o generation.',
        },
      }, { status: 400, headers: headers() });
    }
  }
  if (operationCode) {
    try {
      const runtimePricing = await resolveRuntimeOperationPricing({ operationCode, provider, modelId, usage: { input, outputTokens: cost.estimatedOutputTokens, imageCount: raw.kind === 'image' ? 1 : 0, videoDurationSeconds: raw.kind === 'video' ? 8 : 0 } });
      cost = { ...cost, credits: runtimePricing.creditCost };
    } catch (error) {
      const code = error instanceof Error ? error.message : 'PRICING_NOT_AVAILABLE';
      return NextResponse.json({ error: { code, message: 'La operación no puede ejecutarse con el precio/proveedor actual.' } }, { status: 409, headers: headers() });
    }
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
    const budgetJobs = jobs.map(job => ({ kind: job.kind, provider: job.provider, status: job.status, creditsState: job.creditsState, creditCost: job.creditCost, estimatedCostUsd: job.estimatedCostUsd, actualCostUsd: job.actualCostUsd ?? null }));
    const pendingDecision = evaluateBudgetOperation(settings, budgetJobs, { credits: cost.credits, estimatedUsd: cost.estimatedApiCostUsd }, false);
    const verification = humanVerificationDecision({ costly: pendingDecision.approvalRequired, sensitive: false, reviewStatus: project.reviewStatus, hasOpenChanges: project.changeRequests?.some((item: { status: string }) => item.status === 'open') ?? false });
    const decision = evaluateBudgetOperation(settings, budgetJobs, { credits: cost.credits, estimatedUsd: cost.estimatedApiCostUsd }, verification.approved);
    if (!decision.allowed) {
      if (decision.approvalRequired) void recordObservabilityEvent({ category: 'ai_generation', name: 'human_verification_blocked', route: '/api/ai/jobs', userId, productId: projectId, status: 'blocked', costUsd: cost.estimatedApiCostUsd, value: cost.credits, unit: 'credits', metadata: { kind: raw.kind, provider, reasons: verification.reasons } });
      return NextResponse.json({ error: decision.approvalRequired ? 'Esta operación requiere que un propietario o revisor apruebe el proyecto.' : 'La operación excede el presupuesto del proyecto.', approvalRequired: decision.approvalRequired, verification: { required: verification.required, approved: verification.approved, reviewStatus: project.reviewStatus ?? 'draft', hasOpenChanges: project.changeRequests?.some((item: { status: string }) => item.status === 'open') ?? false }, exceedsCredits: decision.exceedsCredits, exceedsUsd: decision.exceedsUsd, projection: { credits: decision.nextCredits, usd: decision.nextUsd }, budget: settings }, { status: 409, headers: headers() });
    }
  }
  let job;
  try {
    job = await AIGenerationJob.create({
      userId, userEmail, kind: raw.kind, provider, modelId, operation: operationCode ?? raw.kind, operationCode, input: { ...input, prompt, brandKitId: brandKitId || null, ...(outputContract ? { outputContractInstructions: contractInstructions(outputContract) } : {}) }, idempotencyKey, promptVersionId: promptVersionId || null, promptVersionNumber, projectId: projectId || null, outputContractId: outputContract ? String(outputContract._id) : null,
      creditCost: cost.credits, pricingSnapshot: operationCode ? { creditCost: cost.credits, pricedAt: new Date() } : null, estimatedCostUsd: cost.estimatedApiCostUsd, estimatedInputTokens: cost.estimatedInputTokens, estimatedOutputTokens: cost.estimatedOutputTokens,
      notifyOnComplete: raw.notifyOnComplete !== false,
    });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      const duplicate = await AIGenerationJob.findOne({ userId, idempotencyKey });
      if (duplicate) return NextResponse.json({ job: serializeAIJob(duplicate), credits: await getCreditBalance(userId), duplicate: true }, { headers: headers() });
    }
    throw error;
  }
  const creditGuard = await reserveGenerationCredits(job);
  if (!creditGuard.allowed) {
    await AIGenerationJob.deleteOne({ _id: job._id });
    const credits = await getCreditBalance(userId);
    return NextResponse.json({ error: { code: 'INSUFFICIENT_CREDITS', message: `Necesitas ${cost.credits} créditos para esta generación y tienes ${credits.balance}.` }, required: cost.credits, credits }, { status: 402, headers: headers() });
  }
  const dispatch = await dispatchGenerationJob(String(job._id));
  if (!dispatch.dispatched) {
    void recordObservabilityEvent({
      category: 'ai_generation',
      name: 'generation_queue_fallback',
      route: '/api/ai/jobs',
      userId,
      productId: String(job._id),
      status: dispatch.reason,
      metadata: { jobId: String(job._id), mode: dispatch.mode, reason: dispatch.reason },
    });
  }
  return NextResponse.json({ job: serializeAIJob(job), credits: { balance: creditGuard.remainingBalance }, duplicate: false, dispatch }, { status: 202, headers: headers() });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: headers() });
  await connectToDatabase();
  const jobs = await AIGenerationJob.find({ userId }).sort({ createdAt: -1 }).limit(50);
  return NextResponse.json({ jobs: jobs.map(serializeAIJob), credits: await getCreditBalance(userId) }, { headers: headers() });
}
