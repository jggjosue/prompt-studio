'use client';

import { useEffect, useState } from 'react';

type Analytics = { days: number; totals: Record<string, number | null>; operations: Array<any> };

export default function CreditEconomyPage() {
  const [data, setData] = useState<Analytics | null>(null);
  useEffect(() => { void fetch('/api/admin/ai/credit-economy?days=30', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((v) => setData(v?.analytics ?? null)); }, []);
  if (!data) return <main className="mx-auto max-w-7xl p-6">Loading credit economy…</main>;
  const t = data.totals;
  const coverage = Number(t.jobs) > 0 ? (Number(t.jobsWithActualCost) / Number(t.jobs)) * 100 : 0;
  return <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header><h1 className="text-2xl font-semibold">Prompt Credit Economy</h1><p className="text-sm opacity-70">Last {data.days} days · actual provider-cost coverage {coverage.toFixed(1)}%</p></header>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Metric label="Credits charged" value={Number(t.creditsCharged).toLocaleString()} />
      <Metric label="Provider cost" value={'$' + Number(t.providerCostUsd).toFixed(2)} />
      <Metric label="Commercial value" value={'$' + Number(t.commercialValueUsd).toFixed(2)} />
      <Metric label="Gross margin" value={t.marginPercent == null ? '—' : Number(t.marginPercent).toFixed(1) + '%'} />
    </section>
    <div className="overflow-x-auto rounded-lg border"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left">Operation</th><th>Provider/model</th><th>Jobs</th><th>Failed</th><th>Credits</th><th>Cost USD</th><th>Margin</th><th>Cost coverage</th></tr></thead><tbody>
      {data.operations.map((row) => <tr key={JSON.stringify(row._id)} className="border-b last:border-0"><td className="p-3">{row._id.operationCode}</td><td className="p-3">{row._id.provider}/{row._id.modelId}</td><td className="p-3 text-center">{row.jobs}</td><td className="p-3 text-center">{row.failed}</td><td className="p-3 text-center">{row.creditsCharged}</td><td className="p-3 text-center">{'$' + Number(row.providerCostUsd).toFixed(4)}</td><td className="p-3 text-center">{row.marginPercent == null ? '—' : Number(row.marginPercent).toFixed(1) + '%'}</td><td className="p-3 text-center">{row.jobsWithActualCost}/{row.jobs}</td></tr>)}
    </tbody></table></div>
  </main>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border p-4"><div className="text-sm opacity-70">{label}</div><strong className="text-xl tabular-nums">{value}</strong></div>; }
