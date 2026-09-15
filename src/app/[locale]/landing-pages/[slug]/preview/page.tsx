import { getRawWebPageByDemoSlug } from '@/lib/web-pages';
import { getRefactoryLoaderUrl } from '@/lib/refactory-online';
import { SITE_URL } from '@/lib/site-url';
import { pickLocalized } from '@/lib/localized-string';
import { resolveWebPageImageUrl } from '@/lib/web-page-media';
import { ArrowLeft, Check, LockKeyhole } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PreviewFrame } from './preview-frame';
import { PreviewPurchase } from './preview-purchase';
import { PreviewIntentTracker } from '@/components/preview-intent-tracker';

type PreviewPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    checkout?: string;
    price?: string;
    pageId?: string;
  }>;
};

export const metadata: Metadata = {
  title: 'Vista previa de landing page | Prompt Studio',
  robots: { index: false, follow: false },
};

function formatPrice(value?: string): string {
  const parsed = Number.parseFloat(value?.replace(/[^\d.]/g, '') ?? '');
  return Number.isFinite(parsed) && parsed > 0 ? `$${parsed.toFixed(0)}` : '';
}

function safeCheckoutUrl(value: string | undefined): string {
  if (!value) return '/prices';
  try {
    const url = new URL(value, SITE_URL);
    const siteHost = new URL(SITE_URL).hostname;
    const isOwnSite = url.hostname === siteHost;
    const isStripe =
      url.protocol === 'https:' &&
      (url.hostname === 'stripe.com' || url.hostname.endsWith('.stripe.com'));
    if (!isOwnSite && !isStripe) {
      return '/prices';
    }
    return value;
  } catch {
    return '/prices';
  }
}

export default async function LandingPreviewPage({
  params,
  searchParams,
}: PreviewPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const locale = await getLocale();
  const page = getRawWebPageByDemoSlug(slug);
  if (!page) notFound();

  const demoUrl = new URL(getRefactoryLoaderUrl(page.demoUrl), SITE_URL);
  demoUrl.searchParams.set('embed', '1');
  const demoSrc = `${demoUrl.pathname}${demoUrl.search}`;
  const price = formatPrice(query.price || page.price);
  const checkoutUrl = safeCheckoutUrl(query.checkout);
  const productName = pickLocalized(page.title, locale) || slug.replace(/-/g, ' ');
  const imageUrl = resolveWebPageImageUrl(page.imageUrl);

  return (
    <main className="fixed inset-0 flex min-h-0 flex-col bg-zinc-950 text-white">
      <div className="min-h-0 flex-1 bg-white">
        <PreviewFrame
          src={demoSrc}
          title={`Vista previa de ${slug.replace(/-/g, ' ')}`}
          slug={slug}
          productName={productName}
        />
      </div>

      <aside
        aria-label="Comprar esta landing page"
        className="shrink-0 border-t border-white/10 bg-zinc-950/95 px-4 py-3 shadow-[0_-16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl md:px-6"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:items-center">
            <Link
              href={`/landing-pages/${encodeURIComponent(slug)}`}
              aria-label="Volver a los detalles"
              className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-zinc-300 transition hover:border-white/30 hover:bg-white/10 hover:text-white sm:mt-0"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white sm:text-base">
                Vista previa disponible
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400 sm:text-sm">
                <span>Incluye HTML, CSS, JavaScript y licencia comercial</span>
                <span className="inline-flex items-center gap-1 text-emerald-400">
                  <Check className="size-3.5" /> Descarga inmediata
                </span>
              </p>
              <PreviewIntentTracker slug={slug} title={productName} imageUrl={imageUrl} price={page.price ?? ''} locale={locale} />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:shrink-0">
            <span className="hidden items-center gap-1.5 text-xs text-zinc-400 md:inline-flex">
              <LockKeyhole className="size-3.5" /> Pago seguro
            </span>
            <PreviewPurchase
              checkoutUrl={checkoutUrl}
              imageUrl={imageUrl}
              locale={locale}
              price={price}
              previewUrl={demoSrc}
              productName={productName}
              slug={slug}
            />
          </div>
        </div>
      </aside>
    </main>
  );
}
