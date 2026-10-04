import 'server-only';

import { GenerateVideosOperation, GoogleGenAI } from '@google/genai';
import { assertPaidGenerationReserved } from '@/lib/generation-credit-boundary';
import type { LongRunningOperationAdapter } from '@/lib/generation-worker-core';
import { putR2Object } from '@/lib/r2-storage';
import type { IAIGenerationJob } from '@/models/AIGenerationJob';

/**
 * Long-running video adapters for the cloud worker runtime (#833).
 *
 * Only providers with a real submit/poll API get an adapter. Everything else
 * keeps using the existing synchronous `runAIJob` path. Adapters never log or
 * return prompts, keys or media bytes; the finished video goes to R2 and only
 * its key/URL is stored on the job.
 */

const VEO_DEFAULT_MODEL = 'veo-2.0-generate-001';

function geminiKey(env: NodeJS.ProcessEnv = process.env) {
  return env.GEMINI_API_KEY?.trim() || env.GOOGLE_API_KEY?.trim() || '';
}

function videoPrompt(job: IAIGenerationJob) {
  const prompt = typeof job.input.prompt === 'string' ? job.input.prompt.trim() : '';
  if (!prompt) throw Object.assign(new Error('El trabajo no contiene un prompt válido.'), { code: 'VALIDATION_EMPTY_PROMPT' });
  return prompt;
}

export function generatedVideoKey(userId: string, jobId: string) {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  return `generated/videos/${safeUser}/${jobId}.mp4`;
}

async function videoBytes(video: { uri?: string; videoBytes?: string }, apiKey: string): Promise<Buffer> {
  if (video.videoBytes) return Buffer.from(video.videoBytes, 'base64');
  if (!video.uri) throw Object.assign(new Error('El proveedor terminó sin devolver el video.'), { code: 'PROVIDER_NO_VIDEO' });
  const response = await fetch(video.uri, { headers: { 'x-goog-api-key': apiKey }, signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw Object.assign(new Error(`Descarga del video falló (${response.status}).`), { status: response.status });
  return Buffer.from(await response.arrayBuffer());
}

export function createVeoVideoAdapter(env: NodeJS.ProcessEnv = process.env): LongRunningOperationAdapter {
  const client = () => {
    const apiKey = geminiKey(env);
    if (!apiKey) throw Object.assign(new Error('GEMINI_API_KEY no está configurada para el worker.'), { code: 'CREDENTIAL_MISSING' });
    return { ai: new GoogleGenAI({ apiKey }), apiKey };
  };
  return {
    name: 'google-veo',
    // The Gemini API has no idempotency key for generateVideos: an ambiguous
    // submit must not be repeated (see VIDEO_SUBMISSION_AMBIGUOUS).
    idempotentSubmit: false,
    async submit(job) {
      assertPaidGenerationReserved(job);
      const { ai } = client();
      const duration = typeof job.input.durationSeconds === 'number' ? Math.min(8, Math.max(5, Math.round(job.input.durationSeconds))) : undefined;
      const operation = await ai.models.generateVideos({
        model: job.modelId || VEO_DEFAULT_MODEL,
        prompt: videoPrompt(job),
        config: { numberOfVideos: 1, ...(duration ? { durationSeconds: duration } : {}) },
      });
      if (!operation.name) throw Object.assign(new Error('El proveedor no devolvió un identificador de operación.'), { code: 'PROVIDER_NO_OPERATION' });
      return { providerRequestId: operation.name };
    },
    async poll(job, providerRequestId) {
      const { ai, apiKey } = client();
      const handle = new GenerateVideosOperation();
      handle.name = providerRequestId;
      const operation = await ai.operations.getVideosOperation({ operation: handle });
      if (!operation.done) return { state: 'pending' };
      if (operation.error) {
        const status = Number((operation.error as { code?: unknown }).code);
        return { state: 'failed', error: Object.assign(new Error('El proveedor rechazó la generación de video.'), Number.isInteger(status) ? { status: status >= 100 ? status : 400 } : { code: 'PROVIDER_VIDEO_FAILED' }) };
      }
      const video = operation.response?.generatedVideos?.[0]?.video;
      if (!video) return { state: 'failed', error: Object.assign(new Error('El proveedor terminó sin video (posible filtro de contenido).'), { status: 400 }) };
      const key = generatedVideoKey(job.userId, String(job._id));
      const url = await putR2Object(key, await videoBytes(video, apiKey), video.mimeType || 'video/mp4');
      if (!url) throw Object.assign(new Error('R2 no está configurado para guardar el video.'), { code: 'R2_NOT_CONFIGURED' });
      return { state: 'succeeded', result: { videoUrl: url, assetKey: key, mimeType: video.mimeType || 'video/mp4' } };
    },
  };
}

/** Which video jobs use a long-running adapter on cloud backends. */
export function videoOperationAdapterFor(job: IAIGenerationJob, env: NodeJS.ProcessEnv = process.env): LongRunningOperationAdapter | null {
  if (job.kind !== 'video') return null;
  if (job.provider === 'veo' || job.provider === 'google') return createVeoVideoAdapter(env);
  return null;
}
