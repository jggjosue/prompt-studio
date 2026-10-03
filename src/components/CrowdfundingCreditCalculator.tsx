'use client';

import { useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { trackInterest } from '@/lib/interest-analytics';

type Estimate = {
  pledgeAmountCents: number;
  baseCredits: number;
  bonusPercent: number;
  bonusCredits: number;
  totalCredits: number;
  examples: Array<{ operationCode: string; displayName: string; creditCost: number; maxOperations: number | null }>;
};

const TIERS = [10, 25, 50, 100, 250, 500, 1000] as const;

export function CrowdfundingCreditCalculator({ amount, onAmountChange }: { amount: number; onAmountChange: (amount: number) => void }) {
  const es = useLocale().startsWith('es');
  const tr = (en: string, spanish: string) => es ? spanish : en;
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [customInput, setCustomInput] = useState('');

  const effectiveAmount = customInput ? Number(customInput) : amount;

  useEffect(() => {
    const amtCents = Math.round(effectiveAmount * 100);
    if (!Number.isFinite(effectiveAmount) || effectiveAmount < 10) return;
    const controller = new AbortController();
    void fetch('/api/crowdfunding/credits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ pledgeAmountCents: amtCents }),
    }).then((response) => response.ok ? response.json() : null)
      .then((data) => setEstimate(data?.estimate ?? null))
      .catch(() => undefined);
    return () => controller.abort();
  }, [effectiveAmount]);

  const handleCustomChange = (value: string) => {
    setCustomInput(value);
    const parsed = Number(value);
    if (value.trim() && Number.isFinite(parsed) && parsed >= 10) {
      onAmountChange(parsed);
    }
  };

  const handlePresetClick = (tier: number) => {
    setCustomInput('');
    trackInterest('crowdfunding_calculator_click', { amount_usd: tier });
    onAmountChange(tier);
  };

  return (
    <section className="space-y-4 rounded-xl border p-4 sm:p-6">
      <div>
        <h2 className="text-xl font-semibold">{tr('Founder Credits Calculator', 'Calculadora de Founder Credits')}</h2>
        <p className="text-sm opacity-70">{tr('Choose a contribution or enter a custom amount to see your Founder Credits.', 'Elige un aporte o escribe un monto personalizado para ver tus Founder Credits.')}</p>
        <p className="mt-1 text-xs text-blue-400/80">1 Prompt Credit = $0.01 USD · {tr('bonus increases with contribution size', 'el bonus aumenta con el monto aportado')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TIERS.map((tier) => (
          <button
            key={tier}
            type="button"
            onClick={() => handlePresetClick(tier)}
            aria-pressed={!customInput && amount === tier}
            className={`rounded-lg border px-3 py-2 transition ${!customInput && amount === tier ? 'border-blue-400 bg-blue-500/15 text-blue-200' : 'border-white/10 hover:border-blue-400/50 hover:bg-blue-500/10'}`}
          >
            ${tier}
          </button>
        ))}
      </div>

      {/* Custom amount input */}
      <label className="block text-sm font-semibold">
        {tr('Custom amount (USD)', 'Monto personalizado (USD)')}
        <input
          type="number"
          min="10"
          max="10000"
          step="1"
          placeholder={tr('e.g. 75', 'ej. 75')}
          value={customInput}
          onChange={e => handleCustomChange(e.target.value)}
          className="mt-1 h-10 w-full rounded-lg border border-white/15 bg-white/[.06] px-3 text-sm text-white outline-none focus:border-blue-400"
        />
      </label>

      {estimate && (
        <>
          <div className="grid gap-3 sm:grid-cols-4">
            <Metric label={tr('Base', 'Base')} value={estimate.baseCredits} />
            <Metric label={`Bonus ${estimate.bonusPercent}%`} value={estimate.bonusCredits} highlight />
            <Metric label="Founder Credits" value={estimate.totalCredits} />
            <Metric label={tr('Contribution', 'Aporte')} value={`$${estimate.pledgeAmountCents / 100}`} />
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
        {tr(
          'Informational estimate based on current Prompt Credit prices. It does not guarantee a fixed number of generations or grant credits. Founder Credits are recorded as pending after a successful payment and become available only after the campaign ends, funds are received, and the backer is verified. Reaching 100% of the funding goal is not required.',
          'Estimación informativa basada en los precios actuales de Prompt Credits. No garantiza un número fijo de generaciones y no acredita créditos. Los Founder Credits se registran como pendientes después de un pago exitoso y se habilitan solo cuando termina la campaña, se reciben los fondos y se verifica al backer. No es necesario alcanzar el 100% de la meta.'
        )}
      </p>
    </section>
  );
}

function Metric({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'border-emerald-500/30 bg-emerald-500/[.06]' : 'border-blue-500/15 bg-blue-500/[.04]'}`}>
      <div className={`flex items-center gap-1 text-xs ${highlight ? 'text-emerald-300/70' : 'text-blue-200/70'}`}>
        {highlight && <Sparkles className="h-3 w-3" />}
        {label}
      </div>
      <strong className="tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</strong>
    </div>
  );
}
