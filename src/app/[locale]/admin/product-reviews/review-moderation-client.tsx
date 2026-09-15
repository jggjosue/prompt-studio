'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PendingReview = { id: string; productId: string; productKind: string; authorName: string; rating: number; comment: string; verifiedPurchase: boolean; moderationReasons: string[]; createdAt: string | null };

export function ReviewModerationClient() {
  const [reviews, setReviews] = useState<PendingReview[] | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/product-reviews?status=pending', { cache: 'no-store' });
      if (!response.ok) throw new Error(response.status === 403 ? 'Esta página es solo para administración.' : 'No se pudo cargar la cola.');
      const payload = await response.json() as { reviews: PendingReview[] };
      setReviews(payload.reviews); setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Error de red.');
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const decide = async (id: string, status: 'published' | 'rejected') => {
    const response = await fetch('/api/admin/product-reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) { setError('No se pudo aplicar la decisión.'); return; }
    setReviews(current => current?.filter(review => review.id !== id) ?? null);
  };

  if (error) return <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>;
  if (!reviews) return <p className="text-sm text-muted-foreground">Cargando cola…</p>;
  if (!reviews.length) return <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">No hay reseñas pendientes.</div>;

  return (
    <div className="space-y-4">
      {reviews.map(review => (
        <article key={review.id} className="rounded-2xl border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{review.authorName} {review.verifiedPurchase && <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs"><ShieldCheck className="size-3" /> Compra verificada</span>}</p>
              <p className="text-xs text-muted-foreground">{review.productKind} · {review.productId} · {review.createdAt ? new Date(review.createdAt).toLocaleString() : '—'}</p>
            </div>
            <div className="flex" aria-label={`${review.rating} de 5`}>
              {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`size-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />)}
            </div>
          </div>
          <p className="mt-3 text-sm leading-6">“{review.comment}”</p>
          {review.moderationReasons.length > 0 && <p className="mt-2 text-sm text-amber-600 dark:text-amber-500">Retenida por: {review.moderationReasons.join(', ')}</p>}
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => void decide(review.id, 'published')}>Publicar</Button>
            <Button size="sm" variant="outline" onClick={() => void decide(review.id, 'rejected')}>Rechazar</Button>
          </div>
        </article>
      ))}
    </div>
  );
}
