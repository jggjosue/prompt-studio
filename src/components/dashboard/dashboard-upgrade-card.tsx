'use client';

import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Crown, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export function DashboardUpgradeCard() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const { plan, ready } = useStripeSubscription();

  if (!ready) return null;

  if (plan === 'premium' || plan === 'startup') {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="p-2 pt-0 md:p-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-primary" />
            {plan === 'startup' ? tCommon('startup') : tCommon('premium')}
          </CardTitle>
          <CardDescription>{t('premiumActiveDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
          <Button size="sm" variant="outline" className="w-full" asChild>
            <Link href="/prices">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {t('managePlan')}
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-2 pt-0 md:p-4">
        <CardTitle>{t('upgradeTitle')}</CardTitle>
        <CardDescription>{t('upgradeDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
        <Button size="sm" className="w-full" asChild>
          <Link href="/prices">{t('upgrade')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
