import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { RelatedTemplates } from '@/components/related-templates';
import { AffiliatePageViewTracker } from '@/components/affiliate-page-view-tracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { pickLocalized } from '@/lib/localized-string';
import { resolveWebPageImageUrl } from '@/lib/web-page-media';
import { getRawWebPageByDemoSlug, getRawWebPages } from '@/lib/web-pages';
import { getRefactoryLoaderUrl, normalizeDemoFolder } from '@/lib/refactory-online';
import { normalizeMembership } from '@/lib/membership-access';
import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.prompstudio.com'
).replace(/\/$/, '');

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

function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
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
  ref?: string;
  product?: string;
  source?: string;
}): string | null {
  const base = process.env.NEXT_PUBLIC_STRIPE_WEB_PAGE_UNIQUE;
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
  const page = getRawWebPageByDemoSlug(slug);

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

  if (!seo) {
    return {
      title: 'Landing Page Not Found | Prompt Studio',
      description: 'This landing page prompt is not available.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const canonical = landingPageCanonical(seo.slug);
  const seoTitle = `${seo.title} | ${seo.category} Landing Page Prompt`;

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
      description: seo.description,
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
      description: seo.description,
      images: [seo.image],
    },
  };
}

export default async function LandingPageDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = await getLocale();
  const page = getRawWebPageByDemoSlug(slug);

  if (!page) notFound();

  const title = pickLocalized(page.title, locale);
  const description = pickLocalized(page.description, locale);
  const image = resolveWebPageImageUrl(page.imageUrl);
  const seo = await getLandingPageSeoData(slug);
  const demoHref = getRefactoryLoaderUrl(page.demoUrl);
  const canonical = landingPageCanonical(slug);
  const category =
    seo?.category ||
    page.tags[0] ||
    page.stack[0] ||
    'Landing Page';
  const checkoutUrl = buildCheckoutUrl({
    slug,
    ref: resolvedSearchParams.ref,
    product: resolvedSearchParams.product,
    source: resolvedSearchParams.source,
  });
  const productId = resolvedSearchParams.product?.trim() || page.id || slug;
  const productPriceCents = Math.round(Number(normalizedPrice(page.price)) * 100);

  const normalizedMembership = normalizeMembership(page.membership);
  const isFree = normalizedMembership === 'free';
  const displayPrice = isFree
    ? 'Free'
    : page.price && Number.parseFloat(page.price) > 0
    ? `$${normalizedPrice(page.price)}`
    : null;
  const productSchema = seo
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${canonical}#product`,
        name: seo.title,
        description: seo.description,
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
        },
      }
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Landing Pages',
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
          dangerouslySetInnerHTML={{ __html: jsonLdScript(productSchema) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
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
              <p className="max-w-3xl text-base leading-7 text-muted-foreground md:text-lg">
                {description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href={demoHref} target="_blank" rel="noopener noreferrer">Open demo</Link>
              </Button>
              {checkoutUrl ? (
                <Button asChild className="bg-blue-600 text-white hover:bg-blue-700">
                  <Link href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                    Comprar ahora{displayPrice ? ` · ${displayPrice}` : ''}
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" asChild>
                <Link href="/landing-pages">All landing pages</Link>
              </Button>
            </div>
          </section>

          {image ? (
            <div className="overflow-hidden rounded-lg border bg-muted">
              <img
                src={image}
                alt={title}
                className="aspect-[4/3] h-auto w-full object-cover"
              />
            </div>
          ) : null}
        </div>
        <RelatedTemplates currentSlug={slug} category={category} />
      </main>
      <Footer />
    </div>
  );
}
