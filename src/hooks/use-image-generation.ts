'use client';

import { useCallback, useState } from 'react';
import { generationProviders } from '@/lib/generation/provider-adapters';
import type { ChatParams, ChatMessageResult } from '@/lib/chat-types';

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
    const provider = (params.provider || imageProvider) as 'openai' | 'fal' | 'google';
    const key = getApiKey(provider);
    if (!key) return { error: `API key requerida para ${provider}.` };
    const creditCost = imageVariationPack ? 8.0 : 1.0;
    if (credits < creditCost) return { error: `Sin créditos. Requiere ${creditCost}.` };

    const openAISize = imageRatio === '9-16' ? '1024x1536' : imageRatio === '16-9' ? '1536x1024' : '1024x1024';
        let imageOutputUrl = '';
    let apiError = '';

    try {
      if (provider === 'openai' && key) {
                const data = referenceImage
          ? await generationProviders.openai.editImage(key, prompt + buildImageSuffix(params), referenceImage, params.model || 'gpt-image-1-mini', openAISize)
          : await generationProviders.openai.image(key, prompt + buildImageSuffix(params), params.model || 'dall-e-3', openAISize);
        if (e2eMode && prompt.includes('[fail-once]')) return { error: 'Temporary provider failure' };
        if (data && 'error' in data && data.error) { apiError = data.error; }
        else { imageOutputUrl = data.data?.[0]?.url || (data.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : ''); }
      } else if (provider === 'fal' && key) {
                const response = await fetch(`https://fal.run/${params.model || 'fal-ai/flux/schnell'}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': key.startsWith('Key ') ? key : `Key ${key}` },
          body: JSON.stringify({ prompt: prompt + buildImageSuffix(params), image_size: 'square_hd', sync_mode: true })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        imageOutputUrl = data.images?.[0]?.url || '';
      } else if (provider === 'google' && key) {
                const data = await generationProviders.google.generate(key, prompt + buildImageSuffix(params), params.model || 'gemini-2.5-flash');
        if (data && 'error' in data && data.error) { apiError = data.error; }
        else { const text = data.candidates?.[0]?.content?.parts?.[0]?.text; if (text) imageOutputUrl = `data:text/gemini,${encodeURIComponent(text)}`; else apiError = 'No content'; }
      }
    } catch (err: any) { apiError = err.message || 'Error contacting provider'; }

    if (apiError || !imageOutputUrl) return { error: apiError || 'Generación de imagen fallida.' };
    setOutputImageUrl(imageOutputUrl);
    setCredits(prev => Math.max(0, prev - creditCost));
    return { result: { imageUrl: imageOutputUrl, creditsUsed: creditCost, provider } };
  }, [imageProvider, credits, referenceImage, getApiKey]);

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
