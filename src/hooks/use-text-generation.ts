'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import {
  TEXT_GENERATION_POLL_SCHEDULE,
  isTerminalGenerationStatus,
  nextGenerationPollDelayMs,
  terminalGenerationMessage,
  waitForGenerationPollWindow,
} from '@/lib/generation-polling';
import { safeJson, extractErrorMessage } from '@/lib/safe-json';
import { useCallback, useRef, useState } from 'react';
import { generatePromptStudioTextStream, isPromptStudioTextStreamingEnabled } from '@/lib/generation/promptstudio-text-stream';

export function useTextGeneration() {
  const [provider, setProvider] = useState<'google' | 'openai' | 'anthropic'>('google');
  const [credits, setCredits] = useState(12.0);
  const [outputText, setOutputText] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const generate = useCallback(async (prompt: string, params: ChatParams, onText?: (text: string) => void): Promise<{ result?: ChatMessageResult; error?: string }> => {
    if (isPromptStudioTextStreamingEnabled()) {
      if (abortRef.current) return { error: 'Ya hay una generación de texto activa.' };
      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(true);
      setOutputText('');
      setGenerationId(null);
      try {
        const streamed = await generatePromptStudioTextStream(prompt, params, {
          onText: text => {
            setOutputText(text);
            onText?.(text);
          },
          onGenerationId: setGenerationId,
        }, controller.signal);
        return streamed;
      } finally {
        abortRef.current = null;
        setStreaming(false);
      }
    }
    const currentProvider = (params.provider || provider) as string;
    const model = params.model || 'gemini-3.8-flash';

    const input = { 
      prompt,
      model,
      thinkingLevel: params.thinkingLevel,
      systemInstruction: params.systemInstruction
    };

    try {
      const jobRes = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          kind: 'text',
          provider: currentProvider,
          model,
          input,
        }),
      });

      const jobData = await safeJson(jobRes);
      if (!jobRes.ok || !jobData || jobData.error) {
        const msg = extractErrorMessage(jobData, `Error ${jobRes.status}: Fallo al iniciar la generación de texto.`);
        return { error: msg };
      }

      const jobId = (jobData.job as Record<string, unknown>)?.id as string | undefined;
      if (!jobId) return { error: 'El servidor no devolvió un identificador de trabajo.' };

      let completed = false;
      let attempt = 0;
      let elapsedMs = 0;
      let textOutput = '';

      while (!completed && elapsedMs < TEXT_GENERATION_POLL_SCHEDULE.maxElapsedMs) {
        const waitMs = nextGenerationPollDelayMs(attempt, TEXT_GENERATION_POLL_SCHEDULE);
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

      if (!textOutput) return { error: 'Tiempo de espera agotado.' };

      setOutputText(textOutput);
      const creditsBalance = (jobData.credits as Record<string, unknown> | undefined)?.balance;
      if (typeof creditsBalance === 'number') setCredits(creditsBalance);
      const creditCost = (jobData.job as Record<string, unknown> | undefined)?.creditCost;
      return { result: { text: textOutput, creditsUsed: typeof creditCost === 'number' ? creditCost : 1, provider: currentProvider } };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Error al conectar con el servidor.' };
    }
  }, [provider]);

  return {
    provider, setProvider,
    credits, setCredits,
    outputText, setOutputText,
    streaming, generationId, cancel,
    generate,
  };
}
