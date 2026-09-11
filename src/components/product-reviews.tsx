'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, ShieldCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Review = { id: string; authorName: string; rating: number; comment: string; verifiedPurchase: boolean; createdAt: string | null };
type Summary = { rating: number | null; ratingCount: number; distribution: Record<string, number>; verifiedCount: number };
type Own = { rating: number; comment: string; status: string; moderationReasons: string[] } | null;
type Eligibility = { canReview: boolean; verifiedPurchase: boolean; reason: string } | null;
type Payload = { summary: Summary; reviews: Review[]; own: Own; eligibility: Eligibility };

const STARS = [1, 2, 3, 4, 5];

/**
 * Reseñas de producto.
 *
 * Se pinta en cliente a propósito: las fichas de producto son estáticas (810
 * páginas prerenderizadas) y una reseña escrita hoy debe verse hoy, no en el
 * siguiente despliegue.
 */
export function ProductReviews({
  productId,
  slug,
  productKind = 'web-page',
  initialSummary = null,
}: {
  productId: string;
  slug?: string;
  productKind?: string;
  /**
   * Resumen calculado en servidor desde `review-aggregates.json`.
   *
   * Sirve para que la nota aparezca en el HTML inicial y no solo tras hidratar:
   * el `aggregateRating` del JSON-LD afirma una valoración, y Google exige que
   * esa valoración sea visible en la página. Sin esto el marcado prometería
   * algo que el rastreador podría no ver.
   */
  initialSummary?: { rating: number; ratingCount: number } | null;
}) {
  const [data, setData] = useState<Payload | null>(
    initialSummary
      ? {
          summary: {
            rating: initialSummary.rating,
            ratingCount: initialSummary.ratingCount,
            distribution: {},
            verifiedCount: 0,
          },
          reviews: [],
          own: null,
          eligibility: null,
        }
      : null
  );
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const params = new URLSearchParams({ productId });
    if (slug) params.set('slug', slug);
    // Dos peticiones a propósito: la lista pública se cachea en CDN y la parte
    // personalizada no puede cachearse nunca. El 401 del anónimo es barato.
    const [publicResponse, mineResponse] = await Promise.all([
      fetch(`/api/product-reviews?${params}`),
      fetch(`/api/product-reviews/me?${params}`, { cache: 'no-store' }),
    ]);
    if (!publicResponse.ok) return;
    const listing = await publicResponse.json() as { summary: Summary; reviews: Review[] };
    const mine = mineResponse.ok
      ? await mineResponse.json() as { own: Own; eligibility: Eligibility }
      : { own: null, eligibility: null };
    setData({ ...listing, ...mine });
    if (mine.own) { setRating(mine.own.rating); setComment(mine.own.comment); }
  }, [productId, slug]);

  useEffect(() => { void load(); }, [load]);

  const submit = async () => {
    setSending(true); setError(''); setNotice('');
    try {
      const response = await fetch('/api/product-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, slug, productKind, rating, comment }),
      });
      const payload = await response.json() as { error?: string; status?: string };
      if (!response.ok) throw new Error(payload.error ?? 'No se pudo guardar tu reseña.');
      setNotice(payload.status === 'pending'
        ? 'Recibida. La revisamos antes de publicarla.'
        : 'Publicada. Gracias por contarlo.');
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Error de red.');
    } finally {
      setSending(false);
    }
  };

  if (!data) return null;
  const { summary, reviews, own, eligibility } = data;
  // Sin reseñas y sin poder escribirla, la sección no aporta nada: no se pinta.
  if (!summary.ratingCount && !eligibility?.canReview) return null;

  return (
    <section aria-labelledby="product-reviews-title" className="mt-14 border-t pt-10">
      <h2 id="product-reviews-title" className="text-2xl font-bold tracking-tight font-headline">Opiniones de quienes lo usan</h2>

      {summary.ratingCount > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="text-center sm:text-left">
            <p className="text-4xl font-black">{summary.rating?.toFixed(1)}</p>
            <div className="mt-1 flex justify-center gap-0.5 sm:justify-start" aria-label={`${summary.rating} de 5`}>
              {STARS.map(star => <Star key={star} className={`size-4 ${star <= Math.round(summary.rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />)}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{summary.ratingCount} {summary.ratingCount === 1 ? 'opinión' : 'opiniones'}</p>
          </div>
          <div className="space-y-1">
            {[5, 4, 3, 2, 1].map(star => {
              const count = summary.distribution[String(star)] ?? 0;
              const percent = summary.ratingCount ? Math.round((count / summary.ratingCount) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-6 text-muted-foreground">{star}★</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full bg-amber-400" style={{ width: `${percent}%` }} /></div>
                  <span className="w-8 text-right text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {eligibility?.canReview && (
        <div className="mt-8 rounded-2xl border bg-card p-5">
          <h3 className="font-semibold">{own ? 'Edita tu opinión' : 'Cuenta tu experiencia'}</h3>
          {own?.status === 'pending' && <p className="mt-2 text-sm text-amber-600 dark:text-amber-500">Tu reseña está en revisión{own.moderationReasons.length ? `: ${own.moderationReasons.join(', ')}` : ''}.</p>}
          <div className="mt-3 flex gap-1" role="radiogroup" aria-label="Puntuación">
            {STARS.map(star => (
              <button key={star} type="button" role="radio" aria-checked={rating === star} aria-label={`${star} de 5`} onClick={() => setRating(star)} className="rounded p-0.5 focus-visible:outline focus-visible:outline-2">
                <Star className={`size-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground'}`} />
              </button>
            ))}
          </div>
          <textarea
            className="mt-3 min-h-24 w-full rounded-xl border bg-background p-3 text-sm"
            placeholder="¿Para qué lo usaste y qué tal te fue?"
            value={comment}
            maxLength={1500}
            onChange={event => setComment(event.target.value)}
          />
          {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
          {notice && <p role="status" className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}
          <Button className="mt-3" disabled={sending || rating === 0 || comment.trim().length < 15} onClick={() => void submit()}>
            {sending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Guardando…</> : own ? 'Actualizar' : 'Publicar opinión'}
          </Button>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {reviews.map(review => (
            <blockquote key={review.id} className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex" aria-label={`${review.rating} de 5`}>
                  {STARS.map(star => <Star key={star} className={`size-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />)}
                </div>
                {review.verifiedPurchase && <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium"><ShieldCheck className="size-3" /> Compra verificada</span>}
              </div>
              <p className="text-sm leading-6">“{review.comment}”</p>
              <footer className="mt-3 text-sm font-semibold">{review.authorName}{review.createdAt ? <span className="ml-2 font-normal text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</span> : null}</footer>
            </blockquote>
          ))}
        </div>
      )}
    </section>
  );
}
