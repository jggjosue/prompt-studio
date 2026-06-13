'use client';

import { Button } from '@/components/ui/button';
import { Crown, Download } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';
import { useAuth, SignUpButton } from '@clerk/nextjs';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

type PremiumMembershipButtonProps = {
  hasPremium: boolean;
  pageId: string;
  membership?: string;
  price?: string;
  plan?: string | null;
};

export function PremiumMembershipButton({
  hasPremium,
  pageId,
  membership,
  price,
  plan,
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

  if (!mounted || !isLoaded || !ready) {
    return <div className="h-9 w-28 animate-pulse rounded-md bg-blue-500/10 border border-blue-500/25" />;
  }

  const isStartup = plan === 'startup';
  const stripeUrl = process.env.NEXT_PUBLIC_STRIPE_WEB_PAGE_UNIQUE;
  
  let checkoutUrl = stripeUrl || '#';
  if (stripeUrl && userId) {
    const url = new URL(stripeUrl);
    url.searchParams.set('client_reference_id', `${userId}___${pageId}`);
    checkoutUrl = url.toString();
  }

  const hasPurchased = purchasedPages?.includes(pageId) ?? false;

  if (isStartup || membership === 'Free' || hasPurchased) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="border border-blue-500/25 text-blue-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-200"
        asChild
      >
        <a href={`/api/landing-pages/${encodeURIComponent(pageId)}/download`}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </a>
      </Button>
    );
  }

  const formattedPrice = price && price !== 'Free' ? ` $${price.replace(/^\$/, '')}` : '';

  const loggedInButton = (
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
              href={checkoutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="!border-blue-500/25 !text-blue-300 hover:!border-blue-500/40 hover:!bg-blue-500/10 hover:!text-blue-200"
            >
              <Crown className="w-4 h-4 mr-2" />
              {t('buy')}{formattedPrice}
            </a>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('buyTooltip')}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
            <Crown className="w-4 h-4 mr-2" />
            {t('buy')}{formattedPrice}
          </Button>
        </span>
      </SignUpButton>
    );
  }

  return loggedInButton;
}
