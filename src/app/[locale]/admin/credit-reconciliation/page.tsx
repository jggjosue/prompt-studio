'use client';

import { useEffect, useState } from 'react';

type Reconciliation = { generatedAt: string; counts: { purchases: number; purchaseAnalytics: number; accounts: number; issues: number; critical: number; warnings: number }; issues: Array<Record<string, any>> };

export default function CreditReconciliationPage() {
  const [data, setData] = useState<Reconciliation | null>(null);
  useEffect(() => { void fetch('/api/admin/ai/credit-reconciliation', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((v) => setData(v?.reconciliation ?? null)); }, []);
  if (!data) return <main className="mx-auto max-w-7xl p-6">Running reconciliation…</main>;
  return <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header><h1 className="text-2xl font-semibold">Prompt Credit Reconciliation</h1><p className="text-sm opacity-70">Read-only financial audit. No balances are modified automatically.</p></header>
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5"><Metric label="Stripe purchases" value={data.counts.purchases}/><Metric label="Analytics receipts" value={data.counts.purchaseAnalytics}/><Metric label="Issues" value={data.counts.issues}/><Metric label="Critical" value={data.counts.critical}/><Metric label="Warnings" value={data.counts.warnings}/></section>
    <div className="overflow-x-auto rounded-lg border"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left">Severity</th><th>Code</th><th>User</th><th>Purchase</th><th>Exposure credits</th></tr></thead><tbody>
      {data.issues.map((issue, index) => <tr key={String(issue.code) + index} className="border-b last:border-0"><td className="p-3">{String(issue.severity)}</td><td className="p-3 font-mono text-xs">{String(issue.code)}</td><td className="p-3">{String(issue.userId ?? '—')}</td><td className="p-3">{String(issue.purchaseId ?? '—')}</td><td className="p-3 text-center">{issue.exposureCredits == null ? '—' : String(issue.exposureCredits)}</td></tr>)}
    </tbody></table></div>
  </main>;
}

function Metric({ label, value }: { label: string; value: number }) { return <div className="rounded-lg border p-4"><div className="text-sm opacity-70">{label}</div><strong className="text-xl tabular-nums">{value}</strong></div>; }
