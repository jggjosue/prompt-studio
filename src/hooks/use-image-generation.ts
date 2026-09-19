'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import { safeJson, extractErrorMessage } from '@/lib/safe-json';
import { useCallback, useState } from 'react';

export function useImageGeneration() {
  const [imageProvider, setImageProvider] = useState<'openai' | 'fal' | 'google'>('openai');
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
  const [outputImageUrl, setOutputImageUrl] = useState('');
  const [outputImageVariations, setOutputImageVariations] = useState<Array<{ label: string; url: string }>>([]);

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const provider = (params.provider || imageProvider) as string;
    const model = params.model || resolveDefaultImageModel(provider);
    const finalPrompt = prompt + buildImageSuffix(params);

    // Build provider-specific input payload
    const input = buildImageInput(provider, model, finalPrompt, params);

    try {
      const jobRes = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          kind: 'image',
          provider,
          model,
          input,
        }),
      });

      const jobData = await safeJson(jobRes);
      if (!jobRes.ok || !jobData || jobData.error) {
        return { error: extractErrorMessage(jobData, 'Fallo al iniciar el trabajo de imagen.') };
      }

      const jobId = (jobData.job as Record<string, unknown>)?.id as string | undefined;
      if (!jobId) return { error: 'El servidor no devolvió un identificador de trabajo.' };

      // Poll for completion
      let completed = false;
      let attempts = 0;
      let imageOutputUrl = '';

      while (!completed && attempts < 25) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const pollRes = await fetch(`/api/ai/jobs/${jobId}`);
          const pollData = await safeJson(pollRes);
          if (!pollData) continue;
          if (pollData.error) return { error: extractErrorMessage(pollData, 'Error al consultar el estado del trabajo.') };

          const job = pollData.job as Record<string, unknown> | undefined;
          const status = job?.status as string | undefined;

          if (status === 'completed') {
            imageOutputUrl = extractImageUrl(job?.result);
            completed = true;
          } else if (status === 'failed') {
            return { error: (job?.lastError as string | undefined) || 'El trabajo falló en el servidor.' };
          }
        } catch (pollErr: unknown) {
          console.warn('Poll error:', pollErr);
        }
      }

      if (!imageOutputUrl) return { error: 'Tiempo de espera agotado al generar la imagen.' };

      setOutputImageUrl(imageOutputUrl);
      const creditsBalance = (jobData.credits as Record<string, unknown> | undefined)?.balance;
      if (typeof creditsBalance === 'number') setCredits(creditsBalance);
      const creditCost = (jobData.job as Record<string, unknown> | undefined)?.creditCost;
      return { result: { imageUrl: imageOutputUrl, creditsUsed: typeof creditCost === 'number' ? creditCost : 10, provider } };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Error al conectar con el servidor.' };
    }
  }, [imageProvider, credits]);

  return {
    imageProvider, setImageProvider, openAIKey, setOpenAIKey, replicateKey, setReplicateKey,
    vertexKey, setVertexKey, credits, setCredits,
    imageStyle, setImageStyle, imageRatio, setImageRatio, imageRes, setImageRes,
    imageFormat, setImageFormat, imageLighting, setImageLighting, imageCamera, setImageCamera,
    imageCFG, setImageCFG, imageSteps, setImageSteps, imageNegative, setImageNegative,
    imageLens, setImageLens, imageComposition, setImageComposition, imageRealism, setImageRealism,
    imageColors, setImageColors, imageVariationPack, setImageVariationPack,
    referenceImage, setReferenceImage, referenceInstructions, setReferenceInstructions,
    outputImageUrl, setOutputImageUrl, outputImageVariations, setOutputImageVariations,
    generate,
  };
}

// ── Per-provider default models ─────────────────────────────────────────────

function resolveDefaultImageModel(provider: string): string {
  switch (provider) {
    case 'openai': return 'dall-e-3';
    case 'fal':    return 'fal-ai/flux/schnell';
    case 'google': return 'imagen-4.0-fast-generate-001';
    default:       return 'dall-e-3';
  }
}

// ── Provider-specific input builders ────────────────────────────────────────

function aspectRatioToSize(ratio: string | undefined): string {
  // OpenAI DALL-E 3 / GPT Image size values
  switch (ratio) {
    case '16-9': return '1792x1024';
    case '9-16': return '1024x1792';
    case '4-3':  return '1024x1024'; // closest square
    case '1-1':
    default:     return '1024x1024';
  }
}

function aspectRatioToGoogleValue(ratio: string | undefined): string {
  // Imagen 4 aspectRatio values
  switch (ratio) {
    case '16-9': return '16:9';
    case '9-16': return '9:16';
    case '4-3':  return '4:3';
    case '3-4':  return '3:4';
    case '1-1':
    default:     return '1:1';
  }
}

function buildImageInput(
  provider: string,
  model: string,
  prompt: string,
  params: ChatParams
): Record<string, unknown> {
  const base = { prompt, model };

  switch (provider) {
    // ── OpenAI: DALL-E 3 / GPT Image ──────────────────────────────────────
    case 'openai':
      return {
        ...base,
        n: 1,
        size: aspectRatioToSize(params.imageRatio),
        quality: 'hd', // DALL-E 3 supports "standard" | "hd"
        style: params.imageStyle === 'photorealistic' ? 'natural' : 'vivid', // DALL-E 3: "natural" | "vivid"
        response_format: 'url',
      };

    // ── Google Imagen 4 ──────────────────────────────────────────────────
    case 'google':
      return {
        ...base,
        aspectRatio: aspectRatioToGoogleValue(params.imageRatio),
        numberOfImages: 1,
        outputMimeType: 'image/png',
        negativePrompt: params.imageNegative || 'blurry, low quality, distorted',
      };

    // ── Fal.ai / Flux ────────────────────────────────────────────────────
    case 'fal':
      return {
        ...base,
        // Flux Schnell uses image_size or width/height
        image_size: falImageSize(params.imageRatio),
        num_images: 1,
        num_inference_steps: params.imageCFG ? Math.round(params.imageCFG) : 4, // Schnell: 1-8 steps
        enable_safety_checker: true,
        output_format: 'jpeg',
      };

    default:
      return base;
  }
}

function falImageSize(ratio: string | undefined): { width: number; height: number } {
  switch (ratio) {
    case '16-9': return { width: 1280, height: 720 };
    case '9-16': return { width: 720, height: 1280 };
    case '4-3':  return { width: 1024, height: 768 };
    case '3-4':  return { width: 768, height: 1024 };
    case '1-1':
    default:     return { width: 1024, height: 1024 };
  }
}

// ── Image URL extraction (handles each provider's response shape) ─────────

function extractImageUrl(result: unknown): string {
  if (!result || typeof result !== 'object') return '';
  const r = result as Record<string, unknown>;

  // Google Imagen: { imageUri: "gs://..." } or { predictions: [{ bytesBase64Encoded, mimeType }] }
  if (typeof r.imageUri === 'string') return r.imageUri;

  // Standard URL field
  if (typeof r.url === 'string') return r.url;

  // OpenAI: { data: [{ url }] }
  const data = r.data as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(data) && data[0]?.url) return data[0].url as string;

  // Fal.ai: { images: [{ url }] }
  const images = r.images as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(images) && images[0]?.url) return images[0].url as string;

  // Google Imagen base64: { predictions: [{ bytesBase64Encoded }] }
  const predictions = r.predictions as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(predictions) && predictions[0]) {
    const p = predictions[0];
    if (typeof p.bytesBase64Encoded === 'string') {
      const mime = typeof p.mimeType === 'string' ? p.mimeType : 'image/png';
      return `data:${mime};base64,${p.bytesBase64Encoded}`;
    }
    if (typeof p.imageUri === 'string') return p.imageUri;
  }

  // Generic output array
  const output = r.output as unknown[] | undefined;
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0];

  return '';
}

// ── Image prompt suffix ──────────────────────────────────────────────────────

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
