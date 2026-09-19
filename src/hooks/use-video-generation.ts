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
    const requestedModel = params.model || (provider === 'runway' ? 'gen-3' : 'veo-2.0-generate-001');
    const finalPrompt = prompt + buildVideoSuffix(params);

    try {
      const jobRes = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          kind: 'video',
          provider,
          model: requestedModel,
          input: {
            prompt: finalPrompt,
            model: requestedModel,
            videoDurationSeconds: parseInt(String(params.videoDuration || videoDuration)) || 4,
          },
        }),
      });

      const jobData = await jobRes.json();
      if (!jobRes.ok || jobData.error) {
        const errMsg = typeof jobData.error === 'object' ? jobData.error.message : (jobData.error || 'Fallo al iniciar el trabajo de video.');
        return { error: errMsg };
      }

      const jobId = jobData.job.id;
      let completed = false;
      let attempts = 0;
      let videoOutputUrl = '';

      while (!completed && attempts < 40) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          const pollRes = await fetch(`/api/ai/jobs/${jobId}`);
          const pollData = await pollRes.json();
          if (pollData.error) return { error: pollData.error };

          const status = pollData.job?.status;
          if (status === 'completed') {
            const result = pollData.job.result;
            videoOutputUrl = result?.videoUri || result?.output?.[0] || result?.videoUrl || '';
            if (videoOutputUrl && !videoOutputUrl.startsWith('http') && !videoOutputUrl.startsWith('data:')) {
              videoOutputUrl = `data:video/mp4;base64,${videoOutputUrl}`;
            }
            completed = true;
          } else if (status === 'failed') {
            return { error: pollData.job?.lastError || 'El trabajo falló en el servidor.' };
          }
        } catch (pollErr: any) {
          console.warn('Poll error:', pollErr);
        }
      }

      if (!videoOutputUrl) return { error: 'Tiempo de espera agotado al generar el video.' };

      setOutputVideoUrl(videoOutputUrl);
      if (jobData.credits?.balance !== undefined) {
        setCredits(jobData.credits.balance);
      }
      return { result: { videoUrl: videoOutputUrl, creditsUsed: jobData.job?.creditCost || 3, provider } };
    } catch (err: any) {
      return { error: err.message || 'Error al conectar con el servidor.' };
    }
  }, [videoProvider, credits, videoDuration]);

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
