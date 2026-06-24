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
import { useAuth, SignUpButton } from '@clerk/nextjs';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FreeDownloadDialog } from '@/components/free-download-dialog';
import { normalizeMembership } from '@/lib/membership-access';

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
  const { userId, isLoaded } = useAuth();
  const pathname = usePathname();
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

  const isStartup = plan === 'startup';
  const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_WEB_PAGE_UNIQUE;
  
  let itemCheckoutUrl = stripeUrl || '#';
  if (stripeUrl && userId) {
    const url = new URL(stripeUrl);
    url.searchParams.set('client_reference_id', `${userId}___${pageId}`);
    itemCheckoutUrl = url.toString();
  }

  const hasPurchased = purchasedPages?.includes(pageId) ?? false;

  if (isStartup || hasPurchased) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
        asChild
      >
        <a 
          href={`/api/landing-pages/${encodeURIComponent(pageId)}/download`}
          onClick={() => (window as any).gtag?.('event', 'download_premium', { page_title: pageTitle })}
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </a>
      </Button>
    );
  }



  const formattedPrice = price && price !== 'Free' ? ` $${price.replace(/^\$/, '')}` : '';

  const isExternal = itemCheckoutUrl.startsWith('http');

  const buttonContent = (
    <>
      <Crown className="w-4 h-4 mr-2" />
      {t('buy')}{formattedPrice}
    </>
  );

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
              onClick={() => (window as any).gtag?.('event', 'buy', { page_title: pageTitle })}
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
          <a href={itemCheckoutUrl} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} onClick={() => (window as any).gtag?.('event', 'buy', { page_title: pageTitle })}>
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

  if (!userId) {
    return (
      <SignUpButton mode="redirect" forceRedirectUrl={pathname}>
        <span className="inline-block cursor-pointer">
          <Button
            size="sm"
            variant="secondary"
            title={t('buyTooltip')}
            className="pointer-events-none border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
          >
            {buttonContent}
          </Button>
        </span>
      </SignUpButton>
    );
  }

  return loggedInButton;
}
