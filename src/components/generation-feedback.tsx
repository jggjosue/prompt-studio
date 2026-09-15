'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import {
  FEEDBACK_REASONS,
  FEEDBACK_REASON_LABEL,
  type FeedbackReason,
} from '@/lib/generation-feedback';

type GenerationFeedbackProps = {
  jobId: string;
  /** Valoración ya registrada, si la hay. */
  initialUseful: boolean | null;
  className?: string;
};

/**
 * Pulgar arriba / abajo sobre el resultado de una generación terminada.
 *
 * El motivo se pide **solo al marcar negativo**, y es opcional: exigirlo
 * siempre hunde la tasa de respuesta, y una valoración sin motivo sigue siendo
 * la señal que hoy no existe.
 */
export function GenerationFeedback({
  jobId,
  initialUseful,
  className,
}: GenerationFeedbackProps) {
  const [useful, setUseful] = useState<boolean | null>(initialUseful);
  const [askReason, setAskReason] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [rating, setRating] = useState(5);
  const [recommendation, setRecommendation] = useState('');
  const [publishReview, setPublishReview] = useState(false);
  const [publishResult, setPublishResult] = useState(false);

  const send = async (next: boolean | null, reason?: FeedbackReason, community = false) => {
    setBusy(true);
    setError('');
    const previous = useful;
    // Optimista: el estado responde ya y se revierte si el servidor rechaza.
    setUseful(next);

    try {
      const response = await fetch(`/api/ai/jobs/${jobId}/feedback`, {
        method: next === null ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: next === null ? undefined : JSON.stringify({ useful: next, reason, ...(community ? { rating, recommendation, publishReview, publishResult } : {}) }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'No se pudo guardar la valoración.');
      }
      if (next === false && reason === undefined) setAskReason(true);
      if (reason !== undefined || next !== false) setAskReason(false);
    } catch (value) {
      setUseful(previous);
      setError(value instanceof Error ? value.message : 'Error de red.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn('mt-4 border-t pt-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">¿Te sirvió este resultado?</span>

        <Button
          type="button"
          size="sm"
          variant={useful === true ? 'default' : 'outline'}
          aria-pressed={useful === true}
          aria-label="Sí, me sirvió"
          disabled={busy}
          // Volver a pulsar la opción activa retira la valoración.
          onClick={() => void send(useful === true ? null : true)}
        >
          <ThumbsUp className="h-4 w-4" aria-hidden="true" />
        </Button>

        <Button
          type="button"
          size="sm"
          variant={useful === false ? 'destructive' : 'outline'}
          aria-pressed={useful === false}
          aria-label="No me sirvió"
          disabled={busy}
          onClick={() => void send(useful === false ? null : false)}
        >
          <ThumbsDown className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      {askReason && useful === false ? (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground">¿Qué falló? (opcional)</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {FEEDBACK_REASONS.map(reason => (
              <Button
                key={reason}
                type="button"
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => void send(false, reason)}
              >
                {FEEDBACK_REASON_LABEL[reason]}
              </Button>
            ))}
          </div>
        </div>
      ) : null}

      {useful !== null ? <div className="mt-4 space-y-3 rounded-xl border bg-muted/20 p-3"><div><p className="text-xs font-medium">Valoración de la comunidad</p><div className="mt-2 flex gap-1">{[1,2,3,4,5].map(value=><button key={value} type="button" aria-label={`${value} estrellas`} onClick={()=>setRating(value)} className="p-1"><Star className={`size-5 ${value<=rating?'fill-amber-400 text-amber-400':'text-muted-foreground'}`}/></button>)}</div></div><textarea value={recommendation} maxLength={500} onChange={event=>setRecommendation(event.target.value)} placeholder="¿Qué recomiendas para obtener un mejor resultado?" className="min-h-20 w-full rounded-md border bg-background p-2 text-sm"/><label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={publishReview} onChange={event=>{setPublishReview(event.target.checked);if(!event.target.checked)setPublishResult(false)}}/><span>Publicar mi valoración y sus datos técnicos en los ejemplos comunitarios.</span></label><label className="flex items-start gap-2 text-xs"><input type="checkbox" disabled={!publishReview} checked={publishResult} onChange={event=>setPublishResult(event.target.checked)}/><span>Mostrar también el resultado generado. Si no lo seleccionas, el resultado seguirá privado.</span></label><Button type="button" size="sm" disabled={busy} onClick={()=>void send(useful,undefined,true)}>Guardar reseña</Button></div>:null}

      {error ? (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
