'use client';

/**
 * Edición contextual por IA.
 *
 * Se abre al pulsar "Editar con IA" en un componente o sección. Muestra el coste
 * estimado, genera operaciones estructuradas (nunca código), lista las operaciones
 * como diff y permite previsualizar el resultado antes de aplicarlo. Aplicar usa
 * `applyAIEdit`, que valida cada operación contra el documento y entra en el
 * historial de deshacer.
 */

import { PageRenderer } from '@/components/editor/page-renderer';
import { describeAIEditOp, type AIEditOp } from '@/lib/editor/ai-edit-ops';
import { applyAIEditOps } from '@/lib/editor/ai-edit-ops';
import { nodeLabel, useBuilder } from './builder-context';
import { Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const EXAMPLES = [
  'Haz este hero más profesional.',
  'Añade dos botones de llamada a la acción.',
  'Traduce esta sección a español.',
  'Haz esta sección minimalista.',
  'Mejora el copy.',
  'Cambia esta sección para un producto SaaS.',
];

type EditResponse = { ops?: AIEditOp[]; credits?: number; error?: string; code?: string };

export function BuilderAIEdit() {
  const builder = useBuilder();
  const nodeId = builder.aiEditTarget;
  const location = nodeId && builder.selected?.node.id === nodeId ? builder.selected : undefined;

  const [instruction, setInstruction] = useState('');
  const [estimate, setEstimate] = useState<{ credits: number } | null>(null);
  const [ops, setOps] = useState<AIEditOp[] | null>(null);
  const [previewSchema, setPreviewSchema] = useState<typeof builder.schema | null>(null);
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
    if (!instruction.trim()) {
      setEstimate(null);
      return;
    }
    estimateTimer.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/page-composer/ai/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: instruction }),
        });
        const data = (await response.json()) as { credits?: number; error?: string };
        if (response.ok && typeof data.credits === 'number') setEstimate({ credits: data.credits });
        else setEstimate(null);
      } catch {
        setEstimate(null);
      }
    }, 500);
  }, [instruction]);

  if (!nodeId) return null;

  const subset = location
    ? { node: location.node, ancestors: location.trail.map(node => ({ id: node.id, type: node.type })), theme: builder.schema.site.theme }
    : { nodeId };

  const generate = async () => {
    if (!instruction.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch('/api/page-composer/ai/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction, nodeId, subset }),
      });
      const data = (await response.json()) as EditResponse;
      if (!response.ok) {
        setError({ message: data.error ?? 'No se pudo generar la edición.', code: data.code });
        return;
      }
      if (Array.isArray(data.ops) && data.ops.length) setOps(data.ops);
    } catch {
      setError({ message: 'No se pudo conectar con el servidor.' });
    } finally {
      setBusy(false);
    }
  };

  const preview = () => {
    if (!ops) return;
    const outcome = applyAIEditOps(structuredClone(builder.schema), builder.slug, ops, {
      makeId: type => `${type}-${Math.random().toString(36).slice(2, 7)}`,
      defaults: () => ({ defaultProps: {}, defaultStyles: {} }),
    });
    setPreviewSchema(outcome.ok ? outcome.schema : null);
  };

  const apply = () => {
    if (!ops) return;
    const outcome = builder.applyAIEdit(ops);
    if (outcome) setError({ message: outcome.message });
    else builder.openAIEdit(null);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={() => builder.openAIEdit(null)}>
      <div
        className="flex max-h-[92dvh] w-full max-w-xl flex-col rounded-2xl bg-background shadow-2xl"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-label="Editar con IA"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <strong className="flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" />
            Editar con IA · {nodeId}
            {location ? <span className="text-xs font-normal text-muted-foreground">({nodeLabel(location.node)})</span> : null}
          </strong>
          <button
            type="button"
            onClick={() => builder.openAIEdit(null)}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label="Cerrar"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto p-4">
          <textarea
            value={instruction}
            onChange={event => setInstruction(event.target.value)}
            rows={3}
            placeholder="Describe el cambio, por ejemplo: «Haz este hero más profesional»."
            className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLES.map(example => (
              <button
                key={example}
                type="button"
                onClick={() => setInstruction(example)}
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

          {ops ? (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Operaciones (diff)</p>
              <ul className="mt-1.5 flex flex-col gap-1">
                {ops.map((op, index) => (
                  <li key={index} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-violet-500" />
                    {describeAIEditOp(op)}
                  </li>
                ))}
              </ul>
              {previewSchema ? (
                <div className="mt-3 max-h-64 overflow-y-auto rounded-md border border-border bg-background p-2">
                  <PageRenderer schema={previewSchema} />
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              {estimate ? (
                <>Coste estimado: <strong className="text-foreground">{estimate.credits} créditos</strong></>
              ) : (
                'El coste se muestra al escribir la instrucción.'
              )}
            </span>
            <div className="flex gap-2">
              {ops ? (
                <>
                  <button
                    type="button"
                    onClick={preview}
                    className="rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {previewSchema ? 'Ocultar preview' : 'Preview'}
                  </button>
                  <button
                    type="button"
                    onClick={apply}
                    className="rounded-md bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    Aplicar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={generate}
                  disabled={!instruction.trim() || busy}
                  className="inline-flex items-center gap-2 rounded-md bg-violet-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-violet-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50"
                >
                  <Sparkles className="size-3.5" />
                  {busy ? 'Generando…' : 'Generar cambios'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}