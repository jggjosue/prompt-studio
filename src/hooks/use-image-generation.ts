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
    const requestedModel = params.model || (
      provider === 'openai' ? 'dall-e-3' :
      provider === 'fal' ? 'fal-ai/flux/schnell' :
      'imagen-4.0-fast-generate-001'
    );
    const finalPrompt = prompt + buildImageSuffix(params);

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
          model: requestedModel,
          input: { prompt: finalPrompt, model: requestedModel },
        }),
      });

      const jobData = await safeJson(jobRes);
      if (!jobRes.ok || !jobData || jobData.error) {
        return { error: extractErrorMessage(jobData, 'Fallo al iniciar el trabajo de imagen.') };
      }

      const jobId = (jobData.job as Record<string, unknown>)?.id as string | undefined;
      if (!jobId) return { error: 'El servidor no devolvió un identificador de trabajo.' };

      let completed = false;
      let attempts = 0;
      let imageOutputUrl = '';

      while (!completed && attempts < 25) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const pollRes = await fetch(`/api/ai/jobs/${jobId}`);
          const pollData = await safeJson(pollRes);
          if (!pollData) continue; // empty body, keep polling
          if (pollData.error) return { error: extractErrorMessage(pollData, 'Error al consultar el estado del trabajo.') };

          const job = pollData.job as Record<string, unknown> | undefined;
          const status = job?.status as string | undefined;
          if (status === 'completed') {
            const result = job?.result as Record<string, unknown> | undefined;
            imageOutputUrl = (
              result?.imageUri ||
              result?.url ||
              (result?.output as string[] | undefined)?.[0] ||
              (result?.data as Array<{ url: string }> | undefined)?.[0]?.url ||
              (result?.images as Array<{ url: string }> | undefined)?.[0]?.url ||
              ''
            ) as string;
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
      return { result: { imageUrl: imageOutputUrl, creditsUsed: typeof creditCost === 'number' ? creditCost : 1, provider } };
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
