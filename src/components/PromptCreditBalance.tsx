'use client';

import { useCallback, useEffect, useState } from 'react';

type CreditBalanceResponse = {
  credits?: {
    balance: number;
    reserved: number;
  };
};

export type PromptCreditBalanceProps = {
  compact?: boolean;
  className?: string;
};

export function PromptCreditBalance({ compact = false, className = '' }: PromptCreditBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [reserved, setReserved] = useState(0);

  const refresh = useCallback(async () => {
    const response = await fetch('/api/ai/credits', { cache: 'no-store' });
    if (!response.ok) return;
    const data = await response.json() as CreditBalanceResponse;
    if (!data.credits) return;
    setBalance(data.credits.balance);
    setReserved(data.credits.reserved);
  }, []);

  useEffect(() => {
    void refresh();
    const onCreditsChanged = () => void refresh();
    window.addEventListener('prompt-credits-changed', onCreditsChanged);
    return () => window.removeEventListener('prompt-credits-changed', onCreditsChanged);
  }, [refresh]);

  const available = balance === null ? null : Math.max(0, balance - reserved);

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${className}`}
      aria-label={available === null ? 'Cargando Prompt Credits' : `${available} Prompt Credits disponibles`}
      title={reserved > 0 ? `${reserved} créditos reservados` : 'Prompt Credits disponibles'}
    >
      <span aria-hidden="true">✦</span>
      <span className="font-medium tabular-nums">{available === null ? '—' : available.toLocaleString()}</span>
      {!compact && <span className="hidden sm:inline">Prompt Credits</span>}
    </div>
  );
}

export function notifyPromptCreditsChanged() {
  window.dispatchEvent(new Event('prompt-credits-changed'));
}
