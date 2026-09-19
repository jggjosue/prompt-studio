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
import {
  getPlanCheckoutUrl,
  isPlanAvailable,
} from '@/lib/stripe-checkout';
import { trackAnalyticsEvent } from '@/lib/analytics';
import { SignUpButton, useAuth } from '@clerk/nextjs';
import { Check, Crown, Sparkles, UserPlus, Zap } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { type PlanId } from '@/lib/subscription-plans';

type PaidPlan = {
  id: PlanId;
  name: string;
  monthly: number;
  annual: number;
  credits: number;
  isMostPopular: boolean;
  features: string[];
  cta: string;
};

function formatMonthlyEquivalent(yearly: number) {
  return (yearly / 12).toFixed(2).replace(/\.00$/, '');
}

function PaidPlanPrice({ isAnnual, monthly, yearly }: { isAnnual: boolean; monthly: number; yearly: number }) {
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
          {tCommon('equivalentMonthly', { amount: formatMonthlyEquivalent(yearly) })}
          {savings > 0 && (
            <span className="text-blue-500 font-medium">
              {' '}
              {tCommon('savePerYear', { amount: savings })}
            </span>
          )}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">{tCommon('billedMonthly')}</p>
      )}
    </>
  );
}

const PLANS: PaidPlan[] = [
  {
    id: 'free',
    name: 'Free',
    monthly: 0,
    annual: 0,
    credits: 1,
    isMostPopular: false,
    features: [
      'Explora prompts y herramientas de IA gratuitas',
      'Copia prompts libres',
      'Acceso al chat básico',
      '1 crédito para probar generación',
      'Sin tarjeta de crédito',
      'Anuncios incluidos',
    ],
    cta: 'Get started free',
  },
  {
    id: 'creator',
    name: 'Creator',
    monthly: 9,
    annual: 90,
    credits: 250,
    isMostPopular: false,
    features: [
      'Todo en Free',
      '250 créditos de IA cada ciclo',
      'Editor Creative Prompt Studio',
      'Generación de imágenes',
      'Modelos Gemini, OpenAI y Claude',
      'Sin anuncios',
    ],
    cta: 'Start Creator',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 19,
    annual: 190,
    credits: 1000,
    isMostPopular: true,
    features: [
      'Todo en Creator',
      '1,000 créditos cada ciclo',
      'Web Creator y herramientas web',
      'Herramientas avanzadas de imagen',
      'Modelos de IA avanzados',
      'Catálogo Premium completo',
      'Límites de generación más altos',
      'Sin anuncios',
    ],
    cta: 'Start Pro',
  },
  {
    id: 'studio',
    name: 'Studio',
    monthly: 39,
    annual: 390,
    credits: 3000,
    isMostPopular: false,
    features: [
      'Todo en Pro',
      '3,000 créditos cada ciclo',
      'Límites de generación más altos',
      'Acceso prioritario',
      'Más proyectos e historial',
      'Acceso anticipado a nuevas funciones',
    ],
    cta: 'Start Studio',
  },
];

export default function PricesClient() {
  const t = useTranslations('prices');
  const tCommon = useTranslations('common');
  const locale = useLocale() ?? 'en';
  const isSpanish = locale.startsWith('es');
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

  const isCreatorAvailable = isPlanAvailable('creator');
  const isProAvailable = isPlanAvailable('pro');
  const isStudioAvailable = isPlanAvailable('studio');
  const getPlanPrice = (planId: PlanId, isAnnual: boolean): number => {
    if (planId === 'free') return 0;
    const prices: Record<'creator' | 'pro' | 'studio', { monthly: number; annual: number }> = {
      creator: { monthly: 9, annual: 90 },
      pro: { monthly: 19, annual: 190 },
      studio: { monthly: 39, annual: 390 },
    };
    return prices[planId][isAnnual ? 'annual' : 'monthly'];
  };

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
    if (!isSignedIn) return null;
    return getPlanCheckoutUrl(planId as 'creator' | 'pro' | 'studio', isAnnual, userId);
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

    const checkoutUrl = getCheckoutUrl(paidPlan.id);

    if (!mounted || !isLoaded || !ready) {
      return <div className="h-10 w-full animate-pulse rounded-md bg-muted" />;
    }

    const isActive = ready && (
      (paidPlan.id === 'creator' && plan === 'creator') ||
      (paidPlan.id === 'pro' && plan === 'pro') ||
      (paidPlan.id === 'studio' && plan === 'studio')
    );

    if (isSignedIn && isActive) {
      return (
        <Badge className="w-full justify-center bg-blue-600 py-2 text-sm text-white hover:bg-blue-600">
          {t('planActive')}
        </Badge>
      );
    }

    // Usuario no autenticado → signUp y luego vuelve a /prices
    if (!isSignedIn) {
      return (
        <SignUpButton mode="redirect" forceRedirectUrl="/prices">
          <Button className="w-full" onClick={() => handleSelectPlan(paidPlan.id)}>
            <UserPlus className="w-4 h-4 mr-2" />
            {paidPlan.cta}
          </Button>
        </SignUpButton>
      );
    }

    // Autenticado pero sin URL de Stripe configurada
    if (!checkoutUrl) {
      return (
        <Button className="w-full" disabled>
          {tCommon('comingSoon')}
        </Button>
      );
    }

    // Autenticado con URL de Stripe → enlace directo al checkout
    return (
      <Button className="w-full" asChild onClick={() => {
        handleSelectPlan(paidPlan.id);
        trackAnalyticsEvent('begin_checkout', {
          plan: paidPlan.id,
          billing_period: isAnnual ? 'yearly' : 'monthly',
          price: getPlanPrice(paidPlan.id, isAnnual),
          currency: 'USD',
        });
      }}>
        <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
          {paidPlan.cta}
        </a>
      </Button>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-6xl min-w-0">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
              {t('chooseHowYouCreate')}
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
              {tCommon('monthlyBilling')}
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
              {tCommon('yearlyBilling')}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-4 max-w-7xl">
            {PLANS.map((plan) => {
              const available = plan.id === 'free' ||
                (plan.id === 'creator' && isCreatorAvailable) ||
                (plan.id === 'pro' && isProAvailable) ||
                (plan.id === 'studio' && isStudioAvailable);

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    plan.isMostPopular
                      ? 'border-violet-500 shadow-lg shadow-violet-500/10 scale-[1.02]'
                      : 'border-muted-foreground/20 shadow-sm'
                  } ${!available ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {plan.isMostPopular && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />
                      <Badge className="absolute top-4 right-4 bg-violet-500 text-white hover:bg-violet-600">
                        {t('mostPopular')}
                      </Badge>
                    </>
                  )}
                  <CardHeader className="pb-4 pt-8">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="font-headline text-2xl">
                        {plan.id === 'creator' && <Crown className="w-6 h-6 text-blue-500 mr-2 inline" />}
                        {plan.id === 'pro' && <Sparkles className="w-6 h-6 text-violet-500 mr-2 inline" />}
                        {plan.id === 'studio' && <Zap className="w-6 h-6 text-amber-500 mr-2 inline" />}
                        {plan.name}
                      </CardTitle>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {isSpanish
                        ? plan.id === 'free' ? 'Explora gratis las herramientas de IA'
                          : plan.id === 'creator' ? 'Herramientas creativas con créditos'
                          : plan.id === 'pro' ? 'El más popular. Máximas herramientas'
                          : 'El máximo nivel de creación'
                        : plan.id === 'free' ? 'Explore AI tools for free'
                          : plan.id === 'creator' ? 'Creative tools with credits'
                          : plan.id === 'pro' ? 'Most popular. Maximum tools'
                          : 'The ultimate creation tier'}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="space-y-3 mb-6">
                      <PaidPlanPrice
                        isAnnual={isAnnual}
                        monthly={plan.monthly}
                        yearly={plan.annual}
                      />
                      <div className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/5 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                        <Zap className="h-3.5 w-3.5 text-blue-500" />
                        <span>
                          {isSpanish
                            ? `${plan.credits} ${plan.id === 'free' ? 'crédito inicial' : 'créditos'} de IA`
                            : `${plan.credits} ${plan.id === 'free' ? 'free credit' : 'AI credits'}`}
                        </span>
                      </div>
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
                      {getCTA(plan)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* ── Cómo funcionan los créditos ── */}
          <div className="mt-20 border-t border-border/40 pt-16">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-violet-500/15 text-violet-400 border border-violet-500/30">
                {t('howCreditsWork')}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-headline mb-3">
                {t('howCreditsWork')}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
                {t('creditsExplanation')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { label: t('creditExampleFast'), icon: '⚡' },
                { label: t('creditExampleAdvanced'), icon: '🔬' },
                { label: t('creditExamplePremium'), icon: '⭐' },
                { label: t('creditExampleImage'), icon: '🖼️' },
                { label: t('creditExampleVideo'), icon: '🎬' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-lg border border-border/60 p-4">
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                {t('needMoreCredits')}
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
