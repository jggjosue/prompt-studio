'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import { generationProviders } from '@/lib/generation/provider-adapters';
import { useCallback, useState } from 'react';

const e2eMode = process.env.NEXT_PUBLIC_E2E_TEST_MODE === 'true';

export function useImageGeneration() {
  const [imageProvider, setImageProvider] = useState<'openai' | 'fal' | 'google'>('openai');
  const [openAIKey, setOpenAIKey] = useState('');
  const [replicateKey, setReplicateKey] = useState('');
  const [vertexKey, setVertexKey] = useState('');
  const [credits, setCredits] = useState(12.0);
  // image params
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
  // output
  const [outputImageUrl, setOutputImageUrl] = useState('');
  const [outputImageVariations, setOutputImageVariations] = useState<Array<{ label: string; url: string }>>([]);

  const getApiKey = useCallback((provider: string) => {
    if (provider === 'openai') return openAIKey;
    if (provider === 'fal') return replicateKey;
    if (provider === 'google') return vertexKey;
    return '';
  }, [openAIKey, replicateKey, vertexKey]);

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const provider = (params.provider || imageProvider) as string;
    const requestedModel = params.model || (provider === 'openai' ? 'dall-e-3' : provider === 'fal' ? 'fal-ai/flux/schnell' : 'imagen-4.0-fast-generate-001');
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
          input: {
            prompt: finalPrompt,
            model: requestedModel,
          },
        }),
      });

      const jobData = await jobRes.json();
      if (!jobRes.ok || jobData.error) {
        const errMsg = typeof jobData.error === 'object' ? jobData.error.message : (jobData.error || 'Fallo al iniciar el trabajo de imagen.');
        return { error: errMsg };
      }

      const jobId = jobData.job.id;
      let completed = false;
      let attempts = 0;
      let imageOutputUrl = '';

      while (!completed && attempts < 25) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const pollRes = await fetch(`/api/ai/jobs/${jobId}`);
          const pollData = await pollRes.json();
          if (pollData.error) return { error: pollData.error };

          const status = pollData.job?.status;
          if (status === 'completed') {
            const result = pollData.job.result;
            imageOutputUrl = result?.imageUri || result?.url || result?.output?.[0] || result?.data?.[0]?.url || result?.images?.[0]?.url || '';
            completed = true;
          } else if (status === 'failed') {
            return { error: pollData.job?.lastError || 'El trabajo falló en el servidor.' };
          }
        } catch (pollErr: any) {
          console.warn('Poll error:', pollErr);
        }
      }

      if (!imageOutputUrl) return { error: 'Tiempo de espera agotado al generar la imagen.' };

      setOutputImageUrl(imageOutputUrl);
      if (jobData.credits?.balance !== undefined) {
        setCredits(jobData.credits.balance);
      }
      return { result: { imageUrl: imageOutputUrl, creditsUsed: jobData.job?.creditCost || 1, provider } };
    } catch (err: any) {
      return { error: err.message || 'Error al conectar con el servidor.' };
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
