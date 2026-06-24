'use client';

import { PremiumMembershipButton } from '@/components/web-page-premium-button';
import { WebPagePromptDialog } from '@/components/web-page-prompt-dialog-new';
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
import type { WebPageEntry } from '@/lib/web-pages';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { normalizeMembership } from '@/lib/membership-access';
import { ExternalLink, Globe, Tag } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { memo } from 'react';

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

function WebPageCardComponent({
  page,
  savedReadability,
  animationIndex = 0,
}: WebPageCardProps) {
  const tEditor = useTranslations('landingEditor');
  const savedReport = savedReadability
    ? snapshotToBadgeReport(savedReadability)
    : null;
  const normalizedMembership = normalizeMembership(page.membership);
  const isFree = normalizedMembership === 'free';
  const displayedPrice = isFree ? 'Free' : formatPrice(page.price);
  const { ready, isSignedIn, plan } = useMembershipAccess();
  const hasPremium =
    ready &&
    isSignedIn &&
    (plan === 'premium' || plan === 'startup');

  return (
    <ParallaxReveal reverse={animationIndex % 2 === 1}>
      <Card className="overflow-hidden group h-full flex flex-col bg-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <CardTitle className="font-headline text-xl">
                {page.title}
              </CardTitle>
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
          <div className="relative aspect-video rounded-md overflow-hidden border">
            <OptimizedImage
              src={page.imageUrl}
              alt={page.title}
              fill
              priority={animationIndex < 2}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
              data-ai-hint={page.imageHint}
            />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 border-t flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <WebPagePromptDialog page={page} />
            <PremiumMembershipButton
              hasPremium={hasPremium}
              pageId={page.id}
              membership={page.membership}
              price={page.price}
              plan={plan}
              pageTitle={page.title}
            />
          </div>
          {page.demoUrl ? (
            <Button
              size="sm"
              className="!bg-blue-600 !text-white shadow-md shadow-blue-950/20 hover:!bg-blue-700"
              asChild
            >
              <PremiumAccessLink
                membership={page.membership}
                href={getRefactoryLoaderUrl(page.demoUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="!bg-blue-600 !text-white hover:!bg-blue-700"
                onClick={() => (window as any).gtag?.('event', 'open', { page_title: page.title })}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </PremiumAccessLink>
            </Button>
          ) : (
            <Button size="sm" variant="secondary" disabled>
              <Globe className="w-4 h-4 mr-2" />
              Prompt only
            </Button>
          )}
        </CardFooter>
      </Card>
    </ParallaxReveal>
  );
}

export const WebPageCard = memo(WebPageCardComponent);
