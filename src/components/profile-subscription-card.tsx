'use client';

import { ClerkPricingTable } from '@/components/clerk-pricing-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { activeClerkPlanLabel, CLERK_USER_PLANS } from '@/lib/clerk-billing';
import { useAuth } from '@clerk/nextjs';
import { Crown, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export function ProfileSubscriptionCard() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { isLoaded, isSignedIn, has } = useAuth();

  const plan = isLoaded
    ? activeClerkPlanLabel(has, Boolean(isSignedIn))
    : 'free';

  const planLabel =
    plan === 'premium'
      ? tCommon('premium')
      : plan === 'startup'
        ? tCommon('startup')
        : tCommon('free');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Crown className="h-5 w-5" />
          {t('subscriptionTitle')}
        </CardTitle>
        <CardDescription>{t('subscriptionClerkDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">{t('currentPlan')}:</span>
          <Badge variant={plan === 'free' ? 'secondary' : 'default'}>{planLabel}</Badge>
          {isLoaded && has?.({ plan: CLERK_USER_PLANS.premium }) && (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Premium
            </Badge>
          )}
          {isLoaded && has?.({ plan: CLERK_USER_PLANS.startup }) && (
            <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-700 dark:text-amber-300">
              Startup
            </Badge>
          )}
        </div>

        {plan === 'free' ? (
          <p className="text-sm text-muted-foreground">{t('subscriptionFreeHint')}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{t('subscriptionActiveHint')}</p>
        )}

        <ClerkPricingTable className="max-w-full" />
      </CardContent>
      <CardFooter className="border-t flex flex-wrap gap-2">
        {plan !== 'free' && (
          <Button variant="default" asChild>
            <Link href="/landing-pages">{t('browsePremiumContent')}</Link>
          </Button>
        )}
        <Button variant="outline" asChild>
          <Link href="/prices">{t('comparePlans')}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
