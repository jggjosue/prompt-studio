import 'server-only';
import { generateImage } from '@/ai/flows/generate-image';
import { getAIModelConfig } from '@/lib/ai-credit-config';
import { recordObservabilityEvent } from '@/lib/observability-server';
import type { GeminiImageSuccess } from '@/lib/gemini-image-parser';
import { parseGeminiImageResponse } from '@/lib/gemini-image-parser';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';
import { stripReferenceMedia } from '@/lib/reference-media-strip';

async function generateGeminiImage(prompt: string, model: string): Promise<{ imageUrl: string; result: GeminiImageSuccess }> {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!key) throw new Error('No se ha configurado la API Key de Gemini.');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { imageGenerationConfig: { numberOfImages: 1 } },
  });
  try {
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, signal: AbortSignal.timeout(270_000) });
    if (!res.ok) throw new Error(`Gemini generación de imagen falló: ${res.status}.`);
    const data = await res.json() as Record<string, unknown>;
    const result = parseGeminiImageResponse(data) as GeminiImageSuccess;
    const imageUrl = result.imageUrl;
    if (!imageUrl) throw new Error('Gemini no generó una imagen.');
    return { imageUrl, result };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    const sanitized = msg.replace(endpoint, '[GEMINI_ENDPOINT_REDACTED]').replace(key, '[KEY_REDACTED]');
    throw new Error(sanitized);
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
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, 'Idempotency-Key': job.idempotencyKey },
    body: JSON.stringify({
      jobId: String(job._id), kind: job.kind, provider: job.provider, input,
      ...((job.input.experiment === true || job.input.evaluationSuite === true) ? { evaluationRequested: { scale: 100, dimensions: Array.isArray(job.input.evaluationRubric) ? job.input.evaluationRubric.slice(0, 6) : ['fidelity', 'quality'], expected: typeof job.input.expected === 'string' ? job.input.expected : '', seed: typeof job.input.seed === 'number' ? job.input.seed : undefined, temperature: typeof job.input.temperature === 'number' ? job.input.temperature : undefined } } : {}),
    }),
    signal: AbortSignal.timeout(270_000),
  });
  if (!response.ok) throw new Error(`Worker externo respondió ${response.status}.`);
  const result = asResult(await response.json());
  if (JSON.stringify(result).length > 2_000_000) throw new Error('El resultado excede el límite de 2 MB; guárdalo en R2 y devuelve una URL.');
  return result;
}

export async function runAIJob(job: IAIGenerationJob): Promise<Record<string, unknown>> {
  const basePrompt = typeof job.input.prompt === 'string' ? job.input.prompt.trim() : '';
  const instructions = typeof job.input.outputContractInstructions === 'string' ? job.input.outputContractInstructions.trim() : '';
  const prompt = instructions ? `${basePrompt}\n\n${instructions}` : basePrompt;
  if (!prompt) throw new Error('El trabajo no contiene un prompt válido.');
  if (job.kind === 'image' && job.provider === 'google' && !process.env.AI_GENERATION_WORKER_URL) {
    if (job.modelId?.startsWith('gemini-')) {
      const startedAt = performance.now();
      const { imageUrl, result } = await generateGeminiImage(prompt, job.modelId);
      const durationMs = Math.round(performance.now() - startedAt);
      try {
        await recordObservabilityEvent({
          category: 'ai_generation',
          name: 'gemini_image_metadata',
          route: '/api/ai/jobs',
          userId: job.userId,
          productId: String(job._id).slice(0, 120),
          status: 'completed',
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
            finishReason: result.finishReason,
            hasText: result.hasText,
            hasInlineData: result.kind === 'IMAGE',
            mimeType: result.mimeType,
            base64Length: result.base64Length,
          },
        });
      } catch {
        // La observabilidad no debe romper la generación.
      }
      return { imageUrl };
    }
    return generateImage({ prompt });
  }
  return runExternalWorker(job);
}
