'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';

type ProgressPayload = {
  raisedCents: number;
  goalCents: number;
  backers: number;
  percent: number;
};

const EMPTY: ProgressPayload = { raisedCents: 0, goalCents: 2_500_000, backers: 0, percent: 0 };

export function CrowdfundingProgress() {
  const locale = useLocale();
  const es = locale.startsWith('es');
  const [progress, setProgress] = useState<ProgressPayload>(EMPTY);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/crowdfunding/progress', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json() as Partial<ProgressPayload>;
        if (cancelled) return;
        setProgress({
          raisedCents: Number(data.raisedCents ?? 0),
          goalCents: Number(data.goalCents ?? 2_500_000),
          backers: Number(data.backers ?? 0),
          percent: Number(data.percent ?? 0),
        });
      } catch {
        // Keep the last known value; progress is informational and must not block checkout.
      }
    };

    void load();
    const interval = window.setInterval(load, 15_000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const raised = useMemo(() => (progress.raisedCents / 100).toLocaleString(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }), [progress.raisedCents, locale]);

  const goal = useMemo(() => (progress.goalCents / 100).toLocaleString(locale, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }), [progress.goalCents, locale]);

  const width = Math.min(100, Math.max(0, progress.percent));

  return (
    <section className="mt-8 rounded-2xl border border-blue-500/20 bg-white/[.04] p-5 sm:p-6" aria-live="polite">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-300">
            {es ? 'Progreso de la campaña' : 'Campaign progress'}
          </p>
          <p className="mt-2 text-2xl font-black text-white">
            {raised} <span className="text-base font-semibold text-slate-400">{es ? 'recaudados de' : 'raised of'} {goal}</span>
          </p>
        </div>
        <p className="text-sm font-semibold text-slate-300">
          {width.toFixed(width >= 10 ? 0 : 1)}% · {progress.backers} {es ? 'aportantes' : 'backers'}
        </p>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Number(width.toFixed(1))}>
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-[width] duration-700"
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        {es
          ? 'Se actualiza con pagos de crowdfunding confirmados exitosamente por Stripe. Los reembolsos dejan de contar en el total.'
          : 'Updated from crowdfunding payments successfully confirmed by Stripe. Refunded contributions are removed from the total.'}
      </p>
    </section>
  );
}
