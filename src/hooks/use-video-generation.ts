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
    const model = params.model || resolveDefaultVideoModel(provider);
    const finalPrompt = prompt + buildVideoSuffix(params);
    const durationSeconds = parseInt(String(params.videoDuration || videoDuration)) || 4;

    const input = buildVideoInput(provider, model, finalPrompt, params, durationSeconds);

    try {
      const jobRes = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({ kind: 'video', provider, model, input }),
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
            videoOutputUrl = extractVideoUrl(job?.result);
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
      return { result: { videoUrl: videoOutputUrl, creditsUsed: typeof creditCost === 'number' ? creditCost : 20, provider } };
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

// ── Default models ─────────────────────────────────────────────────────────

function resolveDefaultVideoModel(provider: string): string {
  switch (provider) {
    case 'runway': return 'gen-3';
    case 'google':
    case 'veo':    return 'veo-2.0-generate-001';
    default:       return 'gen-3';
  }
}

// ── Aspect ratio helpers ───────────────────────────────────────────────────

function videoAspectToRunway(ratio: string | undefined): string {
  // Runway API values: "1280:768" | "768:1280" | "1104:832" | "832:1104" etc.
  switch (ratio) {
    case '16-9':  return '1280:768';
    case '9-16':  return '768:1280';
    case '21-9':  return '1584:672';
    case '1-1':   return '960:960';
    default:      return '1280:768';
  }
}

function videoAspectToGoogle(ratio: string | undefined): string {
  // Veo 2 aspectRatio values
  switch (ratio) {
    case '16-9':  return '16:9';
    case '9-16':  return '9:16';
    case '21-9':  return '21:9';
    case '1-1':   return '1:1';
    default:      return '16:9';
  }
}

// ── Provider-specific input builders ──────────────────────────────────────

function buildVideoInput(
  provider: string,
  model: string,
  prompt: string,
  params: ChatParams,
  durationSeconds: number
): Record<string, unknown> {
  const base = { prompt, model };

  switch (provider) {
    // ── Runway Gen-3 ───────────────────────────────────────────────────
    // API: https://docs.runwayml.com/reference/post_v1-tasks
    case 'runway':
      return {
        ...base,
        taskType: 'text_to_video',
        duration: durationSeconds <= 5 ? 5 : 10, // Runway supports 5 or 10 seconds
        ratio: videoAspectToRunway(params.videoAspect),
        // Optional: watermark, seed
      };

    // ── Google Veo 2 (Vertex AI) ────────────────────────────────────────
    // API: Vertex AI predictLongRunning
    case 'google':
    case 'veo':
      return {
        ...base,
        videoDurationSeconds: durationSeconds,
        aspectRatio: videoAspectToGoogle(params.videoAspect),
        // Veo 2 supports sampleCount (1-4)
        sampleCount: 1,
      };

    default:
      return { ...base, videoDurationSeconds: durationSeconds };
  }
}

// ── Video URL extraction ───────────────────────────────────────────────────

function extractVideoUrl(result: unknown): string {
  if (!result || typeof result !== 'object') return '';
  const r = result as Record<string, unknown>;

  // Google Veo: { videoUri: "gs://..." } or { bytesBase64Encoded: "..." }
  if (typeof r.videoUri === 'string') return r.videoUri;
  if (typeof r.gcsUri === 'string') return r.gcsUri;
  if (typeof r.bytesBase64Encoded === 'string') {
    return `data:video/mp4;base64,${r.bytesBase64Encoded}`;
  }
  if (typeof r.videoBytes === 'string') {
    return `data:video/mp4;base64,${r.videoBytes}`;
  }

  // Runway: { output: ["https://..."] }
  const output = r.output as unknown[] | undefined;
  if (Array.isArray(output) && typeof output[0] === 'string') return output[0];

  // Standard URL field
  if (typeof r.url === 'string') return r.url;
  if (typeof r.videoUrl === 'string') return r.videoUrl;

  // Generic array
  const outputUrl = r.outputUrl;
  if (typeof outputUrl === 'string') return outputUrl;

  // Nested predictions (Vertex AI format)
  const predictions = r.predictions as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(predictions) && predictions[0]) {
    const p = predictions[0];
    if (typeof p.videoUri === 'string') return p.videoUri;
    if (typeof p.bytesBase64Encoded === 'string') return `data:video/mp4;base64,${p.bytesBase64Encoded}`;
  }

  return '';
}

// ── Video prompt suffix ────────────────────────────────────────────────────

function buildVideoSuffix(params: ChatParams): string {
  let s = '';
  if (params.videoMotion) s += `, ${params.videoMotion} motion intensity`;
  if (params.videoCamera && params.videoCamera !== 'none') s += `, ${params.videoCamera} camera movement`;
  if (params.videoAspect) s += `, ${params.videoAspect.replace('-', ':')} aspect ratio`;
  if (params.videoStyle) s += `, ${params.videoStyle} visual style`;
  return s;
}
