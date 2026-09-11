'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { trackAnalyticsEvent } from '@/lib/analytics';

type Pack = { id: string; name: string; description: string; credits: number; bonusCredits: number; price: string; currency: string; featured: boolean; savingsPercent: number };
type Purchase = { id: string; packId: string; credits: number; amountPaidCents: number; currency: string; status: string; receiptUrl: string | null; purchasedAt: string | null };
type Payload = { credits: { balance: number; reserved: number; lifetimeSpent: number }; packs: Pack[]; purchases: Purchase[] };
type CheckoutResponse = { clientSecret: string; publishableKey: string; sessionId: string; pack: { id: string; name: string; credits: number; price: string; currency: string } };
type EmbeddedCheckout = { mount: (target: string | HTMLElement) => void; destroy: () => void };
type StripeBrowser = { initEmbeddedCheckout: (options: { clientSecret: string }) => Promise<EmbeddedCheckout> };
declare global { interface Window { Stripe?: (publishableKey: string) => StripeBrowser } }

let stripeScriptPromise: Promise<void> | null = null;
function loadStripeScript(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  if (stripeScriptPromise) return stripeScriptPromise;
  stripeScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');
    if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => reject(new Error('No se pudo cargar Stripe.')), { once: true }); return; }
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/'; script.async = true;
    script.onload = () => resolve(); script.onerror = () => reject(new Error('No se pudo cargar Stripe.'));
    document.head.appendChild(script);
  });
  return stripeScriptPromise;
}

export function CreditsClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState('');
  const [activePack, setActivePack] = useState<string | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [justPaid, setJustPaid] = useState(false);
  const mountRef = useRef<HTMLDivElement | null>(null);
  const embeddedRef = useRef<EmbeddedCheckout | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/credits', { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo cargar tu saldo.');
      setData(await response.json() as Payload);
      setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Error de red.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Al volver de Stripe el webhook puede tardar un instante en abonar el saldo,
  // así que se reconsulta varias veces antes de dar la recarga por perdida.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') !== 'success') return;
    setJustPaid(true);
    window.history.replaceState({}, '', window.location.pathname);
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      void load();
      if (attempts >= 5) window.clearInterval(timer);
    }, 2000);
    return () => window.clearInterval(timer);
  }, [load]);

  const openCheckout = useCallback(async (pack: Pack) => {
    setActivePack(pack.id); setCheckout(null); setError('');
    try {
      const response = await fetch('/api/credits/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId: pack.id }),
      });
      const payload = await response.json() as CheckoutResponse & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? 'No se pudo iniciar la recarga.');
      setCheckout(payload);
      trackAnalyticsEvent('credit_topup_click', { item_id: pack.id, item_name: pack.name, value: pack.credits, currency: pack.currency.toUpperCase() });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Error de red.');
      setActivePack(null);
    }
  }, []);

  useEffect(() => {
    if (!checkout || !mountRef.current) return;
    let active = true;
    void loadStripeScript().then(async () => {
      const stripe = window.Stripe?.(checkout.publishableKey);
      if (!stripe) throw new Error('Stripe no está disponible.');
      const embedded = await stripe.initEmbeddedCheckout({ clientSecret: checkout.clientSecret });
      if (!active || !mountRef.current) { embedded.destroy(); return; }
      embeddedRef.current = embedded;
      embedded.mount(mountRef.current);
    }).catch(reason => { if (active) setError((reason as Error).message); });
    return () => { active = false; embeddedRef.current?.destroy(); embeddedRef.current = null; };
  }, [checkout]);

  const closeCheckout = () => { embeddedRef.current?.destroy(); embeddedRef.current = null; setActivePack(null); setCheckout(null); };

  if (!data && !error) return <p className="text-sm text-muted-foreground">Cargando saldo…</p>;

  return (
    <div className="space-y-8">
      {justPaid && <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-400"><Check className="size-4" /> Pago recibido. Tu saldo se actualiza en unos segundos.</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

      {data && <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="Disponibles" value={`${data.credits.balance.toFixed(1)} créditos`} />
        <Metric label="Reservados" value={`${data.credits.reserved.toFixed(1)} créditos`} />
        <Metric label="Consumidos" value={`${data.credits.lifetimeSpent.toFixed(1)} créditos`} />
      </div>}

      <section>
        <h2 className="mb-4 text-lg font-bold">Recargar</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {data?.packs.map(pack => (
            <article key={pack.id} className={`relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm ${pack.featured ? 'border-primary ring-1 ring-primary/30' : ''}`}>
              {pack.featured && <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">Más elegido</span>}
              <p className="text-2xl font-bold">{pack.credits} <span className="text-base font-medium text-muted-foreground">créditos</span></p>
              {pack.bonusCredits > 0 && <p className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400"><Sparkles className="size-3.5" /> {pack.bonusCredits} de regalo incluidos</p>}
              <p className="mt-3 text-sm text-muted-foreground">{pack.description}</p>
              <p className="mt-4 text-xl font-semibold">{pack.price}</p>
              {pack.savingsPercent > 0 && <p className="text-xs text-muted-foreground">Ahorras un {pack.savingsPercent}% por crédito</p>}
              <Button className="mt-5 w-full" onClick={() => void openCheckout(pack)} disabled={activePack === pack.id}>
                {activePack === pack.id ? <><Loader2 className="mr-2 size-4 animate-spin" /> Abriendo…</> : 'Recargar'}
              </Button>
            </article>
          ))}
        </div>
      </section>

      {data && data.purchases.length > 0 && <section>
        <h2 className="mb-4 text-lg font-bold">Historial de recargas</h2>
        <div className="overflow-x-auto rounded-2xl border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left"><tr><th scope="col" className="p-3 font-medium">Fecha</th><th scope="col" className="p-3 font-medium">Créditos</th><th scope="col" className="p-3 font-medium">Importe</th><th scope="col" className="p-3 font-medium">Estado</th><th scope="col" className="p-3 font-medium">Recibo</th></tr></thead>
            <tbody>
              {data.purchases.map(purchase => (
                <tr key={purchase.id} className="border-t">
                  <td className="p-3">{purchase.purchasedAt ? new Date(purchase.purchasedAt).toLocaleDateString() : '—'}</td>
                  <td className="p-3">{purchase.credits}</td>
                  <td className="p-3">{(purchase.amountPaidCents / 100).toFixed(2)} {purchase.currency.toUpperCase()}</td>
                  <td className="p-3">{statusLabels[purchase.status] ?? purchase.status}</td>
                  <td className="p-3">{purchase.receiptUrl ? <a className="underline" href={purchase.receiptUrl} target="_blank" rel="noopener noreferrer">Ver</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>}

      <Dialog open={Boolean(checkout)} onOpenChange={open => { if (!open) closeCheckout(); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{checkout?.pack.name ?? 'Recarga de créditos'}</DialogTitle></DialogHeader>
          <div ref={mountRef} className="min-h-[420px]" />
        </DialogContent>
      </Dialog>
    </div>
  );
}

const statusLabels: Record<string, string> = { pending: 'Procesando', credited: 'Abonada', refunded: 'Reembolsada' };

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold">{value}</p></div>;
}
