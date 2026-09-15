'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, Package, ReceiptText, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Purchase = { id: string; productId: string; productName: string; productKind: string; price: number; currency: string; receiptUrl: string | null; downloadCount: number; maxDownloads: number; purchasedAt: string };

export default function LibraryClient({ checkoutSuccess }: { checkoutSuccess: boolean }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(async (): Promise<Purchase[]> => {
    const response = await fetch('/api/purchases', { cache: 'no-store' });
    if (!response.ok) throw new Error('No se pudo cargar tu biblioteca.');
    const payload = await response.json() as { purchases: Purchase[] };
    setPurchases(payload.purchases);
    return payload.purchases;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        for (let attempt = 0; attempt < (checkoutSuccess ? 4 : 1); attempt += 1) {
          const current = await load();
          if (cancelled || !checkoutSuccess || current.length > 0 || attempt === 3) break;
          await new Promise(resolve => window.setTimeout(resolve, 1500));
        }
      } catch (reason) { if (!cancelled) setError((reason as Error).message); }
      finally { if (!cancelled) setLoading(false); }
    };
    void run();
    return () => { cancelled = true; };
  }, [checkoutSuccess, load]);

  const download = async (purchase: Purchase) => {
    setDownloading(purchase.id); setError('');
    try {
      if (purchase.productId.startsWith('marketplace:')) {
        window.location.assign(`/api/marketplace/${encodeURIComponent(purchase.productId.slice('marketplace:'.length))}/download`);
        setPurchases(current => current.map(item => item.id === purchase.id ? { ...item, downloadCount: item.downloadCount + 1 } : item));
        return;
      }
      const response = await fetch(`/api/purchases/${encodeURIComponent(purchase.id)}/download-token`, { method: 'POST' });
      const payload = await response.json() as { downloadUrl?: string; error?: string };
      if (!response.ok || !payload.downloadUrl) throw new Error(payload.error ?? 'No se pudo firmar la descarga.');
      window.location.assign(payload.downloadUrl);
      setPurchases(current => current.map(item => item.id === purchase.id ? { ...item, downloadCount: item.downloadCount + 1 } : item));
    } catch (reason) { setError((reason as Error).message); }
    finally { setDownloading(null); }
  };

  return <main className="flex-1 space-y-6 p-5 md:p-8"><div><Badge className="mb-3 bg-blue-600"><Package className="mr-1 size-3.5"/>Biblioteca del comprador</Badge><h1 className="text-3xl font-black">Mis compras</h1><p className="mt-2 text-sm text-muted-foreground">Recibos y descargas protegidas de tus componentes.</p></div>{checkoutSuccess?<div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900"><strong>Pago recibido.</strong> Stripe está confirmando la compra; la biblioteca se actualiza automáticamente.</div>:null}{error?<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div>:null}{loading?<div className="flex min-h-52 items-center justify-center"><Loader2 className="size-6 animate-spin"/></div>:null}{!loading&&purchases.length===0?<Card><CardContent className="py-16 text-center"><Package className="mx-auto size-10 text-muted-foreground"/><p className="mt-4 font-bold">Todavía no tienes compras individuales.</p></CardContent></Card>:null}<div className="grid gap-4 lg:grid-cols-2">{purchases.map(purchase=><Card key={purchase.id}><CardHeader><div className="flex items-start justify-between gap-3"><div><Badge variant="secondary" className="capitalize">{purchase.productKind}</Badge><CardTitle className="mt-2 text-lg">{purchase.productName}</CardTitle><CardDescription>{new Date(purchase.purchasedAt).toLocaleDateString()} · {new Intl.NumberFormat(undefined,{style:'currency',currency:purchase.currency.toUpperCase()}).format(purchase.price)}</CardDescription></div><ShieldCheck className="size-5 text-emerald-600"/></div></CardHeader><CardContent><p className="mb-3 text-xs text-muted-foreground">Descargas utilizadas: {purchase.downloadCount} de {purchase.maxDownloads}</p><div className="flex gap-2"><Button disabled={downloading===purchase.id||purchase.downloadCount>=purchase.maxDownloads} onClick={()=>void download(purchase)}><Download className="mr-2 size-4"/>{downloading===purchase.id?'Firmando…':'Descargar'}</Button>{purchase.receiptUrl?<Button variant="outline" asChild><a href={purchase.receiptUrl} target="_blank" rel="noopener noreferrer"><ReceiptText className="mr-2 size-4"/>Recibo</a></Button>:null}</div></CardContent></Card>)}</div></main>;
}
