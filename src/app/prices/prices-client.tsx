'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { PremiumAccessLink } from '@/components/premium-access-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useRefreshSubscriptionStatus,
  useStripeSubscription,
} from '@/hooks/use-stripe-subscription';
import {
  getPremiumStripeCheckoutUrl,
  getStartupStripeCheckoutUrl,
} from '@/lib/stripe-checkout';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import {
  Check,
  Code2,
  Crown,
  Download,
  Sparkles,
  UserPlus,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PREMIUM_MONTHLY = 15;
const PREMIUM_YEARLY = 150;
const DEVELOPER_MONTHLY = 1000;
const DEVELOPER_YEARLY = 10000;

function formatMonthlyEquivalent(yearly: number) {
  return (yearly / 12).toFixed(2).replace(/\.00$/, '');
}

type PaidPlanProps = {
  isAnnual: boolean;
  monthly: number;
  yearly: number;
};

function PaidPlanPrice({ isAnnual, monthly, yearly }: PaidPlanProps) {
  const t = useTranslations('prices');
  const tCommon = useTranslations('common');
  const displayPrice = isAnnual ? yearly : monthly;
  const priceSuffix = isAnnual ? tCommon('perYear') : tCommon('perMonth');
  const savings = monthly * 12 - yearly;

  return (
    <>
      <div className="mb-2">
        <span className="text-5xl font-bold tabular-nums">${displayPrice}</span>
        <span className="text-muted-foreground">{priceSuffix}</span>
      </div>
      {isAnnual ? (
        <p className="text-sm text-muted-foreground mb-6">
          {t('equivalentMonthly', { amount: formatMonthlyEquivalent(yearly) })}
          {savings > 0 && (
            <span className="text-blue-500 font-medium">
              {' '}
              {t('savePerYear', { amount: savings })}
            </span>
          )}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">{t('billedMonthly')}</p>
      )}
    </>
  );
}

export default function PricesClient() {
  const t = useTranslations('prices');
  const tCommon = useTranslations('common');
  const [isAnnual, setIsAnnual] = useState(false);
  const searchParams = useSearchParams();
  const refreshSubscription = useRefreshSubscriptionStatus();
  const checkoutRefreshDone = useRef(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { plan, ready } = useStripeSubscription();
  const hasPremiumPlan = ready && (plan === 'premium' || plan === 'startup');
  const hasStartupPlan = ready && plan === 'startup';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || checkoutRefreshDone.current) return;
    const checkout =
      searchParams.get('checkout') === 'success' ||
      searchParams.has('session_id');
    if (!checkout) return;
    checkoutRefreshDone.current = true;
    refreshSubscription();
  }, [isLoaded, isSignedIn, searchParams, refreshSubscription]);

  const freeFeatures = t.raw('freeFeatures') as string[];
  const premiumOnlyFeatures = t.raw('premiumFeatures') as string[];
  const developerOnlyFeatures = t.raw('developerFeatures') as string[];

  const annualSavingsPercent = Math.round(
    (1 - PREMIUM_YEARLY / (PREMIUM_MONTHLY * 12)) * 100
  );

  const premiumCheckoutUrl = getPremiumStripeCheckoutUrl(isAnnual, userId);
  const startupCheckoutUrl = getStartupStripeCheckoutUrl(isAnnual, userId);
  const trackPlanBuy = (planName: 'premium' | 'startup') => {
    trackAnalyticsEvent('web_buy_button_premium', {
      page_id: `plan-${planName}`,
      page_title: `${planName === 'premium' ? 'Premium' : 'Startup'} plan`,
      item_id: `plan-${planName}`,
      item_name: `${planName === 'premium' ? 'Premium' : 'Startup'} plan`,
      item_category: 'subscription',
      plan: planName,
      billing_period: isAnnual ? 'yearly' : 'monthly',
      currency: 'USD',
      action_source: 'pricing-page',
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-6xl min-w-0">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>

          <div
            className="mb-10 mx-auto flex w-fit rounded-full border border-blue-500/55 bg-slate-950 p-1.5 shadow-[0_12px_35px_rgba(37,99,235,0.18)]"
            role="group"
            aria-label={t('billingCycle')}
          >
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              className={`rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 sm:px-9 ${
                !isAnnual
                  ? '!bg-blue-600 !text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] ring-1 ring-blue-400'
                  : '!text-slate-200 hover:!bg-blue-950/60 hover:!text-white'
              }`}
            >
              {t('monthlyBilling')}
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              aria-pressed={isAnnual}
              className={`rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 sm:px-9 ${
                isAnnual
                  ? '!bg-blue-600 !text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] ring-1 ring-blue-400'
                  : '!text-slate-200 hover:!bg-blue-950/60 hover:!text-white'
              }`}
            >
              {t('yearlyBilling')}{' '}
              <span
                className={
                  isAnnual ? '!text-white/90' : '!text-cyan-400'
                }
              >
                {t('savePercent', { percent: annualSavingsPercent })}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free */}
            <Card className="flex flex-col border-muted-foreground/20 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="font-headline text-2xl">{tCommon('free')}</CardTitle>
                  <Badge variant="secondary">{tCommon('noAccount')}</Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('freeDesc')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="mb-8">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">{tCommon('forever')}</span>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {freeFeatures.map((text) => {
                    const isMissing = text.startsWith('Sin ') || text.startsWith('No ');
                    const Icon = isMissing ? X : Check;
                    return (
                      <li key={text} className={`flex items-start gap-3 text-sm ${isMissing ? 'text-muted-foreground' : ''}`}>
                        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${isMissing ? 'text-muted-foreground' : 'text-blue-500'}`} />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-auto space-y-3">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/prompts">
                      <Download className="w-4 h-4 mr-2" />
                      {t('browseFree')}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium */}
            <Card className="relative flex flex-col overflow-hidden border-blue-500/50 shadow-lg shadow-blue-950/10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Crown className="w-6 h-6 text-blue-500" />
                    {tCommon('premium')}
                  </CardTitle>
                  <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                    {tCommon('accountRequired')}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('premiumDesc')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <PaidPlanPrice
                  isAnnual={isAnnual}
                  monthly={PREMIUM_MONTHLY}
                  yearly={PREMIUM_YEARLY}
                />
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{t('allFreeBenefits')}</span>
                  </li>
                  {premiumOnlyFeatures.map((text) => (
                    <li key={text} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-sm">
                    <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">{t('weeklyDropsLabel')}</strong>{' '}
                      {t('weeklyDrops')}
                    </span>
                  </li>
                </ul>
                <div className="mt-auto space-y-3">
                  {!mounted || !isLoaded || !ready ? (
                    <>
                      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                    </>
                  ) : isSignedIn && hasPremiumPlan ? (
                    <>
                      <Badge className="w-full justify-center bg-blue-600 py-2 text-sm text-white hover:bg-blue-600">
                        {t('planActive')}
                      </Badge>
                      <Button
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        asChild
                      >
                        <PremiumAccessLink
                          membership="Premium"
                          href="/web-tags?membership=Premium"
                        >
                          {t('previewPremium')}
                        </PremiumAccessLink>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/profile">{t('managePremium')}</Link>
                      </Button>
                    </>
                  ) : isSignedIn ? (
                    <>
                      <Button
                        className="w-full bg-blue-600 text-white hover:bg-blue-700"
                        asChild
                      >
                        <a
                          href={premiumCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackPlanBuy('premium')}
                        >
                          {t('subscribePremium')}
                        </a>
                      </Button>
                      <Button variant="ghost" className="w-full" asChild>
                        <PremiumAccessLink
                          membership="Premium"
                          href="/web-tags?membership=Premium"
                        >
                          {t('previewPremium')}
                        </PremiumAccessLink>
                      </Button>
                    </>
                  ) : (
                    <>
                      <SignUpButton mode="redirect" forceRedirectUrl="/prices">
                        <div className="w-full cursor-pointer">
                          <Button
                            className="w-full pointer-events-none bg-blue-600 text-white hover:bg-blue-700"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            {t('subscribePremium')}
                          </Button>
                        </div>
                      </SignUpButton>
                      <Button variant="ghost" className="w-full" asChild>
                        <PremiumAccessLink
                          membership="Premium"
                          href="/web-tags?membership=Premium"
                        >
                          {t('previewPremium')}
                        </PremiumAccessLink>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Developer / Startup */}
            {/*
            <Card className="flex flex-col border-blue-500/50 shadow-lg relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Code2 className="w-6 h-6 text-blue-500" />
                    {tCommon('startup')}
                  </CardTitle>
                  <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                    {t('bestForBuilders')}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('startupDesc')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <PaidPlanPrice
                  isAnnual={isAnnual}
                  monthly={DEVELOPER_MONTHLY}
                  yearly={DEVELOPER_YEARLY}
                />
                <ul className="space-y-4 mb-8 flex-grow">
                  {developerOnlyFeatures.map((text) => (
                    <li key={text} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto space-y-3">
                  {!mounted || !isLoaded || !ready ? (
                    <>
                      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                    </>
                  ) : isSignedIn ? (
                    hasStartupPlan ? (
                      <>
                        <Badge className="w-full justify-center py-2 bg-blue-600 text-white hover:bg-blue-600">
                          {t('planActive')}
                        </Badge>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          asChild
                        >
                          <Link href="/landing-pages">{t('browseWebProjects')}</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link href="/dashboard/profile">{t('managePremium')}</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" className="w-full" asChild>
                          <Link href="/landing-pages">{t('browseWebProjects')}</Link>
                        </Button>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          asChild
                        >
                          <a href={startupCheckoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackPlanBuy('startup')}>
                            {t('subscribeBelow')}
                          </a>
                        </Button>
                      </>
                    )
                  ) : (
                    <>
                      <SignUpButton mode="redirect" forceRedirectUrl="/prices">
                        <div className="w-full cursor-pointer">
                          <Button className="w-full pointer-events-none bg-blue-600 hover:bg-blue-700 text-white">
                            <Code2 className="w-4 h-4 mr-2" />
                            {t('subscribeStartup')}
                          </Button>
                        </div>
                      </SignUpButton>
                      <Button variant="ghost" className="w-full" asChild>
                        <Link href="/landing-pages">{t('browseWebProjects')}</Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            */}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto">
            {t('footerNote')}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
