'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';

type Estimate = {
  pledgeAmountCents: number;
  baseCredits: number;
  bonusPercent: number;
  bonusCredits: number;
  totalCredits: number;
  examples: Array<{ operationCode: string; displayName: string; creditCost: number; maxOperations: number | null }>;
};

const TIERS = [10, 25, 50, 100, 250, 500, 1000] as const;

export function CrowdfundingCreditCalculator() {
  const es = useLocale().startsWith('es');
  const tr = (en: string, spanish: string) => es ? spanish : en;
  const [amount, setAmount] = useState(50);
  const [estimate, setEstimate] = useState<Estimate | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/api/crowdfunding/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ pledgeAmountCents: amount * 100 }),
    }).then((response) => response.ok ? response.json() : null)
      .then((data) => setEstimate(data?.estimate ?? null))
      .catch(() => undefined);
    return () => controller.abort();
  }, [amount]);

  return (
    <section className="space-y-4 rounded-xl border p-4 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold">{tr('Founder Credits Calculator', 'Calculadora de Founder Credits')}</h2>
        <p className="text-sm opacity-70">{tr('Choose a contribution to estimate your Founder Credits and what you could create with them.', 'Elige un aporte para estimar tus Founder Credits y qué podrías crear con ellos.')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TIERS.map((tier) => (
          <button key={tier} type="button" onClick={() => setAmount(tier)} aria-pressed={amount === tier} className="rounded-lg border px-3 py-2">
            ${tier}
          </button>
        ))}
      </div>

      {estimate && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Metric label="Base" value={estimate.baseCredits} />
            <Metric label={`Bonus ${estimate.bonusPercent}%`} value={estimate.bonusCredits} />
            <Metric label="Founder Credits" value={estimate.totalCredits} />
            <Metric label="Aporte" value={`$${estimate.pledgeAmountCents / 100}`} />
          </div>

          <div>
            <h3 className="font-semibold">{tr('What you could create', 'Qué podrías crear')}</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {estimate.examples.map((example) => (
                <div key={example.operationCode} className="flex justify-between gap-4 rounded-lg border p-3 text-sm">
                  <span>{example.displayName}</span>
                  <strong className="tabular-nums">{tr('up to', 'hasta')} {example.maxOperations?.toLocaleString() ?? '—'}</strong>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <p className="text-xs opacity-70">
        {tr('Informational estimate based on current Prompt Credit prices. It does not guarantee a fixed number of generations or grant credits. Founder Credits become available only after a successfully funded campaign, funds received, and backer verification.', 'Estimación informativa basada en los precios actuales de Prompt Credits. No garantiza un número fijo de generaciones y no acredita créditos. Los Founder Credits se habilitan solo después de una campaña financiada, fondos recibidos y verificación del backer.')}
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return <div className="rounded-lg border p-3"><div className="text-xs opacity-70">{label}</div><strong className="tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</strong></div>;
}
