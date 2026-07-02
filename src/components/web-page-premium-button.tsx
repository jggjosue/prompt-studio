'use client';

import { Button } from '@/components/ui/button';
import { Crown, Download } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { useAuth } from '@clerk/nextjs';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FreeDownloadDialog } from '@/components/free-download-dialog';
import { normalizeMembership } from '@/lib/membership-access';
import { getWebPageCheckoutUrl } from '@/lib/web-page-checkout';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { trackLoopsEvent } from '@/lib/loops-events';
import { trackAffiliateClick } from '@/lib/affiliate-client';
import {
  AFFILIATE_FIRST_REF_STORAGE_KEY,
  AFFILIATE_LAST_TOUCH_STORAGE_KEY,
  AFFILIATE_OWNER_STORAGE_KEY,
} from '@/lib/affiliate';

function buildCheckoutUrl(baseUrl: string | undefined, pageId: string, userId?: string | null): string {
  if (!baseUrl) return '#';
  const affiliateRef = typeof window !== 'undefined' ? window.localStorage.getItem(AFFILIATE_OWNER_STORAGE_KEY) : null;
  const firstAffiliateRef = typeof window !== 'undefined' ? window.localStorage.getItem(AFFILIATE_FIRST_REF_STORAGE_KEY) : null;
  const lastTouchAffiliateRef = typeof window !== 'undefined' ? window.localStorage.getItem(AFFILIATE_LAST_TOUCH_STORAGE_KEY) : null;
  const url = new URL(baseUrl);
  url.searchParams.set('client_reference_id', `${userId ?? 'guest'}___${pageId}`);
  url.searchParams.set('affiliate_product_id', pageId);
  if (affiliateRef && affiliateRef !== userId) {
    url.searchParams.set('affiliate_ref', affiliateRef);
  }
  if (firstAffiliateRef && firstAffiliateRef !== userId) {
    url.searchParams.set('affiliate_first_ref', firstAffiliateRef);
  }
  if (lastTouchAffiliateRef && lastTouchAffiliateRef !== userId) {
    url.searchParams.set('affiliate_last_touch_ref', lastTouchAffiliateRef);
  }
  return url.toString();
}

type PremiumMembershipButtonProps = {
  hasPremium: boolean;
  pageId: string;
  membership?: string;
  price?: string;
  plan?: string | null;
  pageTitle?: string;
};

export function PremiumMembershipButton({
  hasPremium,
  pageId,
  membership,
  price,
  plan,
  pageTitle,
}: PremiumMembershipButtonProps) {
  const t = useTranslations('common');
  const tLanding = useTranslations('landingPages');
  const { userId, isLoaded } = useAuth();
  const { purchasedPages, ready } = useStripeSubscription();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!membership) return null;

  if (normalizeMembership(membership) === 'free') {
    return <FreeDownloadDialog pageId={pageId} pageTitle={pageTitle} />;
  }

  if (!mounted || !isLoaded || !ready) {
    return <div className="h-9 w-28 animate-pulse rounded-md bg-blue-500/10 border border-blue-500/25" />;
  }

  const stripeUrl = getWebPageCheckoutUrl(price);
  const itemCheckoutUrl = buildCheckoutUrl(stripeUrl, pageId, userId);
  const trackAffiliateBuyClick = () => {
    void trackAffiliateClick({
      productId: pageId,
      productName: pageTitle ?? pageId,
      productPriceCents: price ? Math.round(Number(price) * 100) : null,
      source: 'buy-button',
      buyerKey: userId,
    });
  };

  const hasPurchased = purchasedPages?.includes(pageId) ?? false;
  const trackBuy = () => {
    trackAnalyticsEvent('web_buy_button_premium', {
      page_id: pageId,
      page_title: pageTitle ?? pageId,
      item_id: pageId,
      item_name: pageTitle ?? pageId,
      item_category: 'landing-page',
      membership,
      value: price ? Number(price.replace(/[$,\s]/g, '')) || undefined : undefined,
      currency: 'USD',
      action_source: 'premium-buy-button',
    });
    void trackLoopsEvent('upgrade', {
      pageId,
      pageTitle,
      plan,
      membership,
      source: 'premium-button',
    });
  };

  const trackPremiumDownload = () => {
    trackAnalyticsEvent('web_download_premium', {
      page_id: pageId,
      page_title: pageTitle ?? pageId,
      item_id: pageId,
      item_name: pageTitle ?? pageId,
      item_category: 'landing-page',
      membership,
      action_source: 'premium-download-button',
    });
    void trackLoopsEvent('upgrade', {
      pageId,
      pageTitle,
      plan,
      membership,
      source: 'premium-download',
    });
  };

  if (hasPurchased) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
        asChild
      >
        <a
          href={`/api/landing-pages/${encodeURIComponent(pageId)}/download`}
          onClick={trackPremiumDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          {tLanding('download')}
        </a>
      </Button>
    );
  }



  const numericPrice = Number(price?.replace(/[^\d.]/g, ''));
  const formattedPrice =
    Number.isFinite(numericPrice) && numericPrice > 0
      ? ` $${numericPrice.toFixed(2)}`
      : '';

  const isExternal = itemCheckoutUrl.startsWith('http');

  const buttonContent = (
    <>
      <Crown className="w-4 h-4 mr-2" />
      {t('buy')}{formattedPrice}
    </>
  );

  const returnUrl =
    typeof window !== 'undefined'
      ? `${window.location.pathname}${window.location.search}`
      : '/landing-pages';
  const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(returnUrl)}`;

  if (!userId) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
              asChild
            >
              <Link href={signUpUrl} onClick={trackBuy}>
                {buttonContent}
              </Link>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Regístrate para continuar con tu compra</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const loggedInButton = hasPremium ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="secondary"
            className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
            asChild
          >
            <a
              href={itemCheckoutUrl}
              target={isExternal ? '_blank' : undefined}
              rel={isExternal ? 'noopener noreferrer' : undefined}
              className="!border-blue-500/25 !text-blue-300 hover:!border-blue-500/40 hover:!bg-blue-500/10 hover:!text-blue-200"
              onClick={() => {
                trackAffiliateBuyClick();
                trackBuy();
              }}
            >
              {buttonContent}
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('buyTooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <DropdownMenu>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
              >
                {buttonContent}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('buyTooltip')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild className="cursor-pointer">
          <a
            href={itemCheckoutUrl}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            onClick={() => {
              trackAffiliateBuyClick();
              trackBuy();
            }}
          >
            <Crown className="w-4 h-4 mr-2" />
            Buy {formattedPrice}
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/pricing">
            Upgrade to Premium
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return loggedInButton;
}
