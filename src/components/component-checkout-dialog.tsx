'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, LockKeyhole, PackageCheck, ReceiptText, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { trackAnalyticsEvent } from '@/lib/analytics';

type CheckoutResponse = { clientSecret: string; publishableKey: string; sessionId: string; product: { id: string; name: string; kind: string; price: string; currency: string } };
type EmbeddedCheckout = { mount: (selector: string | HTMLElement) => void; destroy: () => void };
type StripeBrowser = { initEmbeddedCheckout: (options: { clientSecret: string }) => Promise<EmbeddedCheckout> };
declare global { interface Window { Stripe?: (publishableKey: string) => StripeBrowser } }

let stripeScriptPromise: Promise<void> | null = null;
function loadStripeScript(): Promise<void> {
  if (window.Stripe) return Promise.resolve();
  if (stripeScriptPromise) return stripeScriptPromise;
  stripeScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://js.stripe.com/v3/"]');
    if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => reject(new Error('No se pudo cargar Stripe.')), { once: true }); return; }
    const script = document.createElement('script'); script.src = 'https://js.stripe.com/v3/'; script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error('No se pudo cargar Stripe.')); document.head.appendChild(script);
  });
  return stripeScriptPromise;
}

export function ComponentCheckoutDialog({ id, endpoint = '/api/component-checkout' }: { id: string; name: string; kind: string; endpoint?: string }) {
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [error, setError] = useState('');
  const mountRef = useRef<HTMLDivElement | null>(null);
  const embeddedRef = useRef<EmbeddedCheckout | null>(null);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let active = true;
    setCheckout(null); setError('');
    void fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: id }), signal: controller.signal })
      .then(async response => { const payload = await response.json() as CheckoutResponse & { error?: string }; if (!response.ok) throw new Error(payload.error ?? 'No se pudo iniciar el checkout.'); return payload; })
      .then(payload => { if (active) { setCheckout(payload); trackAnalyticsEvent('component_purchase_click', { item_id: payload.product.id, item_name: payload.product.name, item_category: payload.product.kind, value: Number(payload.product.price.replace(/[^\d.]/g, '')) || undefined, currency: payload.product.currency.toUpperCase(), action_source: 'embedded-checkout-open' }); } })
      .catch(reason => { if (active && (reason as Error).name !== 'AbortError') setError((reason as Error).message); });
    return () => { active = false; controller.abort(); embeddedRef.current?.destroy(); embeddedRef.current = null; };
  }, [endpoint, id, open]);

  useEffect(() => {
    if (!open || !checkout || !mountRef.current) return;
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
  }, [checkout, open]);

  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button variant="outline"><ShoppingCart className="mr-1 size-4"/>Comprar producto</Button></DialogTrigger><DialogContent className="max-h-[94vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Checkout seguro</DialogTitle><DialogDescription>Producto, moneda y precio verificados por el servidor.</DialogDescription></DialogHeader>{!checkout&&!error?<div className="flex min-h-40 items-center justify-center"><Loader2 className="size-6 animate-spin text-blue-600"/><span className="ml-2 text-sm">Preparando sesión segura…</span></div>:null}{error?<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p className="font-bold">No se pudo iniciar el pago</p><p className="mt-1">{error}</p></div>:null}{checkout?<div className="space-y-4"><div className="rounded-2xl border bg-muted/30 p-4"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-muted-foreground">{checkout.product.kind}</p><p className="mt-1 font-black">{checkout.product.name}</p><p className="mt-1 text-xs text-muted-foreground">ID: {checkout.product.id}</p></div><p className="text-2xl font-black">{checkout.product.price}</p></div></div><div className="grid gap-2 text-xs sm:grid-cols-3"><span className="flex items-center gap-2 rounded-xl border p-3"><PackageCheck className="size-4 text-emerald-600"/>Archivos organizados</span><span className="flex items-center gap-2 rounded-xl border p-3"><ReceiptText className="size-4 text-blue-600"/>Recibo disponible</span><span className="flex items-center gap-2 rounded-xl border p-3"><LockKeyhole className="size-4 text-violet-600"/>Descarga firmada</span></div><div ref={mountRef} className="min-h-80 rounded-xl border bg-white p-1"/><p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground"><ShieldCheck className="size-3.5"/>El acceso se concede únicamente después de la confirmación firmada de Stripe.</p></div>:null}</DialogContent></Dialog>;
}
