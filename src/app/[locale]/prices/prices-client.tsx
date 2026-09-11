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
  getProStripeCheckoutUrl,
  isProPlanAvailable,
} from '@/lib/stripe-checkout';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import { Check, Code2, Crown, Download, Rocket, Sparkles, UserPlus, X, Zap } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CREDIT_PACKS, formatCreditPackPrice } from '@/lib/credit-packs';

const PREMIUM_MONTHLY = 9;
const PREMIUM_YEARLY = 54;
const PRO_MONTHLY = 39;
const PRO_YEARLY = 390;
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
  const locale = useLocale();
  const isSpanish = locale === 'es';
  const [isAnnual, setIsAnnual] = useState(false);
  const searchParams = useSearchParams();
  const refreshSubscription = useRefreshSubscriptionStatus();
  const checkoutRefreshDone = useRef(false);
  const conversionTracked = useRef(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { plan, ready } = useStripeSubscription();
  const hasPremiumPlan = ready && (plan === 'premium' || plan === 'startup');
  const hasStartupPlan = ready && plan === 'startup';
  const hasProPlan = ready && (plan === 'pro' || plan === 'startup');
  /**
   * El tramo Pro solo se muestra cuando hay enlaces de pago configurados. Sin
   * ellos la tarjeta mandaría a un enlace vacío, así que la página se queda
   * exactamente como estaba hasta que el precio exista en Stripe.
   */
  const proAvailable = isProPlanAvailable();
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

  useEffect(() => {
    const checkoutSucceeded =
      searchParams.get('checkout') === 'success' || searchParams.has('session_id');
    if (!checkoutSucceeded || !hasPremiumPlan || conversionTracked.current) return;
    conversionTracked.current = true;
    trackAnalyticsEvent('free_to_premium_conversion', {
      item_id: `plan-${plan}`,
      item_name: `${plan} plan`,
      item_category: 'subscription',
      plan: plan ?? 'premium',
      action_source: 'stripe-checkout-return',
    });
  }, [hasPremiumPlan, plan, searchParams]);

  const freeFeatures = t.raw('freeFeatures') as string[];
  const premiumOnlyFeatures = t.raw('premiumFeatures') as string[];
  const developerOnlyFeatures = t.raw('developerFeatures') as string[];

  const annualSavingsPercent = Math.round(
    (1 - PREMIUM_YEARLY / (PREMIUM_MONTHLY * 12)) * 100
  );

  const premiumCheckoutUrl = getPremiumStripeCheckoutUrl(isAnnual, userId);
  const startupCheckoutUrl = getStartupStripeCheckoutUrl(isAnnual, userId);
  const proCheckoutUrl = getProStripeCheckoutUrl(isAnnual, userId);
  const trackPlanBuy = (planName: 'premium' | 'pro' | 'startup') => {
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

          <div className={`grid grid-cols-1 gap-8 mx-auto ${proAvailable ? 'lg:grid-cols-3 max-w-6xl' : 'lg:grid-cols-2 max-w-4xl'}`}>
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
                <div className="mb-8 space-y-3">
                  <div>
                    <span className="text-5xl font-bold">$0</span>
                    <span className="text-muted-foreground">{tCommon('forever')}</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    <Zap className="h-3.5 w-3.5 text-blue-500" />
                    <span>
                      {isSpanish ? (
                        <>Incluye <strong className="text-foreground">3 créditos</strong> de prueba para IA</>
                      ) : (
                        <>Includes <strong className="text-foreground">3 trial credits</strong> for AI</>
                      )}
                    </span>
                  </div>
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
                <div className="space-y-3 mb-6">
                  <PaidPlanPrice
                    isAnnual={isAnnual}
                    monthly={PREMIUM_MONTHLY}
                    yearly={PREMIUM_YEARLY}
                  />
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-400">
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                    <span>
                      {isSpanish ? (
                        <>Usa modelos <strong className="text-foreground">Gemini 2.5</strong> con tus créditos</>
                      ) : (
                        <>Generate with <strong className="text-foreground">Gemini 2.5</strong> models</>
                      )}
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="w-5 h-5 shrink-0 mt-0.5" />
                    <span>{t('allFreeBenefits')}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <Zap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      {isSpanish ? (
                        <>
                          <strong className="text-foreground">Acceso a modelos de IA avanzados</strong> (Gemini 2.5 Flash / Pro, DALL-E, Claude) mediante sistema de créditos
                        </>
                      ) : (
                        <>
                          <strong className="text-foreground">Access to advanced AI models</strong> (Gemini 2.5 Flash / Pro, DALL-E, Claude) with credits
                        </>
                      )}
                    </span>
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

            {/* Pro */}
            {proAvailable && (
            <Card className="relative flex flex-col overflow-hidden border-violet-500/50 shadow-lg">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-violet-500" />
                    {t('proName')}
                  </CardTitle>
                  <Badge className="bg-violet-500 text-white hover:bg-violet-600">
                    {t('proBadge')}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('proDesc')}
                </p>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <div className="space-y-3 mb-6">
                  <PaidPlanPrice isAnnual={isAnnual} monthly={PRO_MONTHLY} yearly={PRO_YEARLY} />
                  <div className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-400">
                    <Zap className="h-3.5 w-3.5 text-violet-400" />
                    <span>
                      {isSpanish ? (
                        <>Publicaciones y generación con <strong className="text-foreground">créditos incluidos</strong></>
                      ) : (
                        <>Publishing & generation with <strong className="text-foreground">included credits</strong></>
                      )}
                    </span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 flex-grow">
                  {[t('proFeaturePublish'), t('proFeatureBrandKits'), t('proFeatureEverythingPremium')].map(text => (
                    <li key={text} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-violet-500 shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto space-y-3">
                  {!mounted || !isLoaded || !ready ? (
                    <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                  ) : !isSignedIn ? (
                    <SignUpButton mode="redirect" forceRedirectUrl="/prices">
                      <div className="w-full cursor-pointer">
                        <Button className="w-full pointer-events-none bg-violet-600 hover:bg-violet-700 text-white">
                          <Rocket className="w-4 h-4 mr-2" />
                          {t('proSubscribe')}
                        </Button>
                      </div>
                    </SignUpButton>
                  ) : hasProPlan ? (
                    <>
                      <Badge className="w-full justify-center py-2 bg-violet-600 text-white hover:bg-violet-600">
                        {t('planActive')}
                      </Badge>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/publications">{t('proManagePublications')}</Link>
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white" asChild>
                      <a href={proCheckoutUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackPlanBuy('pro')}>
                        {t('proSubscribe')}
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            )}

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

          {/* ── Recarga de Créditos (Credit Packs) ── */}
          <div className="mt-20 border-t border-border/40 pt-16">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-blue-500/15 text-blue-400 border border-blue-500/30">
                ⚡ Recarga Flexible
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">
                {isSpanish ? 'Packs de Créditos' : 'Credit Packs'}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
                {isSpanish
                  ? '¿Necesitas créditos adicionales sin cambiar de suscripción? Recarga cuando quieras. Sin caducidad.'
                  : 'Need extra credits without upgrading your plan? Top up whenever you want. No expiration.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {CREDIT_PACKS.map((pack) => {
                const priceFormatted = formatCreditPackPrice(pack, isSpanish ? 'es' : 'en');
                const pricePerCredit = (pack.priceCents / 100 / pack.credits).toFixed(2);
                return (
                  <Card
                    key={pack.id}
                    className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${
                      pack.featured
                        ? 'border-blue-500 shadow-lg shadow-blue-500/10 bg-gradient-to-b from-blue-500/5 to-transparent'
                        : 'border-border/60 hover:border-border'
                    }`}
                  >
                    {pack.featured && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-bl-lg">
                        {isSpanish ? 'Más Popular' : 'Most Popular'}
                      </div>
                    )}
                    <CardHeader className="pb-3 pt-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl font-extrabold text-foreground">
                          {pack.credits}
                        </span>
                        <span className="text-sm font-semibold text-blue-400">
                          {isSpanish ? 'créditos' : 'credits'}
                        </span>
                        {pack.bonusCredits > 0 && (
                          <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                            +{pack.bonusCredits} {isSpanish ? 'gratis' : 'bonus'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground min-h-[36px]">
                        {isSpanish ? pack.description.es : pack.description.en}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-grow pt-2">
                      <div className="mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black text-foreground">{priceFormatted}</span>
                          <span className="text-xs text-muted-foreground">USD</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          ${pricePerCredit} / {isSpanish ? 'crédito' : 'credit'}
                        </p>
                      </div>

                      <div className="mt-auto pt-4">
                        <Button
                          className={`w-full font-bold text-xs h-10 ${
                            pack.featured
                              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20'
                              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                          }`}
                          asChild
                        >
                          <Link href={`/dashboard/credits?pack=${pack.id}`}>
                            {isSpanish ? 'Comprar Créditos' : 'Buy Credits'}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                {isSpanish
                  ? 'Los créditos se aplican al instante y pueden usarse con cualquier modelo (Gemini, Claude, GPT-4o).'
                  : 'Credits apply instantly and can be used with any model (Gemini, Claude, GPT-4o).'}
              </p>
            </div>
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
