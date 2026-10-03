'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  useRefreshSubscriptionStatus,
  useStripeSubscription,
} from '@/hooks/use-stripe-subscription';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { FunnelPageAnalytics } from '@/components/funnel-page-analytics';
import {
  getPlanCheckoutUrl,
  isPlanAvailable,
} from '@/lib/stripe-checkout';
import { getPlanCredits, getPlanPrice as getConfiguredPlanPrice, type PlanId } from '@/lib/subscription-plans';
import { CREDIT_PACKS, formatCreditPackPrice, centsPerCredit } from '@/lib/credit-packs';
import { useAuth } from '@clerk/nextjs';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

type PlanMetadata = {
  id: PlanId;
  nameKey: string;
  descKey: string;
  ctaKey: string;
  featuresKey: string;
  isMostPopular: boolean;
};

type PaidPlan = {
  id: PlanId;
  name: string;
  desc: string;
  cta: string;
  features: string[];
  monthly: number;
  annual: number;
  credits: number;
  isMostPopular: boolean;
};

function formatMonthlyEquivalent(yearly: number) {
  return (yearly / 12).toFixed(2).replace(/\.00$/, '');
}

function PaidPlanPrice({ isAnnual, monthly, yearly }: { isAnnual: boolean; monthly: number; yearly: number }) {
  const tPrices = useTranslations('prices');
  const displayPrice = isAnnual ? yearly : monthly;
  const priceSuffix = isAnnual ? tPrices('perYear') : tPrices('perMonth');
  const savings = monthly * 12 - yearly;
  const discountPercent = monthly > 0 ? Math.round((savings / (monthly * 12)) * 100) : 0;

  return (
    <>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
        <span className="text-5xl font-bold tabular-nums">${displayPrice}</span>
        <span className="text-muted-foreground">{priceSuffix}</span>
        {isAnnual && savings > 0 && (
          <span className="ml-1 inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {discountPercent}% OFF
          </span>
        )}
      </div>
      {monthly === 0 ? (
        <p className="text-sm text-muted-foreground mb-6">{tPrices('noCreditCard')}</p>
      ) : isAnnual ? (
        <div className="mb-6 space-y-1">
          <p className="text-sm text-muted-foreground">
            {tPrices('equivalentMonthly', { amount: formatMonthlyEquivalent(yearly) })}
          </p>
          {savings > 0 && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {tPrices('savePerYearDiscount', { amount: savings, percent: discountPercent })}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">{tPrices('billedMonthly')}</p>
      )}
    </>
  );
}

const PLAN_METADATA: PlanMetadata[] = [
  { id: 'free', nameKey: 'freeName', descKey: 'freeDesc', ctaKey: 'freeSubscribe', featuresKey: 'freeFeatures', isMostPopular: false },
  { id: 'premium', nameKey: 'premiumName', descKey: 'premiumDesc', ctaKey: 'premiumSubscribe', featuresKey: 'premiumFeatures', isMostPopular: false },
  { id: 'creator', nameKey: 'creatorName', descKey: 'creatorDesc', ctaKey: 'creatorSubscribe', featuresKey: 'creatorFeatures', isMostPopular: false },
  { id: 'pro', nameKey: 'proName', descKey: 'proDesc', ctaKey: 'proSubscribe', featuresKey: 'proFeatures', isMostPopular: true },
  { id: 'studio', nameKey: 'studioName', descKey: 'studioDesc', ctaKey: 'studioSubscribe', featuresKey: 'studioFeatures', isMostPopular: false },
]

export default function PricesClient() {
  const t = useTranslations('prices');
  const locale = useLocale() as 'en' | 'es';
  const [isAnnual, setIsAnnual] = useState(false);
  const searchParams = useSearchParams();
  const refreshSubscription = useRefreshSubscriptionStatus();
  const checkoutRefreshDone = useRef(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { plan, ready } = useStripeSubscription();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || checkoutRefreshDone.current) return;
    const checkout =
      searchParams.get('checkout') === 'success' ||
      searchParams.has('session_id');
    if (!checkout) return;
    checkoutRefreshDone.current = true;
    refreshSubscription();
  }, [isLoaded, isSignedIn, searchParams, refreshSubscription]);

  // Build localized plan objects from metadata + translation keys
  const PLANS: PaidPlan[] = PLAN_METADATA.map((meta) => ({
    id: meta.id,
    name: t(meta.nameKey as Parameters<typeof t>[0]),
    desc: t(meta.descKey as Parameters<typeof t>[0]),
    cta: t(meta.ctaKey as Parameters<typeof t>[0]),
    features: t.raw(meta.featuresKey as Parameters<typeof t>[0]) as string[],
    monthly: getConfiguredPlanPrice(meta.id, 'monthly'),
    annual: getConfiguredPlanPrice(meta.id, 'annual'),
    credits: getPlanCredits(meta.id, 'monthly'),
    isMostPopular: meta.isMostPopular,
  }));

  const getPlanPrice = (planId: PlanId, annual: boolean): number =>
    getConfiguredPlanPrice(planId, annual ? 'annual' : 'monthly');

  const handleSelectPlan = (planId: PlanId) => {
    trackAnalyticsEvent('select_plan', {
      plan: planId,
      billing_period: isAnnual ? 'yearly' : 'monthly',
      price: getPlanPrice(planId, isAnnual),
      currency: 'USD',
    });
  };

  const getCheckoutUrl = (planId: PlanId) => {
    if (planId === 'free') return '/prompts';
    return getPlanCheckoutUrl(planId, isAnnual, userId);
  };

  const getCTA = (paidPlan: PaidPlan) => {
    if (paidPlan.id === 'free') {
      return (
        <Button variant="outline" className="w-full" asChild>
          <Link href="/prompts">
            <Zap className="w-4 h-4 mr-2" />
            {t('browseFree')}
          </Link>
        </Button>
      );
    }

    if (!mounted) {
      return <div className="h-10 w-full animate-pulse rounded-md bg-muted" />;
    }

    const isActive = ready && paidPlan.id === plan;

    if (isSignedIn && isActive) {
      return (
        <Badge className="w-full justify-center bg-blue-600 py-2 text-sm text-white hover:bg-blue-600">
          {t('planActive')}
        </Badge>
      );
    }

    const checkoutUrl = getCheckoutUrl(paidPlan.id);

    return (
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        asChild
        onClick={() => {
          handleSelectPlan(paidPlan.id);
          trackAnalyticsEvent('begin_checkout', {
            plan: paidPlan.id,
            billing_period: isAnnual ? 'yearly' : 'monthly',
            price: getPlanPrice(paidPlan.id, isAnnual),
            currency: 'USD',
          });
        }}
      >
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
          {paidPlan.cta}
        </a>
      </Button>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <FunnelPageAnalytics eventName="view_pricing" />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline mb-4">
              {t('chooseHowYouCreate')}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>


          {/* Billing toggle */}
          <div
            className="mb-10 mx-auto flex w-full max-w-sm rounded-full border border-blue-500/55 bg-slate-950 p-1.5 shadow-[0_12px_35px_rgba(37,99,235,0.18)]"
            role="group"
            aria-label={t('billingCycle')}
          >
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              aria-pressed={!isAnnual}
              className={`min-w-0 flex-1 rounded-full px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 sm:px-6 sm:text-sm ${
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
              className={`min-w-0 flex-1 rounded-full px-3 py-3 text-xs font-semibold whitespace-nowrap transition-all duration-200 sm:px-6 sm:text-sm ${
                isAnnual
                  ? '!bg-blue-600 !text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] ring-1 ring-blue-400'
                  : '!text-slate-200 hover:!bg-blue-950/60 hover:!text-white'
              }`}
            >
              <span>{t('yearlyBilling')}</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                {t('savePercentTag')}
              </span>
            </button>
          </div>

          <div className="mx-auto grid max-w-[90rem] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 xl:gap-6">
            {PLANS.map((plan) => {
              const available = plan.id === 'free' || plan.id === 'premium' || isPlanAvailable(plan.id, isAnnual);

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.isMostPopular
                      ? 'border-violet-500 shadow-lg shadow-violet-500/10 lg:scale-[1.02]'
                      : 'border-muted-foreground/20 shadow-sm'
                  } ${!available ? 'border-dashed' : ''}`}
                >
                                    {plan.isMostPopular && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />
                      <Badge className="absolute top-4 right-4 bg-violet-500 text-white hover:bg-violet-600">
                        {t('mostPopular')}
                      </Badge>
                    </>
                  )}
                  {!available && (
                    <Badge className="absolute top-4 right-4 bg-slate-600 text-white hover:bg-slate-600 border-0">
                      {t('comingSoon')}
                    </Badge>
                  )}
                  <CardHeader className="pb-4 pt-8">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="font-headline text-2xl">
                        {plan.id === 'premium' && <Crown className="w-6 h-6 text-blue-500 mr-2 inline" />}
                        {plan.id === 'pro' && <Sparkles className="w-6 h-6 text-violet-500 mr-2 inline" />}
                        {plan.id === 'studio' && <Zap className="w-6 h-6 text-amber-500 mr-2 inline" />}
                        {plan.name}
                      </CardTitle>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {plan.desc}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-6">
                      <PaidPlanPrice
                        isAnnual={isAnnual}
                        monthly={plan.monthly}
                        yearly={plan.annual}
                      />
                      {plan.id !== 'free' && (
                        <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-bold text-amber-700 dark:text-amber-300">
                              {getPlanCredits(plan.id, isAnnual ? 'annual' : 'monthly').toLocaleString()} {t('pendingCreditsLabel')}
                            </span>
                            <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300">
                              {t('pendingStatus')}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {t('pendingCreditsNote')}{' '}
                            <Link href="/crowdfunding" className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-blue-400">
                              {t('pendingCreditsLink')}
                            </Link>
                          </p>
                        </div>
                      )}
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      {!available ? (
                        <Button
                          className="w-full bg-slate-700 hover:bg-slate-700 text-slate-300 cursor-not-allowed"
                          disabled
                        >
                          {t('comingSoon')}
                        </Button>
                      ) : (
                        getCTA(plan)
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <section className="mt-14 rounded-3xl border bg-card p-6 sm:p-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold">{t('creditUseTitle')}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('creditUseSubtitle')}</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { title: t('creditTextTitle'), lines: [t('creditTextShort'), t('creditTextLong'), t('creditTextComplex')] },
                { title: t('creditImageTitle'), lines: [t('creditImageLite'), t('creditImage1K'), t('creditImage2K'), t('creditImage4K')] },
                { title: t('creditVideoTitle'), lines: [t('creditVideoLite720'), t('creditVideoLite1080'), t('creditVideoFast720'), t('creditVideoFast1080'), t('creditVideoPremium')] },
                { title: t('creditWebsiteTitle'), lines: [t('creditWebsiteSimple'), t('creditWebsiteAdvanced'), t('creditWebsiteComplex')] },
              ].map(group => (
                <div key={group.title} className="rounded-2xl border bg-muted/20 p-4">
                  <h3 className="font-semibold">{group.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {group.lines.map(line => <li key={line}>{line}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">{t('creditMarginNote')}</p>
          </section>

          <section className="mt-14">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold font-headline mb-4">{t('buyMoreCreditsTitle')}</h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('buyMoreCreditsDescription')}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {CREDIT_PACKS.map(pack => {
                const baseRate = centsPerCredit(CREDIT_PACKS[0]);
                const savingsPercent = Math.round((1 - centsPerCredit(pack) / baseRate) * 100);
                
                return (
                  <article key={pack.id} className={`relative flex flex-col rounded-2xl border bg-card p-5 shadow-sm ${pack.featured ? 'border-primary ring-1 ring-primary/30' : ''}`}>
                    {pack.featured && <span className="absolute -top-2.5 left-5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">{t('mostChosen')}</span>}
                    <p className="text-2xl font-bold">{pack.credits} <span className="text-base font-medium text-muted-foreground">{t('creditsLabel')}</span></p>
                    {pack.bonusCredits > 0 && <p className="mt-1 flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400"><Sparkles className="size-3.5" /> {t('bonusIncluded', { bonus: pack.bonusCredits })}</p>}
                    <p className="mt-3 text-sm text-muted-foreground">{pack.description[locale]}</p>
                    <p className="mt-4 text-xl font-semibold">{formatCreditPackPrice(pack, locale)}</p>
                    {savingsPercent > 0 && <p className="text-xs text-muted-foreground">{t('savePerCredit', { percent: savingsPercent })}</p>}
                    <Button className="mt-5 w-full bg-slate-700 hover:bg-slate-700 text-slate-300 cursor-not-allowed" disabled>
                       {t('buyCredits')}
                    </Button>
                  </article>
                );
              })}
            </div>
          </section>

          <p className="text-center text-sm text-muted-foreground mt-12 max-w-2xl mx-auto">
            {t('footerNote')}
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
