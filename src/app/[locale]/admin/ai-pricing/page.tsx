'use client';

import { useEffect, useState } from 'react';

type Operation = { operationCode: string; displayName: string; category: string; creditCost: number; catalogCreditCost: number; enabled: boolean; minimumMarginPercent: number; overridden: boolean };
type Provider = { id: string; provider: string; modelId: string; currency: string; inputCostPerMillionTokens: number | null; outputCostPerMillionTokens: number | null; imageCostUsd: number | null; videoCostPerSecondUsd: number | null; enabled: boolean; verifiedAt: string | null };

export default function AdminAIPricingPage() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  const load = () => fetch('/api/admin/ai/pricing', { cache: 'no-store' }).then((r) => r.ok ? r.json() : null).then((data) => {
    setOperations(data?.pricing?.operations ?? []);
    setProviders(data?.pricing?.providers ?? []);
  });
  useEffect(() => { void load(); }, []);

  async function save(operation: Operation) {
    await fetch('/api/admin/ai/pricing', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(operation) });
    await load();
  }

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6">
      <header><h1 className="text-2xl font-semibold">AI Pricing Admin</h1><p className="text-sm opacity-70">Prompt Credit prices, margin guards and provider cost references.</p></header>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Operations</h2>
        <div className="overflow-x-auto rounded-lg border"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="p-3 text-left">Operation</th><th>Catalog</th><th>Credits</th><th>Min margin %</th><th>Enabled</th><th></th></tr></thead><tbody>
          {operations.map((op, index) => <tr key={op.operationCode} className="border-b last:border-0"><td className="p-3"><strong>{op.displayName}</strong><div className="text-xs opacity-60">{op.operationCode}</div></td><td className="p-3 text-center">{op.catalogCreditCost}</td><td className="p-3"><input aria-label={`${op.operationCode} credits`} className="w-24 rounded border px-2 py-1" type="number" min="0" value={op.creditCost} onChange={(e) => setOperations((rows) => rows.map((row, i) => i === index ? { ...row, creditCost: Number(e.target.value) } : row))}/></td><td className="p-3"><input aria-label={`${op.operationCode} minimum margin`} className="w-20 rounded border px-2 py-1" type="number" min="0" max="100" value={op.minimumMarginPercent} onChange={(e) => setOperations((rows) => rows.map((row, i) => i === index ? { ...row, minimumMarginPercent: Number(e.target.value) } : row))}/></td><td className="p-3 text-center"><input type="checkbox" checked={op.enabled} onChange={(e) => setOperations((rows) => rows.map((row, i) => i === index ? { ...row, enabled: e.target.checked } : row))}/></td><td className="p-3"><button type="button" className="rounded border px-3 py-1" onClick={() => void save(op)}>Save</button></td></tr>)}
        </tbody></table></div>
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Provider pricing reference</h2>
        <div className="grid gap-3 md:grid-cols-2">{providers.map((p) => <div key={p.id} className="rounded-lg border p-4"><strong>{p.provider} / {p.modelId}</strong><div className="mt-2 text-sm">Input/M tokens: {p.inputCostPerMillionTokens ?? '—'} · Output/M tokens: {p.outputCostPerMillionTokens ?? '—'}</div><div className="text-sm">Image: {p.imageCostUsd ?? '—'} USD · Video/sec: {p.videoCostPerSecondUsd ?? '—'} USD</div><div className="mt-1 text-xs opacity-60">{p.enabled ? 'Enabled' : 'Disabled'} · Verified: {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString() : 'unverified'}</div></div>)}</div>
      </section>
    </main>
  );
}
