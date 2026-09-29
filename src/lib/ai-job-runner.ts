import 'server-only';
import { generateImage } from '@/ai/flows/generate-image';
import { generateVision } from '@/ai/flows/generate-vision';
import { generateText } from '@/ai/flows/generate-text';
import { generateVideoUnderstanding } from '@/ai/flows/generate-video-understanding';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';
import { stripReferenceMedia } from '@/lib/reference-media-strip';
import { parseGeneratedImageSource } from '@/lib/generated-image-source';
import { observedGenerationFetch, recordGenerationRequest, type GenerationRequestContext } from '@/lib/generation-request-observability';
import { providerHttpStatus, safeProviderHost } from '@/lib/provider-error-safety';
import { GOOGLE_IMAGE_API_VERSION, GOOGLE_IMAGE_ENDPOINT_LABEL, googleImageModelFor } from '@/lib/google-image-config';
import { createGeminiTextInteraction } from '@/lib/gemini-interactions';

export type ErrorCategory =
  | 'BAD_REQUEST'
  | 'AUTH_OR_PERMISSION'
  | 'MODEL_NOT_FOUND'
  | 'RATE_LIMIT_OR_QUOTA'
  | 'PROVIDER_ERROR'
  | 'TIMEOUT'
  | 'NO_IMAGE'
  | 'STORAGE_ERROR';

function requestContext(job: IAIGenerationJob, input: Pick<GenerationRequestContext, 'service' | 'host' | 'endpointLabel' | 'method'>, modelId = job.modelId): GenerationRequestContext {
  const jobId = String(job._id);
  return { ...input, provider: job.provider, jobId, correlationId: job.correlationId || jobId, modelId, userId: job.userId };
}

export function mapGeminiError(
  err: unknown,
  httpStatus?: number,
  finishReason?: string | null
): { category: ErrorCategory; userMessage: string; internalDetails?: unknown } {
  const message = err instanceof Error ? err.message : String(err);
  const resolvedHttpStatus = httpStatus ?? providerHttpStatus(err) ?? undefined;
  const errorCode = err && typeof err === 'object' && 'code' in err ? String(err.code) : '';
  const resolvedFinishReason = finishReason ?? (
    err && typeof err === 'object' && 'finishReason' in err && typeof err.finishReason === 'string'
      ? err.finishReason
      : null
  );

  // 1. Timeout (AbortSignal)
  if (message.includes('timeout') || message.toLowerCase().includes('abort')) {
    return { category: 'TIMEOUT', userMessage: 'Tiempo de espera agotado, intenta de nuevo.' };
  }

  // 2. From parseGeminiImageResponse NO_IMAGE
  if (errorCode === 'NO_IMAGE' || (resolvedFinishReason && /NO_IMAGE|no image/i.test(message))) {
    return { category: 'NO_IMAGE', userMessage: 'No se generó ninguna imagen.' };
  }

  if (errorCode === 'CREDENTIAL_MISSING') {
    return { category: 'AUTH_OR_PERMISSION', userMessage: 'No tienes permisos o la API key es inválida.' };
  }

  // 3. HTTP status code mapping
  if (resolvedHttpStatus) {
    switch (true) {
      case resolvedHttpStatus >= 500:
        return {
          category: 'PROVIDER_ERROR',
          userMessage: 'Error del proveedor, vuelve a intentarlo.',
          internalDetails: { httpStatus: resolvedHttpStatus, finishReason: resolvedFinishReason },
        };
      case resolvedHttpStatus === 429:
        return {
          category: 'RATE_LIMIT_OR_QUOTA',
          userMessage: 'Has alcanzado el límite de generaciones o créditos.',
          internalDetails: { httpStatus: resolvedHttpStatus, finishReason: resolvedFinishReason },
        };
      case resolvedHttpStatus === 404:
        return {
          category: 'MODEL_NOT_FOUND',
          userMessage: 'El modelo no está disponible, selecciona otro.',
          internalDetails: { httpStatus: resolvedHttpStatus, finishReason: resolvedFinishReason },
        };
      case resolvedHttpStatus === 403:
      case resolvedHttpStatus === 401:
        return {
          category: 'AUTH_OR_PERMISSION',
          userMessage: 'No tienes permisos o la API key es inválida.',
          internalDetails: { httpStatus: resolvedHttpStatus, finishReason: resolvedFinishReason },
        };
      case resolvedHttpStatus === 400:
        return {
          category: 'BAD_REQUEST',
          userMessage: 'Solicitud inválida, inténtalo de nuevo.',
          internalDetails: { httpStatus: resolvedHttpStatus, finishReason: resolvedFinishReason },
        };
      default:
        return {
          category: 'PROVIDER_ERROR',
          userMessage: 'Error del proveedor, vuelve a intentarlo.',
          internalDetails: { httpStatus: resolvedHttpStatus, finishReason: resolvedFinishReason },
        };
    }
  }

  // 4. Generic provider error (contains 'Gemini' or generic error)
  if (/Gemini|proveedor|api/i.test(message)) {
    return {
      category: 'PROVIDER_ERROR',
      userMessage: 'Error del proveedor, vuelve a intentarlo.',
      internalDetails: { message, finishReason },
    };
  }

  // 5. Fallback
  return {
    category: 'PROVIDER_ERROR',
    userMessage: 'Error inesperado, vuelve a intentarlo.',
  };
}

async function saveGeneratedImageToR2(imageUrl: string, job: IAIGenerationJob): Promise<{ imageUrl: string; imageKey: string }> {
  let buffer: Buffer;
  let mimeType: string;
  const source = parseGeneratedImageSource(imageUrl);
  if (source.kind === 'inline') {
    buffer = source.buffer;
    mimeType = source.mimeType;
  } else {
    const res = await observedGenerationFetch(requestContext(job, {
      service: 'generated-image-source', host: safeProviderHost(source.url), endpointLabel: 'generated-image-download', method: 'GET',
    }), () => fetch(source.url, { signal: AbortSignal.timeout(60_000) }));
    if (!res.ok) throw new Error(`No se pudo obtener la imagen para R2: ${res.status}.`);
    buffer = Buffer.from(await res.arrayBuffer());
    mimeType = res.headers.get('content-type') || 'image/png';
  }
  const key = generatedImageKey(job.userId, String(job._id), mimeType);
  const r2Context = requestContext(job, {
    service: 'cloudflare-r2', host: 'r2.cloudflarestorage.com', endpointLabel: 'r2-put-object', method: 'PUT',
  });
  const r2StartedAt = performance.now();
  let stored: string | null;
  try {
    stored = await putR2Object(key, buffer, mimeType);
    await recordGenerationRequest(r2Context, {
      httpStatus: stored ? 200 : 503, durationMs: Math.round(performance.now() - r2StartedAt),
      ...(!stored ? { providerErrorCode: 'R2_NOT_CONFIGURED', providerErrorMessage: 'R2 storage is unavailable.' } : {}),
    });
  } catch (error) {
    await recordGenerationRequest(r2Context, { error, httpStatus: providerHttpStatus(error), durationMs: Math.round(performance.now() - r2StartedAt) });
    throw error;
  }
  if (!stored) throw new Error('No se pudo guardar la imagen en R2.');
  return { imageUrl: `/api/ai/jobs/${String(job._id)}/asset`, imageKey: key };
}

async function generateGeminiImage(prompt: string, model: string, job: IAIGenerationJob): Promise<{ imageUrl: string; result: GeminiImageSuccess }> {
  const key = googleImageApiKey();
  const selectedModel = googleImageModelFor(model);
  const { result } = await requestGoogleImage({
    prompt,
    requestedModel: selectedModel,
    apiKey: key,
    fetchImpl: (input, init) => observedGenerationFetch(requestContext(job, {
      service: 'google-gemini', host: 'generativelanguage.googleapis.com', endpointLabel: GOOGLE_IMAGE_ENDPOINT_LABEL, method: 'POST',
    }, selectedModel), () => fetch(input, init)),
  });
  return { imageUrl: result.imageUrl, result };
}

function asResult(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('El proveedor devolvió un resultado inválido.');
  return value as Record<string, unknown>;
}

async function runExternalWorker(job: IAIGenerationJob) {
  const url = process.env.AI_GENERATION_WORKER_URL?.trim();
  const token = process.env.AI_GENERATION_WORKER_TOKEN?.trim();
  if (!url || !token) throw new Error(`No hay un worker configurado para ${job.kind}/${job.provider}.`);
  const config = getAIModelConfig(job.provider, job.modelId ?? '');
  const apiModelId = (config?.modelId && config.modelId !== job.modelId) ? config.modelId : job.modelId;
  const safeInput = job.kind === 'image' || job.kind === 'video' ? stripReferenceMedia(job.input) : job.input;
  const input = { ...safeInput, model: apiModelId };
  const response = await observedGenerationFetch(requestContext(job, {
    service: 'ai-generation-worker', host: safeProviderHost(url), endpointLabel: 'configured-generation-worker', method: 'POST',
  }, apiModelId), () => fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'Idempotency-Key': job.idempotencyKey },
    body: JSON.stringify({
      jobId: String(job._id), ownershipToken: job.lockToken, kind: job.kind, provider: job.provider, input,
      ...((job.input.experiment === true || job.input.evaluationSuite === true) ? { evaluationRequested: { scale: 100, dimensions: Array.isArray(job.input.evaluationRubric) ? job.input.evaluationRubric.slice(0, 6) : ['fidelity', 'quality'], expected: typeof job.input.expected === 'string' ? job.input.expected : '', seed: typeof job.input.seed === 'number' ? job.input.seed : undefined, temperature: typeof job.input.temperature === 'number' ? job.input.temperature : undefined } } : {}),
    }),
    signal: AbortSignal.timeout(270_000),
  }));
  if (!response.ok) throw new Error(`Worker externo respondió ${response.status}.`);
  const result = asResult(await response.json());
  if (JSON.stringify(result).length > 2_000_000) throw new Error('El resultado excede el límite de 2 MB; guárdalo en R2 y devuelve una URL.');
  return result;
}

export async function runAIJob(job: IAIGenerationJob): Promise<Record<string, unknown>> {
  const basePrompt = typeof job.input.prompt === 'string' ? job.input.prompt.trim() : '';
  const instructions = typeof job.input.outputContractInstructions === 'string' ? job.input.outputContractInstructions.trim() : '';
  const prompt = instructions ? `${basePrompt}\n\n${instructions}` : basePrompt;
  if (!prompt) throw new Error(mapGeminiError(new Error('El trabajo no contiene un prompt válido')).userMessage);
  if (job.kind === 'project' && job.provider === 'google') {
    return createGeminiTextInteraction(prompt);
  }
  if (job.kind === 'image' && job.provider === 'google' && !process.env.AI_GENERATION_WORKER_URL) {
    return generateImage({ prompt, model: job.modelId });
  }

  if (job.kind === 'vision' && job.provider === 'google' && !process.env.AI_GENERATION_WORKER_URL) {
    const referenceImage = (job.input as Record<string, unknown>).referenceImage as string | undefined;
    return generateVision({ prompt, model: job.modelId, referenceImage });
  }

  if (job.kind === 'text' && job.provider === 'google' && !process.env.AI_GENERATION_WORKER_URL) {
    const thinkingLevel = (job.input as Record<string, unknown>).thinkingLevel as string | undefined;
    const systemInstruction = (job.input as Record<string, unknown>).systemInstruction as string | undefined;
    return generateText({ prompt, model: job.modelId, thinkingLevel, systemInstruction });
  }

  if (job.kind === 'videoUnderstanding' && job.provider === 'google' && !process.env.AI_GENERATION_WORKER_URL) {
    const inp = job.input as Record<string, unknown>;
    return generateVideoUnderstanding({
      prompt,
      model: job.modelId ?? undefined,
      videoUrl: inp.videoUrl as string | undefined,
      videoBase64: inp.videoBase64 as string | undefined,
      videoMimeType: inp.videoMimeType as string | undefined,
      processingMode: (inp.processingMode as 'agentic' | 'static' | undefined) ?? 'agentic',
      startOffset: inp.startOffset as number | undefined,
      endOffset: inp.endOffset as number | undefined,
      fps: inp.fps as number | undefined,
    });
  }
  return runExternalWorker(job);
}
