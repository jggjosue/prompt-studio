import 'server-only';
import { generateImage } from '@/ai/flows/generate-image';
import { getAIModelConfig } from '@/lib/ai-credit-config';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';

import { stripReferenceMedia } from '@/lib/reference-media-strip';

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
    return generateImage({ prompt });
  }
  return runExternalWorker(job);
}
