'use client';

import { OptimizedImage } from '@/components/optimized-image';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLandingFavorites } from '@/hooks/use-landing-favorites';
import { resolveWebPageImageUrl } from '@/lib/web-page-media';
import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

function amount(value: string): number {
  const parsed = Number.parseFloat(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function LandingFavoritesCollection() {
  const t = useTranslations('landingPages.favorites');
  const { favorites, removeFavorite } = useLandingFavorites();
  if (favorites.length === 0) return null;

  const subtotal = favorites.reduce((sum, item) => sum + amount(item.price), 0);
  const discountedTotal = subtotal * 0.8;
  const bundleQuery = favorites.map(item => item.demoUrl).join(',');

  return (
    <Dialog>
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
            <Heart className="size-5 fill-current" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold">{t('savedCount', { count: favorites.length })}</p>
            <p className="text-sm text-muted-foreground">{t('discountOffer', { count: favorites.length })}</p>
          </div>
        </div>
        <DialogTrigger asChild>
          <Button>{t('viewCollection')}</Button>
        </DialogTrigger>
      </div>

      <DialogContent className="max-h-[90vh] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('name')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <div className="divide-y rounded-xl border">
          {favorites.map(item => (
            <div key={item.demoUrl} className="flex items-center gap-3 p-3">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                {item.imageUrl ? (
                  <OptimizedImage
                    src={resolveWebPageImageUrl(item.imageUrl)}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/landing-pages/${item.demoUrl}`} className="line-clamp-1 text-sm font-semibold hover:underline">
                  {item.title}
                </Link>
                <p className="text-sm text-muted-foreground">${amount(item.price).toFixed(2)}</p>
              </div>
              <button
                type="button"
                aria-label={t('remove', { name: item.title })}
                onClick={() => removeFavorite(item.demoUrl)}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-muted/60 p-4">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{t('subtotal')}</span><span className="line-through">${subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-end justify-between">
            <span className="font-semibold">{t('bundleTotal')}</span>
            <span className="text-2xl font-black">${discountedTotal.toFixed(2)}</span>
          </div>
        </div>

        <BundleCheckoutButton favorites={favorites} discountedTotal={discountedTotal} />
      </DialogContent>
    </Dialog>
  );
}

function BundleCheckoutButton({ favorites, discountedTotal }: { favorites: any[]; discountedTotal: number }) {
  const t = useTranslations('landingPages.favorites');
  const [loading, setLoading] = useState(false);

  async function handleBuyBundle() {
    setLoading(true);
    try {
      const response = await fetch('/api/component-bundle-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: favorites.map(item => item.demoUrl) }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'No se pudo iniciar el checkout.');
        setLoading(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión.');
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleBuyBundle} disabled={loading} size="lg" className="w-full bg-blue-600 text-white hover:bg-blue-700">
      {loading ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" /> : <ShoppingBag className="mr-2 size-4" aria-hidden="true" />}
      {t('buyBundle', { count: favorites.length })}
    </Button>
  );
}
