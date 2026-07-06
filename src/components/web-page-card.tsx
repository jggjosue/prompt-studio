'use client';

import { ReadabilityBadge } from '@/components/readability-badge';
import { OptimizedImage } from '@/components/optimized-image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PremiumAccessLink } from '@/components/premium-access-link';
import { ParallaxReveal } from '@/components/ui/parallax-reveal';
import { snapshotToBadgeReport } from '@/lib/landing-readability-badge';
import type { LandingReadabilityPublicSnapshot } from '@/lib/landing-readability-store';
import { getRefactoryLoaderUrl } from '@/lib/refactory-online';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { trackAffiliateClick } from '@/lib/affiliate-client';
import type { WebPageEntry } from '@/lib/web-pages';
import { resolveWebPageImageUrl } from '@/lib/web-page-media';
import { getWebPageCheckoutUrl } from '@/lib/web-page-checkout';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { normalizeMembership } from '@/lib/membership-access';
import {
  AFFILIATE_FIRST_REF_STORAGE_KEY,
  AFFILIATE_LAST_TOUCH_STORAGE_KEY,
  AFFILIATE_OWNER_STORAGE_KEY,
} from '@/lib/affiliate';
import { ExternalLink, Globe, Tag } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { memo } from 'react';
import { useAuth } from '@clerk/nextjs';

const WebPageCardActions = dynamic(
  () => import('@/components/web-page-card-actions'),
  {
    ssr: false,
    loading: () => (
      <>
        <div className="h-9 w-28 animate-pulse rounded-md border border-blue-500/25 bg-blue-500/10" />
        <div className="h-9 w-28 animate-pulse rounded-md border border-blue-500/25 bg-blue-500/10" />
      </>
    ),
  }
);

type WebPageCardProps = {
  page: WebPageEntry;
  savedReadability?: LandingReadabilityPublicSnapshot | null;
  animationIndex?: number;
};

function formatPrice(price: string): string | null {
  const normalizedPrice = price.trim();
  if (!normalizedPrice) return null;

  const numericPrice = Number(normalizedPrice.replace(/[$,\s]/g, ''));
  if (Number.isFinite(numericPrice)) {
    if (numericPrice === 0) return null;
    return `$${numericPrice.toFixed(2)}`;
  }

  return normalizedPrice;
}

function buildCheckoutUrl(baseUrl: string | undefined, pageId: string, userId?: string | null): string {
  if (!baseUrl) return '#';
  const isInternalPath = baseUrl.startsWith('/');
  const url = new URL(baseUrl, 'https://prompstudio.com');
  url.searchParams.set('client_reference_id', `${userId ?? 'guest'}___${pageId}`);
  url.searchParams.set('affiliate_product_id', pageId);
  return isInternalPath ? `${url.pathname}${url.search}` : url.toString();
}

function WebPageCardComponent({
  page,
  savedReadability,
  animationIndex = 0,
}: WebPageCardProps) {
  const tEditor = useTranslations('landingEditor');
  const tLanding = useTranslations('landingPages');
  const tCommon = useTranslations('common');
  const savedReport = savedReadability
    ? snapshotToBadgeReport(savedReadability)
    : null;
  const normalizedMembership = normalizeMembership(page.membership);
  const pagePrice = Number(page.price.replace(/[^\d.]/g, ''));
  const isPaidProduct = Number.isFinite(pagePrice) && pagePrice > 0;
  const isFree = !isPaidProduct && normalizedMembership === 'free';
  const displayedPrice = isFree ? tCommon('free') : formatPrice(page.price);
  const { ready, isSignedIn, plan } = useMembershipAccess();
  const { userId } = useAuth();

  const hasPremium =
    ready &&
    isSignedIn &&
    (plan === 'premium' || plan === 'startup');
  const stripeUrl = getWebPageCheckoutUrl(page.price);
  const itemCheckoutUrl = buildCheckoutUrl(stripeUrl, page.id, userId);
  const trackClick = (source: 'campaign-card' | 'demo') => {
    void trackAffiliateClick({
      productId: page.id,
      productName: page.title,
      productPriceCents: page.price ? Math.round(Number(page.price) * 100) : null,
      source,
      buyerKey: userId,
    });
  };

  return (
    <ParallaxReveal reverse={animationIndex % 2 === 1}>
      <Card className="overflow-hidden group h-full flex flex-col bg-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Link href={`/landing-pages/${page.demoUrl}`} className="hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm inline-block">
                <CardTitle className="font-headline text-xl">
                  {page.title}
                </CardTitle>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                {page.stack.join(' · ')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2" suppressHydrationWarning>
              {isFree ? (
                <span suppressHydrationWarning className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
                  Free
                </span>
              ) : hasPremium ? (
                <span suppressHydrationWarning className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
                  Premium
                </span>
              ) : displayedPrice ? (
                <span suppressHydrationWarning className="rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-sm font-semibold tabular-nums text-blue-400">
                  {displayedPrice}
                </span>
              ) : null}
              {savedReport ? (
                <Link
                  href={`/dashboard/landing-editor?page=${encodeURIComponent(page.id)}`}
                  className="shrink-0"
                  title={tEditor('openSavedAnalysis')}
                >
                  <ReadabilityBadge
                    report={savedReport}
                    compact
                    savedAt={savedReadability?.updatedAt}
                  />
                </Link>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-4 flex-grow">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="w-4 h-4 shrink-0" />
            <span className="truncate">{page.tags.join(', ')}</span>
          </div>
          <Link href={`/landing-pages/${page.demoUrl}`} className="relative aspect-video rounded-md overflow-hidden border block group-hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <OptimizedImage
              src={resolveWebPageImageUrl(page.imageUrl)}
              alt={page.title}
              fill
              priority={animationIndex < 2}
              lazyAdaptive={animationIndex >= 2}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={page.imageHint}
            />
          </Link>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 border-t flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <WebPageCardActions
              page={page}
              hasPremium={hasPremium}
              plan={plan}
            />
          </div>
          {page.demoUrl ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                className="!bg-[#0057ff] !text-white shadow-md shadow-blue-950/30 hover:!bg-[#0047d6]"
                asChild
              >
                <Link
                  href={`/webpages/${page.demoUrl}/index.html?price=${encodeURIComponent(page.price)}&pageId=${encodeURIComponent(page.id)}&checkout=${encodeURIComponent(itemCheckoutUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="!bg-[#0057ff] !text-white hover:!bg-[#0047d6]"
                  onClick={event => {
                    const url = new URL(event.currentTarget.href);
                    const affiliateRef = window.localStorage.getItem(AFFILIATE_OWNER_STORAGE_KEY);
                    const firstAffiliateRef = window.localStorage.getItem(AFFILIATE_FIRST_REF_STORAGE_KEY);
                    const lastTouchAffiliateRef = window.localStorage.getItem(AFFILIATE_LAST_TOUCH_STORAGE_KEY);
                    if (affiliateRef && affiliateRef !== userId) url.searchParams.set('affiliate_ref', affiliateRef);
                    if (firstAffiliateRef && firstAffiliateRef !== userId) url.searchParams.set('affiliate_first_ref', firstAffiliateRef);
                    if (lastTouchAffiliateRef && lastTouchAffiliateRef !== userId) url.searchParams.set('affiliate_last_touch_ref', lastTouchAffiliateRef);
                    event.currentTarget.href = url.toString();
                    trackClick('demo');
                    trackAnalyticsEvent('web_open_demo_URL', {
                      page_id: page.id,
                      page_title: page.title,
                      item_id: page.id,
                      item_name: page.title,
                      item_category: 'landing-page',
                      membership: page.membership,
                      action_source: 'catalog-demo-button',
                    });
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {tLanding('open')}
                </Link>
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              <Globe className="w-4 h-4 mr-2" />
              {tLanding('promptOnly')}
            </Button>
          )}
        </CardFooter>
      </Card>
    </ParallaxReveal>
  );
}

export const WebPageCard = memo(WebPageCardComponent);
