'use client';

/**
 * Generación de sitios por IA.
 *
 * El usuario escribe una petición en lenguaje natural, ve el coste estimado en
 * créditos y genera. El servidor devuelve un `PageSchema` validado (nunca HTML),
 * que se carga en el editor con `loadSchema`. Los errores del modelo llegan
 * tipados (`code`) para poder mostrarlos.
 */

import { Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { SiteSchema } from '@/lib/editor/page-schema';
import { useBuilder } from './builder-context';

type PlanResponse = { schema: SiteSchema; warnings?: string[]; credits: number };
type ErrorResponse = { error: string; code?: string };

const EXAMPLES = [
  'Crea un sitio moderno para una cafetería en México.',
  'Landing de venta para un curso de fotografía.',
  'Sitio para una inmobiliaria con galería de propiedades.',
  'Portafolio personal de un diseñador freelance.',
];

export function BuilderAI({ onClose }: { onClose: () => void }) {
  const builder = useBuilder();
  const [prompt, setPrompt] = useState('');
  const [estimate, setEstimate] = useState<{ credits: number; model: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const estimateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (estimateTimer.current) clearTimeout(estimateTimer.current);
    };
  }, []);

  useEffect(() => {
    if (estimateTimer.current) clearTimeout(estimateTimer.current);
    if (!prompt.trim()) {
      setEstimate(null);
      return;
    }
    estimateTimer.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/page-composer/ai/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
        const data = (await response.json()) as { credits?: number; model?: string; error?: string };
        if (response.ok && typeof data.credits === 'number') {
          setEstimate({ credits: data.credits, model: data.model ?? 'gemini-2.5-flash' });
        } else {
          setEstimate(null);
        }
      } catch {
        setEstimate(null);
      }
    }, 500);
  }, [prompt]);

  const generate = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/page-composer/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = (await response.json()) as PlanResponse | ErrorResponse;
      if (!response.ok) {
        setError({ message: 'error' in data ? data.error : 'No se pudo generar el sitio.', code: 'code' in data ? data.code : undefined });
        return;
      }
      if ('schema' in data && data.schema) {
        builder.loadSchema(data.schema);
        onClose();
      }
    } catch {
      setError({ message: 'No se pudo conectar con el servidor.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-lg flex-col rounded-2xl bg-background shadow-2xl"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-label="Generar sitio con IA"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <strong className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" />
            Generar sitio con IA
          </strong>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <textarea
            value={prompt}
            onChange={event => setPrompt(event.target.value)}
            rows={4}
            placeholder="Describe el sitio que quieres, por ejemplo: «Crea un sitio moderno para una cafetería en México»."
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map(example => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                {example}
              </button>
            ))}
          </div>

          {error ? (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">
              {error.message}
              {error.code ? <span className="ml-1 font-mono text-[10px] opacity-70">({error.code})</span> : null}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {estimate ? (
                <>
                  Coste estimado: <strong className="text-foreground">{estimate.credits} créditos</strong>
                  <span className="ml-1 font-mono text-[10px]">({estimate.model})</span>
                </>
              ) : (
                'El coste en créditos se muestra al escribir la petición.'
              )}
            </span>
            <button
              type="button"
              onClick={generate}
              disabled={!prompt.trim() || busy}
              className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
            >
              <Sparkles className="size-4" />
              {busy ? 'Generando…' : 'Generar sitio'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}