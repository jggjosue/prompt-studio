'use client';

import { Badge } from '@/components/ui/badge';
import { generationQuote } from '@/lib/generation-pricing';
import type { AIJobKind } from '@/models/AIGenerationJob';
import { Clock3, DollarSign, Gauge, RotateCcw, Sparkles } from 'lucide-react';

type GenerationCostDisclosureProps = {
  kind: AIJobKind;
  provider: string;
  usesPlatformCredits?: boolean;
  showCosts?: boolean;
};

export function GenerationCostDisclosure({
  kind,
  provider,
  usesPlatformCredits = false,
  showCosts = true,
}: GenerationCostDisclosureProps) {
  const quote = generationQuote(kind, provider);

  return (
    <aside
      className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3"
      aria-label={showCosts ? 'Costo y condiciones de generación' : 'Condiciones de generación'}
    >
      <div className="mb-2 flex items-center justify-between">
        <strong className="text-xs">Antes de generar</strong>
        <Badge variant="outline" className="capitalize">
          {provider}
        </Badge>
      </div>
      <div
        className={showCosts
          ? 'grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4'
          : 'grid grid-cols-2 gap-2 text-[11px]'}
      >
        {showCosts ? (
          <>
            <span className="flex items-center gap-1">
              <Sparkles className="size-3" />
              {usesPlatformCredits ? quote.credits : 0} créditos Prompt Studio
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="size-3" />≈ ${quote.estimatedCostUsd.toFixed(2)} USD del proveedor
            </span>
          </>
        ) : null}
        <span className="flex items-center gap-1">
          <Clock3 className="size-3" />
          {quote.estimatedSeconds
            ? `${quote.estimatedSeconds.min}–${quote.estimatedSeconds.max}s`
            : 'Duración según el proveedor'}
        </span>
        <span className="flex items-center gap-1">
          <Gauge className="size-3" />
          {quote.resolution && quote.quality ? `${quote.resolution} · ${quote.quality}` : 'Salida en texto'}
        </span>
      </div>
      {showCosts ? (
        <p className="mt-2 flex items-start gap-1 text-[10px] text-muted-foreground">
          <RotateCcw className="mt-0.5 size-3 shrink-0" />
          {usesPlatformCredits
            ? quote.refundPolicy
            : 'Modo API propia: Prompt Studio no reserva créditos. El proveedor factura directamente según su política.'}
        </p>
      ) : null}
    </aside>
  );
}
