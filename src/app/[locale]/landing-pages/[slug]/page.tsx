import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { RelatedTemplates } from '@/components/related-templates';
import { buildAggregateRatingSchema } from '@/lib/review-aggregates';
import { ProductReviews } from '@/components/product-reviews';
import { ProductSocialProof } from '@/components/product-social-proof';
import { WebPageCodePreview } from '@/components/web-page-code-preview';
import { PostPurchaseCustomization } from '@/components/post-purchase-customization';
import { AffiliatePageViewTracker } from '@/components/affiliate-page-view-tracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedImage } from '@/components/optimized-image';
import { pickLocalized } from '@/lib/localized-string';
import { resolveWebPageImageUrl } from '@/lib/web-page-media';
import { getWebPageCheckoutUrl } from '@/lib/web-page-checkout';
import { getCatalogIdByDemoSlug, getRawWebPageByDemoSlug, getRawWebPageById, getRawWebPageByCatalogId, getRawWebPages } from '@/lib/web-pages';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import { normalizeMembership } from '@/lib/membership-access';
import {
  digitalDeliveryDetails,
  digitalProductReturnPolicy,
  safeJsonLd,
  schemaDescription,
} from '@/lib/json-ld';
import { SITE_URL } from '@/lib/site-url';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    ref?: string;
    product?: string;
    source?: string;
  }>;
};

// Only catalog-backed landing pages are valid. Unknown or retired slugs must
// return a real 404 instead of streaming a soft-404 response with HTTP 200.
export const dynamicParams = false;

type LandingPageSeoData = {
  slug: string;
  title: string;
  description: string;
  image: string;
  price: string;
  category: string;
  keywords: string[];
};

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

function normalizedPrice(price: string | undefined): string {
  const parsed = Number.parseFloat(price?.replace(/[^\d.]/g, '') ?? '');
  return Number.isFinite(parsed) ? parsed.toFixed(2) : '0.00';
}

function landingPageCanonical(slug: string): string {
  return `${SITE_URL}/landing-pages/${encodeURIComponent(slug)}`;
}

function buildCheckoutUrl(params: {
  slug: string;
  price?: string;
  ref?: string;
  product?: string;
  source?: string;
}): string | null {
  const base = getWebPageCheckoutUrl(params.price);
  if (!base) return null;

  const url = new URL(base);
  const productId = params.product?.trim() || params.slug;
  const ref = params.ref?.trim();

  url.searchParams.set('client_reference_id', `${ref ? 'guest' : 'guest'}___${productId}`);
  url.searchParams.set('affiliate_product_id', productId);
  url.searchParams.set('pageId', productId);
  url.searchParams.set('productId', productId);
  url.searchParams.set('productName', params.slug.replace(/-/g, ' '));
  url.searchParams.set('page_name', params.slug.replace(/-/g, ' '));
  if (ref) {
    url.searchParams.set('affiliate_ref', ref);
    url.searchParams.set('affiliate_first_ref', ref);
    url.searchParams.set('affiliate_last_touch_ref', ref);
  }
  if (params.source?.trim()) {
    url.searchParams.set('source', params.source.trim());
  }

  return url.toString();
}

async function getLandingPageSeoData(
  slug: string
): Promise<LandingPageSeoData | null> {
  const locale = await getLocale();
  const page = getRawWebPageByDemoSlug(slug) || getRawWebPageById(slug) || getRawWebPageByCatalogId(slug);

  if (!page) return null;

  const title = pickLocalized(page.title, locale);
  const description = pickLocalized(page.description, locale);
  const image = absoluteUrl(resolveWebPageImageUrl(page.imageUrl));
  const price = normalizedPrice(page.price);
  const category =
    (page as { category?: string }).category?.trim() ||
    page.tags[0] ||
    page.stack[0] ||
    'Landing Page';

  return {
    slug,
    title,
    description,
    image,
    price,
    category,
    keywords: Array.from(
      new Set([
        title,
        category,
        'landing page prompt',
        'AI landing page',
        'HTML landing page demo',
        'Next.js landing page',
        ...page.tags,
        ...page.stack,
      ])
    ),
  };
}

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getRawWebPages()
    .map(page => normalizeDemoFolder(page.demoUrl ?? ''))
    .filter((slug): slug is string => Boolean(slug))
    .map(slug => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const seo = await getLandingPageSeoData(slug);
  const t = await getTranslations('landingPages');

  if (!seo) {
    return {
      title: `${t('notFoundTitle')} | Prompt Studio`,
      description: t('notFoundDescription'),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = landingPageCanonical(seo.slug);
  const seoTitle = t('detailSeoTitle', {
    title: seo.title,
    category: seo.category,
  });

  return {
    title: seoTitle,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical,
      languages: {
        en: canonical,
        es: canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      type: 'article',
      url: canonical,
      title: seoTitle,
      description: schemaDescription(seo.description, seo.title),
      siteName: 'Prompt Studio',
      images: [
        {
          url: seo.image,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: schemaDescription(seo.description, seo.title),
      images: [seo.image],
    },
  };
}

export default async function LandingPageDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations('landingPages');
  const page = getRawWebPageByDemoSlug(slug) || getRawWebPageById(slug) || getRawWebPageByCatalogId(slug);

  if (!page) notFound();

  const title = pickLocalized(page.title, locale);
  const image = resolveWebPageImageUrl(page.imageUrl);
  const seo = await getLandingPageSeoData(slug);
  const canonical = landingPageCanonical(slug);
  const category =
    seo?.category ||
    page.tags[0] ||
    page.stack[0] ||
    'Landing Page';
  const checkoutUrl = buildCheckoutUrl({
    slug,
    price: page.price,
    ref: resolvedSearchParams.ref,
    product: resolvedSearchParams.product,
    source: resolvedSearchParams.source,
  });
  const demoParams = new URLSearchParams();
  if (page.price) demoParams.set('price', page.price);
  demoParams.set('pageId', page.id || slug);
  if (checkoutUrl) demoParams.set('checkout', checkoutUrl);
  const demoHref = `/landing-pages/${encodeURIComponent(slug)}/preview?${demoParams.toString()}`;
  const productId = resolvedSearchParams.product?.trim() || page.id || slug;
  const productPriceCents = Math.round(Number(normalizedPrice(page.price)) * 100);
  const catalogId = getCatalogIdByDemoSlug(slug);

  const normalizedMembership = normalizeMembership(page.membership);
  const isFree = normalizedMembership === 'free';
  const displayPrice = isFree
    ? t('free')
    : page.price && Number.parseFloat(page.price) > 0
      ? `$${normalizedPrice(page.price)}`
      : null;
  const includedFeatures = [
    t('whatsIncluded.sourceCode'),
    t('whatsIncluded.organizedFiles'),
    t('whatsIncluded.responsiveDesign'),
    t('whatsIncluded.animations'),
    t('whatsIncluded.commercialLicense'),
    t('whatsIncluded.futureUpdates'),
    t('whatsIncluded.instantDownload'),
    t('whatsIncluded.compatibility', {
      stack: page.stack.length > 0 ? page.stack.join(', ') : 'HTML, CSS, JavaScript',
    }),
  ];
  const reviewProductId = page.id || slug;
  const aggregateRating = buildAggregateRatingSchema(reviewProductId);

  const productSchema = seo
    ? {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonical}#product`,
      name: seo.title,
      description: schemaDescription(seo.description, seo.title),
      image: [seo.image],
      category: seo.category,
      brand: {
        '@type': 'Brand',
        name: 'Prompt Studio',
      },
      offers: {
        '@type': 'Offer',
        url: canonical,
        priceCurrency: 'USD',
        price: seo.price,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Prompt Studio',
          url: SITE_URL,
        },
        shippingDetails: digitalDeliveryDetails(),
        hasMerchantReturnPolicy: digitalProductReturnPolicy(SITE_URL),
      },
      /**
       * Solo se incrusta cuando el producto tiene reseñas publicadas. Marcar
       * una valoración inexistente es spam estructurado y puede costar el
       * dominio entero, así que `buildAggregateRatingSchema` devuelve `null`
       * salvo que haya al menos una reseña real.
       */
      ...(aggregateRating ? { aggregateRating } : {}),
    }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('homeLabel'),
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('landingPagesLabel'),
        item: `${SITE_URL}/landing-pages`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: canonical,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {resolvedSearchParams.ref?.trim() ? (
        <AffiliatePageViewTracker
          productId={productId}
          productName={title}
          productPriceCents={Number.isFinite(productPriceCents) ? productPriceCents : null}
        />
      ) : null}
      {productSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <Header />
      <main className="container py-10 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-start">
          <section className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {page.tags.slice(0, 6).map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                {title}
              </h1>
              {displayPrice ? (
                <div className="inline-block rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
                  {displayPrice}
                </div>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={demoHref} target="_blank" rel="noopener noreferrer">{t('openDemo')}</Link>
              </Button>
              {checkoutUrl ? (
                <div className="flex flex-col items-start gap-2">
                  <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                    <Link href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                      {t('buyNow')}{displayPrice ? ` · ${displayPrice}` : ''}
                    </Link>
                  </Button>
                  <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                    {t('purchaseTrust')}
                  </p>
                </div>
              ) : null}
              <Button variant="outline" asChild>
                <Link href="/landing-pages">{t('allLandingPages')}</Link>
              </Button>
            </div>
            {checkoutUrl ? (
              <aside
                aria-labelledby="whats-included-title"
                className="max-w-4xl rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-background to-background p-5 shadow-sm sm:p-6"
              >
                <div className="mb-5">
                  <h2 id="whats-included-title" className="text-xl font-bold tracking-tight">
                    {t('whatsIncluded.title')}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t('whatsIncluded.subtitle')}
                  </p>
                </div>
                <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {includedFeatures.map(feature => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-6">
                      <CheckCircle2
                        aria-hidden="true"
                        className="mt-1 size-4 shrink-0 text-emerald-500"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </aside>
            ) : null}
          </section>

          {image ? (
            <div className="overflow-hidden rounded-lg border bg-muted">
              <OptimizedImage
                src={image}
                alt={title}
                priority
                className="aspect-[4/3] h-auto w-full object-cover"
                sizes="(max-width: 1024px) 100vw, 900px"
                lazyAdaptive={false}
              />
            </div>
          ) : null}
        </div>
        <ProductSocialProof slug={slug} />
        <ProductReviews productId={reviewProductId} slug={slug} productKind="web-page" initialSummary={aggregateRating ? { rating: aggregateRating.ratingValue, ratingCount: aggregateRating.reviewCount } : null} />
        <WebPageCodePreview slug={slug} />
        {catalogId ? <PostPurchaseCustomization catalogId={catalogId} pageId={page.id || slug} slug={slug} title={title} /> : null}
        <RelatedTemplates currentSlug={slug} category={category} />
      </main>
      <Footer />
    </div>
  );
}
