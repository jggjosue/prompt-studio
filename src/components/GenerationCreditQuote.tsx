'use client';

import { useEffect, useState } from 'react';

type Quote = {
  operationCode: string;
  displayName: string;
  creditCost: number;
  currentBalance: number;
  estimatedBalanceAfter: number;
  sufficientCredits: boolean;
  isFree: boolean;
};

export type GenerationCreditQuoteProps = {
  operationCode: string;
  fileCount?: number;
  lineCount?: number;
  className?: string;
};

export function GenerationCreditQuote({ operationCode, fileCount, lineCount, className = '' }: GenerationCreditQuoteProps) {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/ai/credits/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
      body: JSON.stringify({ operationCode, fileCount, lineCount }),
    })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setQuote(data?.quote ?? null))
      .catch(() => undefined);
    return () => controller.abort();
  }, [operationCode, fileCount, lineCount]);

  if (!quote) return <div className={className} aria-live="polite">Calculando costo en Prompt Credits…</div>;

  return (
    <section className={`rounded-lg border p-3 text-sm ${className}`} aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <span>{quote.displayName}</span>
        <strong className="tabular-nums">{quote.isFree ? 'FREE' : `${quote.creditCost.toLocaleString()} credits`}</strong>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
        <span>Saldo actual</span><span className="text-right tabular-nums">{quote.currentBalance.toLocaleString()}</span>
        <span>Después de generar</span><span className="text-right tabular-nums">{quote.estimatedBalanceAfter.toLocaleString()}</span>
      </div>
      {!quote.sufficientCredits && (
        <p className="mt-2 font-medium" role="alert">No tienes Prompt Credits suficientes para esta operación.</p>
      )}
      <p className="mt-2 text-xs opacity-70">Estimación previa. El servidor confirma el precio y reserva los créditos al generar.</p>
    </section>
  );
}
