'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import { safeJson, extractErrorMessage } from '@/lib/safe-json';
import { useCallback, useState } from 'react';

export type GenerationStatus = 'queued' | 'generating' | 'uploading' | 'completed' | 'failed';

export interface GenerationEntry {
  jobId: string;
  status: GenerationStatus;
  imageUrl?: string;
  error?: string;
  progressMessage?: string;
  creditsUsed?: number;
  provider: string;
  modelId?: string;
}

export async function runGeneration(
  updateGeneration: (jobId: string, patch: Partial<GenerationEntry>) => void,
  jobId: string,
  prompt: string,
  params: ChatParams,
): Promise<{ result?: ChatMessageResult; error?: string }> {
  const cleanParams = { ...params };
  for (const key of ['referenceImage', 'reference_image', 'imageBase64', 'base64Image', 'image', 'media', 'attachment']) {
    delete (cleanParams as Record<string, unknown>)[key];
  }
  const provider = 'google';
  const model = GOOGLE_IMAGE_MODELS.has(cleanParams.model ?? '') ? cleanParams.model! : resolveDefaultImageModel(provider);
  const finalPrompt = prompt + buildImageSuffix(cleanParams);
  const input = buildImageInput(provider, model, finalPrompt, cleanParams);
  updateGeneration(jobId, { status: 'generating', progressMessage: 'Enviando al proveedor…' });
  try {
    const idempotencyKey = crypto.randomUUID();
    const jobRes = await fetch('/api/ai/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify({ kind: 'image', provider, model, input }),
    });
    const jobData = await safeJson(jobRes);
    if (!jobRes.ok || !jobData || jobData.error) {
      const msg = extractErrorMessage(jobData, `Error ${jobRes.status}: Fallo al iniciar el trabajo de imagen.`);
      updateGeneration(jobId, { status: 'failed', error: msg });
      return { error: msg };
    }
    const jobIdFromRes = (jobData.job as Record<string, unknown>)?.id as string | undefined;
    if (!jobIdFromRes) { updateGeneration(jobId, { status: 'failed', error: 'El servidor no devolvió un identificador de trabajo.' }); return { error: 'El servidor no devolvió un identificador de trabajo.' }; }
    void fetch('/api/ai/jobs/process', { method: 'POST', headers: { 'Content-Type': 'application/json' } });
    updateGeneration(jobId, { status: 'generating', progressMessage: 'Generando…' });
    let imageOutputUrl = '';
    let lastProgress = '';
    for (let attempts = 0; attempts < 90; attempts++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const pollRes = await fetch(`/api/ai/jobs/${jobIdFromRes}`);
        const pollData = await safeJson(pollRes);
        if (!pollData) continue;
        if (pollData.error) { const msg = extractErrorMessage(pollData, 'Error al consultar el estado del trabajo.'); updateGeneration(jobId, { status: 'failed', error: msg }); return { error: msg }; }
        const job = pollData.job as Record<string, unknown> | undefined;
        const status = job?.status as string | undefined;
        if (status === 'completed') { imageOutputUrl = extractImageUrl(job?.result); updateGeneration(jobId, { status: 'uploading' }); break; }
        if (status === 'failed') { const msg = (job?.lastError as string | undefined) || 'El trabajo falló en el servidor.'; updateGeneration(jobId, { status: 'failed', error: msg }); return { error: msg }; }
        if (typeof job?.progressMessage === 'string' && job.progressMessage) lastProgress = job.progressMessage;
      } catch (pollErr: unknown) { console.warn('Poll error:', pollErr); }
    }
    if (!imageOutputUrl) { const msg = lastProgress ? `Generación en curso: ${lastProgress}. Inténtalo de nuevo en un momento.` : 'Tiempo de espera agotado al generar la imagen. Vuelve a intentarlo.'; updateGeneration(jobId, { status: 'failed', error: msg }); return { error: msg }; }
    updateGeneration(jobId, { status: 'completed', imageUrl: imageOutputUrl });
    const creditCost = (jobData.job as Record<string, unknown> | undefined)?.creditCost;
    return { result: { imageUrl: imageOutputUrl, creditsUsed: typeof creditCost === 'number' ? creditCost : 10, provider } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al conectar con el servidor.';
    updateGeneration(jobId, { status: 'failed', error: msg });
    return { error: msg };
  }
}

export function useImageGeneration() {
  const [imageProvider, setImageProvider] = useState<'openai' | 'fal' | 'google'>('google');
  const [openAIKey, setOpenAIKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [vertexKey, setVertexKey] = useState('');
  const [credits, setCredits] = useState(12.0);
  const [imageStyle, setImageStyle] = useState('cinematic');
  const [imageRatio, setImageRatio] = useState('1-1');
  const [imageRes, setImageRes] = useState('1k');
  const [imageFormat, setImageFormat] = useState('png');
  const [imageLighting, setImageLighting] = useState('volumetric');
  const [imageCamera, setImageCamera] = useState('eye-level');
  const [imageCFG, setImageCFG] = useState(7.5);
  const [imageSteps, setImageSteps] = useState(30);
  const [imageNegative, setImageNegative] = useState('blurry, low quality, distorted');
  const [imageLens, setImageLens] = useState('50mm');
  const [imageComposition, setImageComposition] = useState('rule-of-thirds');
  const [imageRealism, setImageRealism] = useState(80);
  const [imageColors, setImageColors] = useState('natural');
  const [imageVariationPack, setImageVariationPack] = useState(false);
  const [referenceImage, setReferenceImage] = useState('');
  const [referenceInstructions, setReferenceInstructions] = useState('');
  const [outputImageVariations, setOutputImageVariations] = useState<Array<{ label: string; url: string }>>([]);
  const [generations, setGenerations] = useState<Map<string, GenerationEntry>>(new Map());

  const updateGeneration = useCallback((jobId: string, patch: Partial<GenerationEntry>) => {
    setGenerations(prev => {
      const next = new Map(prev);
      const entry = next.get(jobId);
      if (!entry) return next;
      next.set(jobId, { ...entry, ...patch });
      return next;
    });
  }, []);

  const addGeneration = useCallback((jobId: string, modelId?: string) => {
    setGenerations(prev => {
      const next = new Map(prev);
      next.set(jobId, { jobId, status: 'queued', provider: 'google', modelId });
      return next;
    });
  }, []);

  const removeGeneration = useCallback((jobId: string) => {
    setGenerations(prev => {
      const next = new Map(prev);
      next.delete(jobId);
      return next;
    });
  }, []);

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const jobId = crypto.randomUUID();
    addGeneration(jobId);
    return runGeneration(updateGeneration, jobId, prompt, params);
  }, [addGeneration, updateGeneration]);

  const retryGeneration = useCallback((jobId: string, prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    updateGeneration(jobId, { status: 'queued', error: undefined, imageUrl: undefined });
    return runGeneration(updateGeneration, jobId, prompt, params);
  }, [updateGeneration]);

  return {
    imageProvider, setImageProvider, openAIKey, setOpenAIKey, replicateKey, setReplicateKey,
    vertexKey, setVertexKey, credits, setCredits,
    imageStyle, setImageStyle, imageRatio, setImageRatio, imageRes, setImageRes,
    imageFormat, setImageFormat, imageLighting, setImageLighting, imageCamera, setImageCamera,
    imageCFG, setImageCFG, imageSteps, setImageSteps, imageNegative, setImageNegative,
    imageLens, setImageLens, imageComposition, setImageComposition, imageRealism, setImageRealism,
    imageColors, setImageColors, imageVariationPack, setImageVariationPack,
    referenceImage, setReferenceImage, referenceInstructions, setReferenceInstructions,
    outputImageVariations, setOutputImageVariations,
    generations, generate, retryGeneration, removeGeneration, updateGeneration,
  };
}

function buildImageSuffix(params: ChatParams): string {
  let s = '';
  if (params.imageStyle) s += `, ${params.imageStyle} style`;
  if (params.imageLighting) s += `, ${params.imageLighting} lighting`;
  if (params.imageCamera) s += `, ${params.imageCamera} shot`;
  if (params.imageLens) s += `, ${params.imageLens} lens`;
  if (params.imageComposition) s += `, ${params.imageComposition} composition`;
  s += `, ${params.imageRealism ?? 80}% realism, ${params.imageColors ?? 'natural'} color palette`;
  if (params.imageRatio) s += `, ${params.imageRatio.replace('-', ':')} aspect ratio`;
  if (params.imageNegative) s += `. Avoid: ${params.imageNegative}`;
  if (params.referenceInstructions) s += `. Reference instructions: ${params.referenceInstructions}`;
  return s;
}

export const GOOGLE_IMAGE_MODELS = new Set(['nano-banana-2-lite', 'nano-banana-2', 'nano-banana-pro', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro']);

function resolveDefaultImageModel(provider: string): string {
  switch (provider) {
    case 'google': return 'nano-banana-2';
    default:       return 'nano-banana-2';
  }
}

function buildImageInput(provider: string, model: string, prompt: string, params: ChatParams): Record<string, unknown> {
  const base = { prompt, model };
  const cleanedParams = { ...params };
  for (const key of ['referenceImage', 'reference_image', 'imageBase64', 'base64Image', 'image', 'media', 'attachment']) {
    delete (cleanedParams as Record<string, unknown>)[key];
  }
  if (provider === 'google') {
    if (model.startsWith('gemini-')) {
      return { ...base, generationConfig: { imageGenerationConfig: { numberOfImages: 1 } } };
    }
    return { ...base, aspectRatio: aspectRatioToGoogleValue(params.imageRatio), numberOfImages: 1, outputMimeType: 'image/png', negativePrompt: params.imageNegative || 'blurry, low quality, distorted' };
  }
  return base;
}

function extractImageUrl(result: unknown): string {
  if (!result || typeof result !== 'object') return '';
  const r = result as Record<string, unknown>;
  if (typeof r.imageUri === 'string') return r.imageUri;
  if (typeof r.imageUrl === 'string') return r.imageUrl;
  if (typeof r.url === 'string') return r.url;
  const data = r.data as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(data) && data[0]?.url) return data[0].url as string;
  const images = r.images as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(images) && images[0]?.url) return images[0].url as string;
  const predictions = r.predictions as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(predictions) && predictions[0]) {
    const p = predictions[0];
    if (typeof p.bytesBase64Encoded === 'string') { const mime = typeof p.mimeType === 'string' ? p.mimeType : 'image/png'; return `data:${mime};base64,${p.bytesBase64Encoded}`; }
    if (typeof p.imageUri === 'string') return p.imageUri;
  }
  if (typeof r.bytesBase64Encoded === 'string') { const mime = typeof r.mimeType === 'string' ? r.mimeType : 'image/png'; return `data:${mime};base64,${r.bytesBase64Encoded}`; }
  const output = r.output as unknown[] | undefined;
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0];
  return '';
}

function aspectRatioToGoogleValue(ratio: string | undefined): string {
  switch (ratio) {
    case '16-9': return '16:9';
    case '9-16': return '9:16';
    case '4-3':  return '4:3';
    case '3-4':  return '3:4';
    case '1-1':
    default:     return '1:1';
  }
}
