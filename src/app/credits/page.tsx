'use client';

import { useEffect, useState } from 'react';

type Dashboard = {
  balances: {
    balance: number;
    promotionalCredits: number;
    subscriptionCredits: number;
    purchasedCredits: number;
    founderCredits: number;
    reserved: number;
    lifetimeSpent: number;
  };
  summary: { usage: number; grants: number; lifetimeSpent: number };
  transactions: Array<{
    id: string;
    operation: string;
    type: string | null;
    amount: number;
    balanceImpact: number;
    source: string;
    operationName: string | null;
    expiresAt: string | null;
    createdAt: string;
  }>;
};

export default function CreditsPage() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);

  useEffect(() => {
    void fetch('/api/ai/credits/dashboard', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setDashboard(data?.dashboard ?? null));
  }, []);

  if (!dashboard) return <main className="mx-auto max-w-5xl p-4 sm:p-6">Cargando Prompt Credits…</main>;

  const b = dashboard.balances;
  const buckets = [
    ['Monthly', b.subscriptionCredits],
    ['Purchased', b.purchasedCredits],
    ['Founder', b.founderCredits],
    ['Promotional', b.promotionalCredits],
  ] as const;

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-2xl font-semibold">Prompt Credits</h1>
        <p className="text-sm opacity-70">Saldo, uso e historial de tu cuenta.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {buckets.map(([label, value]) => (
          <div key={label} className="rounded-lg border p-4">
            <div className="text-sm opacity-70">{label}</div>
            <div className="mt-1 text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-4"><div className="text-sm opacity-70">Total</div><strong>{b.balance.toLocaleString()}</strong></div>
        <div className="rounded-lg border p-4"><div className="text-sm opacity-70">Reservados</div><strong>{b.reserved.toLocaleString()}</strong></div>
        <div className="rounded-lg border p-4"><div className="text-sm opacity-70">Uso acumulado</div><strong>{dashboard.summary.lifetimeSpent.toLocaleString()}</strong></div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Historial</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b"><th className="p-3 text-left">Fecha</th><th className="p-3 text-left">Tipo</th><th className="p-3 text-left">Fuente</th><th className="p-3 text-right">Créditos</th><th className="p-3 text-left">Expira</th></tr></thead>
            <tbody>
              {dashboard.transactions.map((tx) => (
                <tr key={tx.id} className="border-b last:border-0">
                  <td className="p-3">{new Date(tx.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">{tx.type ?? tx.operation}</td>
                  <td className="p-3">{tx.source}</td>
                  <td className="p-3 text-right tabular-nums">{tx.balanceImpact > 0 ? '+' : ''}{tx.balanceImpact.toLocaleString()}</td>
                  <td className="p-3">{tx.expiresAt ? new Date(tx.expiresAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
