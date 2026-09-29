'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import {
  LONG_GENERATION_POLL_SCHEDULE,
  isTerminalGenerationStatus,
  nextGenerationPollDelayMs,
  terminalGenerationMessage,
  waitForGenerationPollWindow,
} from '@/lib/generation-polling';
import { safeJson, extractErrorMessage } from '@/lib/safe-json';
import { useCallback, useState } from 'react';

export type VideoInputMethod = 'url' | 'youtube' | 'inline';
export type VideoProcessingMode = 'agentic' | 'static';

export function useVideoUnderstanding() {
  const [videoUrl, setVideoUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoBase64, setVideoBase64] = useState('');
  const [videoMimeType, setVideoMimeType] = useState('video/mp4');
  const [inputMethod, setInputMethod] = useState<VideoInputMethod>('url');
  const [processingMode, setProcessingMode] = useState<VideoProcessingMode>('agentic');
  const [startOffset, setStartOffset] = useState<number | undefined>(undefined);
  const [endOffset, setEndOffset] = useState<number | undefined>(undefined);
  const [fps, setFps] = useState<number | undefined>(undefined);
  const [credits, setCredits] = useState(12.0);
  const [outputText, setOutputText] = useState('');

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const currentProvider = (params.provider || 'google') as string;
    const model = params.model || 'gemini-3.8-flash';

    // Resolve video source from params or local state
    const resolvedInputMethod = (params.videoInputMethod as VideoInputMethod | undefined) || inputMethod;
    const resolvedProcessingMode = (params.videoProcessingMode as VideoProcessingMode | undefined) || processingMode;

    let resolvedVideoUrl: string | undefined;
    let resolvedBase64: string | undefined;
    let resolvedMimeType = videoMimeType;

    if (resolvedInputMethod === 'youtube') {
      resolvedVideoUrl = params.youtubeUrl as string || youtubeUrl;
      if (!resolvedVideoUrl) return { error: 'Por favor ingresa una URL de YouTube.' };
    } else if (resolvedInputMethod === 'inline') {
      resolvedBase64 = params.videoBase64 as string || videoBase64;
      resolvedMimeType = (params.videoMimeType as string) || videoMimeType;
      if (!resolvedBase64) return { error: 'Por favor sube un archivo de video.' };
    } else {
      resolvedVideoUrl = params.videoUrl as string || videoUrl;
      if (!resolvedVideoUrl) return { error: 'Por favor ingresa una URL de video.' };
    }

    const input = {
      prompt,
      model,
      videoUrl: resolvedVideoUrl,
      videoBase64: resolvedBase64,
      videoMimeType: resolvedBase64 ? resolvedMimeType : undefined,
      processingMode: resolvedProcessingMode,
      startOffset: params.startOffset as number | undefined || startOffset,
      endOffset: params.endOffset as number | undefined || endOffset,
      fps: params.fps as number | undefined || fps,
    };

    try {
      const jobRes = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          kind: 'videoUnderstanding',
          provider: currentProvider,
          model,
          input,
        }),
      });

      const jobData = await safeJson(jobRes);
      if (!jobRes.ok || !jobData || jobData.error) {
        return { error: extractErrorMessage(jobData, 'Fallo al iniciar el análisis de video.') };
      }

      const jobId = (jobData.job as Record<string, unknown>)?.id as string | undefined;
      if (!jobId) return { error: 'El servidor no devolvió un identificador de trabajo.' };

      let completed = false;
      let attempt = 0;
      let elapsedMs = 0;
      let textOutput = '';

      while (!completed && elapsedMs < LONG_GENERATION_POLL_SCHEDULE.maxElapsedMs) {
        const waitMs = nextGenerationPollDelayMs(attempt, LONG_GENERATION_POLL_SCHEDULE);
        if (!(await waitForGenerationPollWindow(waitMs))) break;
        elapsedMs += waitMs;
        attempt += 1;
        try {
          const pollRes = await fetch(`/api/ai/jobs/${jobId}`);
          const pollData = await safeJson(pollRes);
          if (!pollData) continue;
          if (pollData.error) return { error: extractErrorMessage(pollData, 'Error al consultar el estado del trabajo.') };

          const job = pollData.job as Record<string, unknown> | undefined;
          const status = job?.status as string | undefined;

          if (status === 'completed') {
            const result = job?.result as Record<string, unknown> | undefined;
            if (result?.text) textOutput = result.text as string;
            else if (result?.output) textOutput = result.output as string;
            else textOutput = JSON.stringify(result);
            completed = true;
          } else if (isTerminalGenerationStatus(status)) {
            return { error: terminalGenerationMessage(job, status) };
          }
        } catch (pollErr: unknown) {
          console.warn('Poll error:', pollErr);
        }
      }

      if (!textOutput) return { error: 'Tiempo de espera agotado al analizar el video.' };

      setOutputText(textOutput);
      const creditsBalance = (jobData.credits as Record<string, unknown> | undefined)?.balance;
      if (typeof creditsBalance === 'number') setCredits(creditsBalance);
      const creditCost = (jobData.job as Record<string, unknown> | undefined)?.creditCost;
      return { result: { text: textOutput, creditsUsed: typeof creditCost === 'number' ? creditCost : 2, provider: currentProvider } };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Error al conectar con el servidor.' };
    }
  }, [videoUrl, youtubeUrl, videoBase64, videoMimeType, inputMethod, processingMode, startOffset, endOffset, fps, credits]);

  return {
    videoUrl, setVideoUrl,
    youtubeUrl, setYoutubeUrl,
    videoBase64, setVideoBase64,
    videoMimeType, setVideoMimeType,
    inputMethod, setInputMethod,
    processingMode, setProcessingMode,
    startOffset, setStartOffset,
    endOffset, setEndOffset,
    fps, setFps,
    credits, setCredits,
    outputText, setOutputText,
    generate,
  };
}
