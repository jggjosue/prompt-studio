'use client';

import { takeGenerationTrainingContext } from '@/lib/training/client-events';
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
import { trackAnalyticsEvent } from '@/lib/analytics';

export function useWebGeneration() {
  const [webProvider, setWebProvider] = useState<'anthropic' | 'openai' | 'google'>('google');
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [vertexKey, setVertexKey] = useState('');
  const [credits, setCredits] = useState(0.0);
  const [webFramework, setWebFramework] = useState('nextjs');
  const [webTheme, setWebTheme] = useState('glassmorphism');
  const [webComponent, setWebComponent] = useState('hero');
  const [webColor, setWebColor] = useState('blue');
  const [webModel, setWebModel] = useState('gemini-3.1-flash-lite');
  const [outputWebHTML, setOutputWebHTML] = useState('');

  const generate = useCallback(async (prompt: string, params: ChatParams): Promise<{ result?: ChatMessageResult; error?: string }> => {
    const provider = (params.provider || webProvider) as string;
    const model = params.model || resolveDefaultWebModel(provider);

    const systemPrompt = buildWebSystemPrompt(params, webTheme, webColor);
    const input = buildWebInput(provider, model, systemPrompt, prompt, params);

    try {
      const jobRes = await fetch('/api/ai/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({ kind: 'project', provider, model, input, trainingContext: takeGenerationTrainingContext() }),
      });

      const jobData = await safeJson(jobRes);
      if (!jobRes.ok || !jobData || jobData.error) {
        return { error: extractErrorMessage(jobData, 'Fallo al iniciar el trabajo web.') };
      }

      const jobId = (jobData.job as Record<string, unknown>)?.id as string | undefined;
      if (!jobId) return { error: 'El servidor no devolvió un identificador de trabajo.' };

      let completed = false;
      let attempt = 0;
      let elapsedMs = 0;
      let generatedHTML = '';

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
            generatedHTML = extractWebOutput(job?.result);
            completed = true;
          } else if (isTerminalGenerationStatus(status)) {
            return { error: terminalGenerationMessage(job, status) };
          }
        } catch (pollErr: unknown) {
          console.warn('Poll error:', pollErr);
        }
      }

      if (!generatedHTML) return { error: 'Tiempo de espera agotado al generar la página web.' };

      const cleanHTML = stripMarkdownFences(generatedHTML);
      setOutputWebHTML(cleanHTML);
      trackAnalyticsEvent('generate_web', { item_category: 'web', action_source: 'generation_completed' });
      const creditsBalance = (jobData.credits as Record<string, unknown> | undefined)?.balance;
      if (typeof creditsBalance === 'number') setCredits(creditsBalance);
      const creditCost = (jobData.job as Record<string, unknown> | undefined)?.creditCost;
      return { result: { generationId: jobId, html: cleanHTML, creditsUsed: typeof creditCost === 'number' ? creditCost : 2, provider } };
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

// ── Default models ─────────────────────────────────────────────────────────

function resolveDefaultWebModel(provider: string): string {
  switch (provider) {
    case 'openai':    return 'gpt-4o';
    case 'anthropic': return 'claude-3-5-sonnet-20240620';
    case 'google':    return 'gemini-3.1-flash-lite';
    default:          return 'gpt-4o';
  }
}

// ── Provider-specific input builders ──────────────────────────────────────
//
// The backend job runner sends `input` directly to the worker.
// Each provider expects a different message format.

function buildWebInput(
  provider: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  params: ChatParams
): Record<string, unknown> {
  const base = { prompt: userPrompt, model, generationTier: params.generationTier };
  switch (provider) {
    // ── OpenAI Chat Completions ─────────────────────────────────────────
    // POST /v1/chat/completions
    case 'openai':
      return {
        ...base, // base field the backend uses
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 8192,
        temperature: 0.7,
      };

    // ── Anthropic Messages ──────────────────────────────────────────────
    // POST /v1/messages
    case 'anthropic':
      return {
        prompt: userPrompt,
        model,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 8192,
        temperature: 0.7,
      };

    // ── Google Gemini Interactions API ──────────────────────────────────
    case 'google':
      return {
        ...base,
        prompt: `${systemPrompt}\n\n${userPrompt}`, // Gemini uses single prompt field
        contents: [
          {
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      };

    default:
      return base;
  }
}

// ── System prompt builder ──────────────────────────────────────────────────

function buildWebSystemPrompt(params: ChatParams, defaultTheme: string, defaultColor: string): string {
  const layout = params.webComponent === 'hero' ? 'Hero Header Section'
    : params.webComponent === 'pricing' ? 'Tabla de Precios / Pricing plans grid'
    : params.webComponent === 'features' ? 'Sección de Características / Features grid'
    : 'Landing Page Completa / Full Page Layout';

  const framework = params.webFramework === 'nextjs' ? 'Next.js (estructura emulada)'
    : params.webFramework === 'react' ? 'React Component (estructura emulada)'
    : 'HTML5 puro con Tailwind CDN';

  return `Eres un desarrollador y diseñador web premium especializado en interfaces modernas.
Genera una página HTML completa, responsiva y visualmente impactante usando Tailwind CSS (vía CDN si es HTML puro).
Integra: gradientes CSS modernos, fuentes de Google Fonts (Inter, Outfit o similar), componentes tipo card, botones con hover effects, micro-animaciones y navegación interactiva.
IMPORTANTE: Devuelve ÚNICAMENTE el bloque de código HTML. Comienza con \`\`\`html y termina con \`\`\`. No incluyas explicaciones adicionales.

Configuración:
- Diseño objetivo: ${layout}
- Framework / Estructura: ${framework}
- Tema visual: ${params.webTheme || defaultTheme}
- Paleta de color accent: ${params.webColor || defaultColor}
- Idioma preferido del contenido: Español`;
}

// ── Web output extraction ──────────────────────────────────────────────────

function extractWebOutput(result: unknown): string {
  if (!result || typeof result !== 'object') return '';
  const r = result as Record<string, unknown>;

  // Direct text/html/output fields (set by worker)
  if (typeof r.output === 'string') return r.output;
  if (typeof r.text === 'string') return r.text;
  if (typeof r.output_text === 'string') return r.output_text;
  if (typeof r.html === 'string') return r.html;

  // OpenAI Chat Completions: { choices: [{ message: { content } }] }
  const choices = r.choices as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(choices) && choices[0]) {
    const msg = choices[0].message as Record<string, unknown> | undefined;
    if (typeof msg?.content === 'string') return msg.content;
  }

  // Anthropic Messages: { content: [{ type: "text", text: "..." }] }
  const content = r.content as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(content)) {
    for (const block of content) {
      if (block.type === 'text' && typeof block.text === 'string') return block.text;
    }
  }

  // Compatibility shape returned alongside Interactions API `output_text`.
  const candidates = r.candidates as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(candidates) && candidates[0]) {
    const c = candidates[0].content as Record<string, unknown> | undefined;
    const parts = c?.parts as Array<Record<string, unknown>> | undefined;
    if (Array.isArray(parts) && typeof parts[0]?.text === 'string') return parts[0].text;
  }

  return '';
}

// ── Strip markdown code fences ─────────────────────────────────────────────

function stripMarkdownFences(raw: string): string {
  let s = raw.trim();
  if (s.startsWith('```html')) s = s.slice(7);
  else if (s.startsWith('```')) s = s.slice(3);
  if (s.endsWith('```')) s = s.slice(0, -3);
  return s.trim();
}
