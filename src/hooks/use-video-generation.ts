'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import { safeJson, extractErrorMessage } from '@/lib/safe-json';
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

      const jobData = await safeJson(jobRes);
      if (!jobRes.ok || !jobData || jobData.error) {
        return { error: extractErrorMessage(jobData, 'Fallo al iniciar el trabajo de video.') };
      }

      const jobId = (jobData.job as Record<string, unknown>)?.id as string | undefined;
      if (!jobId) return { error: 'El servidor no devolvió un identificador de trabajo.' };

      let completed = false;
      let attempts = 0;
      let videoOutputUrl = '';

      while (!completed && attempts < 40) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
        try {
          const pollRes = await fetch(`/api/ai/jobs/${jobId}`);
          const pollData = await safeJson(pollRes);
          if (!pollData) continue;
          if (pollData.error) return { error: extractErrorMessage(pollData, 'Error al consultar el estado del trabajo.') };

          const job = pollData.job as Record<string, unknown> | undefined;
          const status = job?.status as string | undefined;
          if (status === 'completed') {
            const result = job?.result as Record<string, unknown> | undefined;
            videoOutputUrl = (
              result?.videoUri ||
              (result?.output as string[] | undefined)?.[0] ||
              result?.videoUrl ||
              ''
            ) as string;
            if (videoOutputUrl && !videoOutputUrl.startsWith('http') && !videoOutputUrl.startsWith('data:')) {
              videoOutputUrl = `data:video/mp4;base64,${videoOutputUrl}`;
            }
            completed = true;
          } else if (status === 'failed') {
            return { error: (job?.lastError as string | undefined) || 'El trabajo falló en el servidor.' };
          }
        } catch (pollErr: unknown) {
          console.warn('Poll error:', pollErr);
        }
      }

      if (!videoOutputUrl) return { error: 'Tiempo de espera agotado al generar el video.' };

      setOutputVideoUrl(videoOutputUrl);
      const creditsBalance = (jobData.credits as Record<string, unknown> | undefined)?.balance;
      if (typeof creditsBalance === 'number') setCredits(creditsBalance);
      const creditCost = (jobData.job as Record<string, unknown> | undefined)?.creditCost;
      return { result: { videoUrl: videoOutputUrl, creditsUsed: typeof creditCost === 'number' ? creditCost : 3, provider } };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Error al conectar con el servidor.' };
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
