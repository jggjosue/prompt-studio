import 'server-only';
import { generateImage } from '@/ai/flows/generate-image';
import { getAIModelConfig } from '@/lib/ai-credit-config';
import { recordObservabilityEvent } from '@/lib/observability-server';
import { GeminiImageSuccess, parseGeminiImageResponse, GeminiImageResult } from '@/lib/gemini-image-parser';
import { generatedImageKey, putR2Object } from '@/lib/r2-storage';
import { captureCredits } from '@/lib/ai-job-service';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';
import { stripReferenceMedia } from '@/lib/reference-media-strip';
import { parseGeneratedImageSource } from '@/lib/generated-image-source';
import { observedGenerationFetch, recordGenerationRequest, type GenerationRequestContext } from '@/lib/generation-request-observability';
import { providerHttpStatus, safeProviderHost } from '@/lib/provider-error-safety';
import { GOOGLE_IMAGE_API_VERSION, GOOGLE_IMAGE_ENDPOINT_LABEL, googleImageModelFor } from '@/lib/google-image-config';

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
  return { ...input, provider: job.provider, jobId, correlationId: jobId, modelId, userId: job.userId };
}

export function mapGeminiError(
  err: unknown,
  httpStatus?: number,
  finishReason?: string | null
): { category: ErrorCategory; userMessage: string; internalDetails?: unknown } {
  const message = err instanceof Error ? err.message : String(err);

  // 1. Timeout (AbortSignal)
  if (message.includes('timeout') || message.toLowerCase().includes('abort')) {
    return { category: 'TIMEOUT', userMessage: 'Tiempo de espera agotado, intenta de nuevo.' };
  }

  // 2. From parseGeminiImageResponse NO_IMAGE
  if (finishReason && /NO_IMAGE|no image/i.test(message)) {
    return { category: 'NO_IMAGE', userMessage: 'No se generó ninguna imagen.' };
  }

  // 3. HTTP status code mapping
  if (httpStatus) {
    switch (true) {
      case httpStatus >= 500:
        return {
          category: 'PROVIDER_ERROR',
          userMessage: 'Error del proveedor, vuelve a intentarlo.',
          internalDetails: { httpStatus, finishReason },
        };
      case httpStatus === 429:
        return {
          category: 'RATE_LIMIT_OR_QUOTA',
          userMessage: 'Has alcanzado el límite de generaciones o créditos.',
          internalDetails: { httpStatus, finishReason },
        };
      case httpStatus === 404:
        return {
          category: 'MODEL_NOT_FOUND',
          userMessage: 'El modelo no está disponible, selecciona otro.',
          internalDetails: { httpStatus, finishReason },
        };
      case httpStatus === 403:
      case httpStatus === 401:
        return {
          category: 'AUTH_OR_PERMISSION',
          userMessage: 'No tienes permisos o la API key es inválida.',
          internalDetails: { httpStatus, finishReason },
        };
      case httpStatus === 400:
        return {
          category: 'BAD_REQUEST',
          userMessage: 'Solicitud inválida, inténtalo de nuevo.',
          internalDetails: { httpStatus, finishReason },
        };
      default:
        return {
          category: 'PROVIDER_ERROR',
          userMessage: 'Error del proveedor, vuelve a intentarlo.',
          internalDetails: { httpStatus, finishReason },
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
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!key) throw new Error(mapGeminiError(new Error('No se ha configurado la API Key de Gemini')).userMessage);
  const selectedModel = googleImageModelFor(model);
  const endpoint = `https://generativelanguage.googleapis.com/${GOOGLE_IMAGE_API_VERSION}/models/${selectedModel}:generateContent`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  });
  try {
    const res = await observedGenerationFetch(requestContext(job, {
      service: 'google-gemini', host: 'generativelanguage.googleapis.com', endpointLabel: GOOGLE_IMAGE_ENDPOINT_LABEL, method: 'POST',
    }, selectedModel), () => fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body, signal: AbortSignal.timeout(270_000) }));
    const mapped = mapGeminiError(
      new Error(`Gemini generación de imagen falló: ${res.status}.`),
      res.status
    );
    if (!res.ok) throw new Error(mapped.userMessage);
    const data = await res.json() as Record<string, unknown>;
    const result = parseGeminiImageResponse(data) as GeminiImageResult;
    if (result.kind === 'NO_IMAGE') {
      const mapped = mapGeminiError(new Error(''), undefined, result.finishReason);
      throw new Error(mapped.userMessage);
    }
    const success = result as GeminiImageSuccess;
    const imageUrl = success.imageUrl;
    if (!imageUrl) throw new Error(mapGeminiError(new Error(''), undefined, undefined).userMessage);
    return { imageUrl, result: success };
  } catch (err: unknown) {
    const mapped = mapGeminiError(err);
    throw new Error(mapped.userMessage);
  }
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
      jobId: String(job._id), kind: job.kind, provider: job.provider, input,
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
  if (job.kind === 'image' && job.provider === 'google' && !process.env.AI_GENERATION_WORKER_URL) {
    const configuredModel = getAIModelConfig(job.provider, job.modelId ?? '')?.modelId ?? job.modelId;
    if (configuredModel?.startsWith('gemini-')) {
      const startedAt = performance.now();
      let imageUrl = '';
      let status: 'completed' | 'failed' = 'completed';
      let category: ErrorCategory = 'PROVIDER_ERROR';
      let _userMessage: string = 'Error del proveedor, vuelve a intentarlo.';
      let finishReason: string | null = null;
      let hasText = false;
      let hasInlineData = false;
      let mimeType = '';
      let base64Length = 0;
      try {
        const { imageUrl: iUrl, result } = await generateGeminiImage(prompt, configuredModel, job);
        const success = result as GeminiImageSuccess;
        imageUrl = iUrl;
        status = 'completed';
        category = 'PROVIDER_ERROR'; // will be overridden below
        _userMessage = 'Éxodo';
        finishReason = success.finishReason;
        hasText = success.hasText;
        hasInlineData = success.kind === 'IMAGE';
        mimeType = success.mimeType;
        base64Length = success.base64Length;
        // Update category based on success
        category = 'PROVIDER_ERROR'; // placeholder - actual categorization below
      } catch (err: unknown) {
        const mapped = mapGeminiError(err);
        _userMessage = mapped.userMessage;
        category = mapped.category;
        status = 'failed';
        finishReason = null;
        hasText = false;
        hasInlineData = false;
        mimeType = '';
        base64Length = 0;
      }
      // Determine final category
      if (status === 'completed' && imageUrl) {
        // The generateGeminiImage already mapped errors on success path.
        // Use the category from the catch block (which reflects the actual error).
      }
      const durationMs = Math.round(performance.now() - startedAt);
      if (status === 'failed' || !imageUrl) {
        await recordObservabilityEvent({
          category: 'ai_generation',
          name: 'gemini_image_metadata',
          route: '/api/ai/jobs',
          userId: job.userId,
          productId: String(job._id).slice(0, 120),
          status: 'failed',
          durationMs,
          value: job.creditCost,
          unit: 'credits',
          metadata: {
            operation: 'generate',
            kind: job.kind,
            provider: job.provider,
            modelId: job.modelId,
            requestId: job.idempotencyKey?.slice(0, 64) ?? null,
            correlationId: String(job._id),
            finishReason,
            hasText,
            hasInlineData,
            mimeType,
            base64Length,
            errorCategory: category,
          },
        }).catch(() => undefined);
        throw new Error(_userMessage);
      }
      const storedImage = await saveGeneratedImageToR2(imageUrl, job);
      try {
        await recordObservabilityEvent({
          category: 'ai_generation',
          name: 'gemini_image_metadata',
          route: '/api/ai/jobs',
          userId: job.userId,
          productId: String(job._id).slice(0, 120),
          status,
          durationMs,
          value: job.creditCost,
          unit: 'credits',
          metadata: {
            operation: 'generate',
            kind: job.kind,
            provider: job.provider,
            modelId: job.modelId,
            requestId: job.idempotencyKey?.slice(0, 64) ?? null,
            correlationId: String(job._id),
            finishReason,
            hasText,
            hasInlineData,
            mimeType,
            base64Length,
            errorCategory: category, // internal only, not exposed to client
          },
        });
        // Capturar créditos solo si la generación fue exitja.
        // reserveCredits ya fue llamado en el API route; aquí los pasamos a 'captured'.
        await captureCredits(job);
      } catch {
        // La observabilidad no debe romper la generación.
        // Si captureCredits falla, la reserva permanece y el cron la reconciliará.
      }
      return storedImage;
    }
    const imagenContext = requestContext(job, {
      service: 'google-imagen', host: 'generativelanguage.googleapis.com', endpointLabel: 'genkit/imagen-generate', method: 'POST',
    }, getAIModelConfig(job.provider, job.modelId ?? '')?.modelId ?? job.modelId);
    const imagenStartedAt = performance.now();
    try {
      const imagenResult = await generateImage({ prompt });
      await recordGenerationRequest(imagenContext, { httpStatus: 200, durationMs: Math.round(performance.now() - imagenStartedAt) });
      return saveGeneratedImageToR2(imagenResult.imageUrl, job);
    } catch (error) {
      await recordGenerationRequest(imagenContext, { error, httpStatus: providerHttpStatus(error), durationMs: Math.round(performance.now() - imagenStartedAt) });
      throw error;
    }
  }
  return runExternalWorker(job);
}
