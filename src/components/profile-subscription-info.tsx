'use client';

import type { InvoiceResponse } from '@/app/api/subscription/invoice/route';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Crown, Download, Loader2, X, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

const PLAN_PRICES = {
  premium: { monthly: 9, annual: 54 },
  startup: { monthly: 25, annual: 270 },
} as const;

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function ProfileSubscriptionInfo() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const { plan, status, currentPeriodEnd, billingCycle, ready, purchasedPages } = useStripeSubscription();
  const [downloading, setDownloading] = useState(false);
  const [managing, setManaging] = useState(false);

  if (!ready) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (plan === 'free' || !billingCycle) return null;

  const price = PLAN_PRICES[plan as keyof typeof PLAN_PRICES]?.[billingCycle];
  const cycleLabel = billingCycle === 'annual' ? tCommon('perYear') : tCommon('perMonth');
  const planLabel = plan === 'premium' ? tCommon('premium') : tCommon('startup');

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch('/api/subscription/invoice');
      const data: InvoiceResponse = await res.json();
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setDownloading(false);
    }
  }

  async function handleManageSubscription() {
    setManaging(true);
    try {
      const res = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      }
    } finally {
      setManaging(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <Crown className="h-5 w-5" />
            {t('subscriptionTitle')}
          </CardTitle>
          <CardDescription>{t('subscriptionActiveHint')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('currentPlan')}</p>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{planLabel}</span>
                <Badge variant="default" className="capitalize">
                  {status}
                </Badge>
              </div>
            </div>
            {price !== undefined && (
              <div className="text-right">
                <span className="text-2xl font-bold">${price}</span>
                <span className="text-muted-foreground text-sm">{cycleLabel}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex flex-wrap items-center justify-between gap-3">
            {currentPeriodEnd && (
              <p className="text-sm text-muted-foreground">
                {t('nextBilling')}: <span className="text-foreground font-medium">{formatDate(currentPeriodEnd)}</span>
              </p>
            )}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageSubscription}
                disabled={managing || downloading}
                className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
              >
                {managing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
                {t('cancelSubscription')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloading || managing}
                className="gap-2"
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {t('downloadInvoice')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {purchasedPages && purchasedPages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Package className="h-5 w-5" />
              {t('additionalPurchases')}
            </CardTitle>
            <CardDescription>{t('additionalPurchasesDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {purchasedPages.map((pageId) => (
                <div key={pageId} className="flex items-center justify-between p-3 rounded-md border bg-muted/20">
                  <span className="font-medium font-mono text-sm">{pageId}</span>
                  <Badge variant="outline">{tCommon('view')}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
