'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import { safeJson, extractErrorMessage } from '@/lib/safe-json';
import { useCallback, useState } from 'react';

export function useVisionGeneration() {
  const [provider, setProvider] = useState<'google'>('google');
  const [credits, setCredits] = useState(12.0);
  const [referenceImage, setReferenceImage] = useState('');
  const [outputText, setOutputText] = useState('');

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const currentProvider = (params.provider || provider) as string;
    const model = params.model || 'gemini-3.8-flash';

    // The user can pass referenceImage via params.referenceImage
    const input = { 
      prompt,
      model,
      referenceImage: params.referenceImage || referenceImage
    };

    try {
      const jobRes = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          kind: 'vision',
          provider: currentProvider,
          model,
          input,
        }),
      });

      const jobData = await safeJson(jobRes);
      if (!jobRes.ok || !jobData || jobData.error) {
        const msg = extractErrorMessage(jobData, `Error ${jobRes.status}: Fallo al iniciar el análisis de imagen.`);
        return { error: msg };
      }

      const jobId = (jobData.job as Record<string, unknown>)?.id as string | undefined;
      if (!jobId) return { error: 'El servidor no devolvió un identificador de trabajo.' };

      let completed = false;
      let attempts = 0;
      let textOutput = '';

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
            // Extracted text should be in result.output or similar
            const result = job?.result as Record<string, unknown> | undefined;
            if (result?.text) textOutput = result.text as string;
            else if (result?.output) textOutput = result.output as string;
            else textOutput = JSON.stringify(result);
            completed = true;
          } else if (status === 'failed') {
            return { error: (job?.lastError as string | undefined) || 'El trabajo falló en el servidor.' };
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
  }, [provider, credits, referenceImage]);

  return {
    provider, setProvider,
    credits, setCredits,
    referenceImage, setReferenceImage,
    outputText, setOutputText,
    generate,
  };
}
