'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Bookmark, Download, History, Loader2, Package, ReceiptText, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trackAnalyticsEvent } from '@/lib/analytics';

type Purchase = { id: string; productId: string; productName: string; productKind: string; price: number; currency: string; receiptUrl: string | null; downloadCount: number; maxDownloads: number; purchasedAt: string };
type Saved = { itemKind: string; itemId: string; title: string; imageUrl: string | null; href: string; createdAt: string };
type Chat = { _id: string; title: string; mode: 'image' | 'video' | 'project'; updatedAt: string };

export default function LibraryClient({ checkoutSuccess }: { checkoutSuccess: boolean }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [history, setHistory] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [purchaseResponse, savedResponse, historyResponse] = await Promise.all([
      fetch('/api/purchases', { cache: 'no-store' }),
      fetch('/api/saved', { cache: 'no-store' }),
      fetch('/api/ai/chats', { cache: 'no-store' }),
    ]);
    if (!purchaseResponse.ok || !savedResponse.ok || !historyResponse.ok) throw new Error('No se pudo cargar tu biblioteca.');
    const [purchasePayload, savedPayload, historyPayload] = await Promise.all([
      purchaseResponse.json() as Promise<{ purchases: Purchase[] }>,
      savedResponse.json() as Promise<{ items: Saved[] }>,
      historyResponse.json() as Promise<{ chats: Chat[] }>,
    ]);
    setPurchases(purchasePayload.purchases);
    setSaved(savedPayload.items);
    setHistory(historyPayload.chats.slice(0, 12));
    return purchasePayload.purchases;
  }, []);

  useEffect(() => {
    let cancelled = false;
    trackAnalyticsEvent('user_library_return', { action_source: 'dashboard_library' });
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
        return;
      }
      const response = await fetch(`/api/purchases/${encodeURIComponent(purchase.id)}/download-token`, { method: 'POST' });
      const payload = await response.json() as { downloadUrl?: string; error?: string };
      if (!response.ok || !payload.downloadUrl) throw new Error(payload.error ?? 'No se pudo firmar la descarga.');
      window.location.assign(payload.downloadUrl);
    } catch (reason) { setError((reason as Error).message); }
    finally { setDownloading(null); }
  };

  if (loading) return <main className="flex min-h-72 flex-1 items-center justify-center"><Loader2 className="size-6 animate-spin" aria-label="Cargando biblioteca" /></main>;

  const empty = purchases.length === 0 && saved.length === 0 && history.length === 0;
  return (
    <main className="flex-1 space-y-8 p-5 md:p-8">
      <div><Badge className="mb-3"><Bookmark className="mr-1 size-3.5"/>Tu biblioteca</Badge><h1 className="text-3xl font-black">Biblioteca</h1><p className="mt-2 text-sm text-muted-foreground">Vuelve a tus guardados, creaciones recientes y compras.</p></div>
      {checkoutSuccess ? <div className="rounded-xl border p-4 text-sm"><strong>Pago recibido.</strong> La biblioteca se actualizará cuando Stripe confirme la compra.</div> : null}
      {error ? <div className="rounded-xl border border-red-200 p-4 text-sm text-red-700">{error}<Button variant="link" onClick={() => void load()}>Reintentar</Button></div> : null}
      {empty ? <Card><CardContent className="py-16 text-center"><Bookmark className="mx-auto size-10 text-muted-foreground"/><p className="mt-4 font-bold">Tu biblioteca está lista para tu primer recurso.</p><Button className="mt-4" asChild><Link href="/prompts">Explorar prompts</Link></Button></CardContent></Card> : null}

      {saved.length > 0 ? <section><h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Bookmark className="size-5"/>Guardados y favoritos</h2><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{saved.map(item => <Card key={`${item.itemKind}:${item.itemId}`}><CardHeader><CardTitle className="text-base">{item.title}</CardTitle><CardDescription>{item.itemKind}</CardDescription></CardHeader><CardContent><Button variant="outline" asChild><Link href={item.href}>Abrir flujo</Link></Button></CardContent></Card>)}</div></section> : null}

      {history.length > 0 ? <section><h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><History className="size-5"/>Actividad reciente</h2><div className="grid gap-3 md:grid-cols-2">{history.map(chat => <Card key={chat._id}><CardHeader><CardTitle className="text-base">{chat.title}</CardTitle><CardDescription>{chat.mode} · {new Date(chat.updatedAt).toLocaleDateString()}</CardDescription></CardHeader><CardContent><Button variant="outline" asChild><Link href={`/dashboard/ai?chat=${encodeURIComponent(chat._id)}`}>Continuar</Link></Button></CardContent></Card>)}</div></section> : null}

      {purchases.length > 0 ? <section><h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Package className="size-5"/>Compras</h2><div className="grid gap-4 lg:grid-cols-2">{purchases.map(purchase => <Card key={purchase.id}><CardHeader><div className="flex justify-between gap-3"><div><CardTitle className="text-lg">{purchase.productName}</CardTitle><CardDescription>{new Date(purchase.purchasedAt).toLocaleDateString()}</CardDescription></div><ShieldCheck className="size-5"/></div></CardHeader><CardContent><div className="flex gap-2"><Button disabled={downloading === purchase.id || purchase.downloadCount >= purchase.maxDownloads} onClick={() => void download(purchase)}><Download className="mr-2 size-4"/>{downloading === purchase.id ? 'Firmando…' : 'Descargar'}</Button>{purchase.receiptUrl ? <Button variant="outline" asChild><a href={purchase.receiptUrl} target="_blank" rel="noopener noreferrer"><ReceiptText className="mr-2 size-4"/>Recibo</a></Button> : null}</div></CardContent></Card>)}</div></section> : null}
    </main>
  );
}
