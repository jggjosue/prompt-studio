'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import { generationProviders } from '@/lib/generation/provider-adapters';
import { useCallback, useState } from 'react';


export function useVideoGeneration() {
  const [videoProvider, setVideoProvider] = useState<'runway' | 'veo' | 'anthropic' | 'fal' | 'google'>('runway');
  const [runwayKey, setRunwayKey] = useState('');
  const [veoKey, setVeoKey] = useState('');
  const [credits, setCredits] = useState(12.0);
  const [videoMotion, setVideoMotion] = useState('medium');
  const [videoCamera, setVideoCamera] = useState('none');
  const [videoDuration, setVideoDuration] = useState('8');
  const [videoFPS, setVideoFPS] = useState(30);
  const [videoInterpolation, setVideoInterpolation] = useState(true);
  const [videoStyle, setVideoStyle] = useState('photorealistic');
  const [videoAspect, setVideoAspect] = useState('16-9');
  const [outputVideoUrl, setOutputVideoUrl] = useState('');

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const provider = (params.provider || videoProvider) as string;
    const creditCost = 3.0;
    if (credits < creditCost) return { error: `Sin créditos. Requiere ${creditCost}.` };

    const finalPrompt = prompt + buildVideoSuffix(params);
        let videoOutputUrl = '';
    let apiError = '';

    try {
      if (provider === 'runway') {
                const data = await generationProviders.runway.start(runwayKey, finalPrompt, parseInt(String(params.videoDuration || videoDuration)) || 4);
        if (data && 'error' in data && data.error) { apiError = data.error; }
        else {
          const taskId = data.id;
          let completed = false; let attempts = 0;
          while (!completed && attempts < 10) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 3000));
            try {
              const pollData = await generationProviders.runway.poll(runwayKey, taskId);
              if (pollData && 'error' in pollData && pollData.error) throw new Error(pollData.error);
              else if (pollData.status === 'SUCCEEDED') { videoOutputUrl = pollData.output?.[0] || ''; completed = true; }
              else if (pollData.status === 'FAILED') throw new Error(pollData.error || 'Runway task failed');
            } catch (pollErr: any) { console.warn('Runway poll error:', pollErr); }
          }
          if (!videoOutputUrl) throw new Error('Timeout waiting for video generation.');
        }
      } else if (provider === 'veo') {
                const data = await generationProviders.google.video(veoKey, finalPrompt, parseInt(String(params.videoDuration || videoDuration)) || 4, params.model || 'veo-2.0-generate-001');
        if (data && 'error' in data && data.error) { apiError = data.error; }
        else { videoOutputUrl = data.videoUri || ''; }
      }
    } catch (err: any) { apiError = err.message || 'Error contacting provider'; }

    if (apiError || !videoOutputUrl) return { error: apiError || 'Generación de video fallida.' };
    setOutputVideoUrl(videoOutputUrl);
    setCredits(prev => Math.max(0, prev - creditCost));
    return { result: { videoUrl: videoOutputUrl, creditsUsed: creditCost, provider } };
  }, [videoProvider, credits, runwayKey, veoKey]);

  return {
    videoProvider, setVideoProvider, runwayKey, setRunwayKey, veoKey, setVeoKey, credits, setCredits,
    videoMotion, setVideoMotion, videoCamera, setVideoCamera, videoDuration, setVideoDuration,
    videoFPS, setVideoFPS, videoInterpolation, setVideoInterpolation, videoStyle, setVideoStyle,
    videoAspect, setVideoAspect, outputVideoUrl, setOutputVideoUrl, generate,
  };
}

function buildVideoSuffix(params: ChatParams): string {
  let s = '';
  if (params.videoMotion) s += `, ${params.videoMotion} motion`;
  if (params.videoCamera && params.videoCamera !== 'none') s += `, ${params.videoCamera} camera`;
  if (params.videoAspect) s += `, ${params.videoAspect.replace('-', ':')} aspect ratio`;
  if (params.videoStyle) s += `, ${params.videoStyle} style`;
  return s;
}
