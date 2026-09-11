import { OptimizedImage } from '@/components/optimized-image';
import { Badge } from '@/components/ui/badge';
import { getProductSocialProof } from '@/lib/product-social-proof';
import { Download, FolderKanban, ShieldCheck, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function ProductSocialProof({ slug }: { slug: string }) {
  const proof = getProductSocialProof(slug);
  if (!proof) return null;
  const t = await getTranslations('landingPages.socialProof');

  return (
    <section aria-labelledby="product-social-proof-title" className="mt-14 border-t pt-10">
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('eyebrow')}</p>
        <h2 id="product-social-proof-title" className="mt-2 text-2xl font-bold tracking-tight font-headline">
          {t('title')}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {proof.downloads ? <div className="rounded-xl border bg-card p-5"><Download className="mb-3 size-5 text-blue-600" /><p className="text-2xl font-black">{proof.downloads.toLocaleString()}</p><p className="text-sm text-muted-foreground">{t('downloads')}</p></div> : null}
        {proof.rating && proof.ratingCount ? <div className="rounded-xl border bg-card p-5"><Star className="mb-3 size-5 fill-amber-400 text-amber-400" /><p className="text-2xl font-black">{proof.rating.toFixed(1)} / 5</p><p className="text-sm text-muted-foreground">{t('ratings', { count: proof.ratingCount })}</p></div> : null}
        {proof.projectsCreated ? <div className="rounded-xl border bg-card p-5"><FolderKanban className="mb-3 size-5 text-violet-600" /><p className="text-2xl font-black">{proof.projectsCreated.toLocaleString()}</p><p className="text-sm text-muted-foreground">{t('projects')}</p></div> : null}
      </div>

      {proof.customizations?.length ? <div className="mt-8"><h3 className="mb-4 text-lg font-bold">{t('customizations')}</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{proof.customizations.map(item => <figure key={`${item.projectName}-${item.imageUrl}`} className="overflow-hidden rounded-xl border bg-card"><div className="relative aspect-video bg-muted"><OptimizedImage src={item.imageUrl} alt={item.alt} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" /></div><figcaption className="p-3 text-sm font-semibold">{item.projectName}</figcaption></figure>)}</div></div> : null}

      {proof.reviews?.length ? <div className="mt-8"><h3 className="mb-4 text-lg font-bold">{t('reviews')}</h3><div className="grid gap-4 md:grid-cols-2">{proof.reviews.map((review, index) => <blockquote key={`${review.author}-${index}`} className="rounded-xl border bg-card p-5"><div className="mb-3 flex items-center justify-between gap-3"><div className="flex" aria-label={t('stars', { count: review.rating })}>{Array.from({ length: 5 }).map((_, star) => <Star key={star} className={`size-4 ${star < review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`} />)}</div><Badge variant="secondary" className="gap-1"><ShieldCheck className="size-3" /> {t('verified')}</Badge></div><p className="text-sm leading-6">“{review.comment}”</p><footer className="mt-3 text-sm font-semibold">{review.author}</footer></blockquote>)}</div></div> : null}
    </section>
  );
}
