'use client';

import type { ChatMessageResult, ChatParams } from '@/lib/chat-types';
import { safeJson, extractErrorMessage } from '@/lib/safe-json';
import { useCallback, useState } from 'react';

export function useWebGeneration() {
  const [webProvider, setWebProvider] = useState<'anthropic' | 'openai' | 'google'>('openai');
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [vertexKey, setVertexKey] = useState('');
  const [credits, setCredits] = useState(12.0);
  const [webFramework, setWebFramework] = useState('nextjs');
  const [webTheme, setWebTheme] = useState('glassmorphism');
  const [webComponent, setWebComponent] = useState('hero');
  const [webColor, setWebColor] = useState('blue');
  const [webModel, setWebModel] = useState('gemini-2.5-flash');
  const [outputWebHTML, setOutputWebHTML] = useState('');

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const provider = (params.provider || webProvider) as string;
    const requestedModel = params.model || (
      provider === 'openai' ? 'gpt-4o' :
      provider === 'anthropic' ? 'claude-3-5-sonnet-20240620' :
      'gemini-2.5-flash'
    );

    const systemInstruction = `You are a premium web developer and designer.
Generate a fully responsive, visually stunning single-file HTML landing page utilizing Tailwind CSS.
Integrate modern design trends: smooth CSS gradients, custom Google fonts (Inter/Outfit), clean layout, card components, buttons with hover effects, micro-animations, and interactive navigation elements.
DO NOT include surrounding markdown explanation, ONLY return the full code block. Your response must begin with \`\`\`html and end with \`\`\`.
Requirements:
- Target Layout: ${params.webComponent === 'hero' ? 'Hero Header Section' : params.webComponent === 'pricing' ? 'Pricing plans grid' : params.webComponent === 'features' ? 'Features outline grid' : 'Complete Full Page Landing Layout'}
- Framework style: ${params.webFramework === 'nextjs' ? 'Next.js structure emulated' : params.webFramework === 'react' ? 'React component structure emulated' : 'HTML5 Bundle'}
- Theme: ${params.webTheme || webTheme}
- Accent palette: ${params.webColor || webColor}
- Prompt: ${prompt}`;

    try {
      const jobRes = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          kind: 'project',
          provider,
          model: requestedModel,
          input: { prompt: systemInstruction, model: requestedModel },
        }),
      });

      const jobData = await safeJson(jobRes);
      if (!jobRes.ok || !jobData || jobData.error) {
        return { error: extractErrorMessage(jobData, 'Fallo al iniciar el trabajo web.') };
      }

      const jobId = (jobData.job as Record<string, unknown>)?.id as string | undefined;
      if (!jobId) return { error: 'El servidor no devolvió un identificador de trabajo.' };

      let completed = false;
      let attempts = 0;
      let generatedHTML = '';

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
            generatedHTML = (result?.output || result?.text || result?.html || '') as string;
            // Fallback for Gemini candidates format
            if (!generatedHTML) {
              const candidates = result?.candidates as Array<{ content: { parts: Array<{ text: string }> } }> | undefined;
              generatedHTML = candidates?.[0]?.content?.parts?.[0]?.text || '';
            }
            completed = true;
          } else if (status === 'failed') {
            return { error: (job?.lastError as string | undefined) || 'El trabajo falló en el servidor.' };
          }
        } catch (pollErr: unknown) {
          console.warn('Poll error:', pollErr);
        }
      }

      if (!generatedHTML) return { error: 'Tiempo de espera agotado al generar la página web.' };

      // Strip markdown fences if present
      let cleanHTML = generatedHTML.trim();
      if (cleanHTML.startsWith('```html')) cleanHTML = cleanHTML.substring(7);
      else if (cleanHTML.startsWith('```')) cleanHTML = cleanHTML.substring(3);
      if (cleanHTML.endsWith('```')) cleanHTML = cleanHTML.substring(0, cleanHTML.length - 3);
      cleanHTML = cleanHTML.trim();

      setOutputWebHTML(cleanHTML);
      const creditsBalance = (jobData.credits as Record<string, unknown> | undefined)?.balance;
      if (typeof creditsBalance === 'number') setCredits(creditsBalance);
      const creditCost = (jobData.job as Record<string, unknown> | undefined)?.creditCost;
      return { result: { html: cleanHTML, creditsUsed: typeof creditCost === 'number' ? creditCost : 2, provider } };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err.message : 'Error al conectar con el servidor.' };
    }
  }, [webProvider, credits, webTheme, webColor]);

  return {
    webProvider, setWebProvider, openAIKey, setOpenAIKey, anthropicKey, setAnthropicKey,
    vertexKey, setVertexKey, credits, setCredits,
    webFramework, setWebFramework, webTheme, setWebTheme, webComponent, setWebComponent,
    webColor, setWebColor, webModel, setWebModel, outputWebHTML, setOutputWebHTML, generate,
  };
}
