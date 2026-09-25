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
import { useAuth } from '@clerk/nextjs';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
  comingSoon?: boolean;
  features: string[];
  cta: string;
};

function formatMonthlyEquivalent(yearly: number) {
  return (yearly / 12).toFixed(2).replace(/\.00$/, '');
}

function PaidPlanPrice({ isAnnual, monthly, yearly }: { isAnnual: boolean; monthly: number; yearly: number }) {
  const tPrices = useTranslations('prices');
  const displayPrice = isAnnual ? yearly : monthly;
  const priceSuffix = isAnnual ? '/año' : '/mes';
  const savings = monthly * 12 - yearly;
  const discountPercent = monthly > 0 ? Math.round((savings / (monthly * 12)) * 100) : 0;

  return (
    <>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-5xl font-bold tabular-nums">${displayPrice}</span>
        <span className="text-muted-foreground">{priceSuffix}</span>
        {isAnnual && savings > 0 && (
          <span className="ml-1 inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {discountPercent}% OFF
          </span>
        )}
      </div>
      {monthly === 0 ? (
        <p className="text-sm text-muted-foreground mb-6">Sin tarjeta de crédito</p>
      ) : isAnnual ? (
        <div className="mb-6 space-y-1">
          <p className="text-sm text-muted-foreground">
            {tPrices('equivalentMonthly', { amount: formatMonthlyEquivalent(yearly) })}
          </p>
          {savings > 0 && (
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Ahorras ${savings}/año ({discountPercent}% de descuento)
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-6">{tPrices('billedMonthly')}</p>
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
    credits: 0,
    isMostPopular: false,
    features: [
      'Catálogo completo de botones, cards, headers y más',
      'Animaciones web gratuitas con código copiable',
      'Vista previa interactiva de todos los componentes',
      'Prompts visibles en catálogo sin límite de lectura',
      'Buscador Inteligente',
      'Descarga de prompts personalizados',
      'Exportación de prompts por plataforma',
      'Copias de prompts ilimitadas por día',
      'Copias de prompts de Componentes UI',
      'Copias de prompts de Animaciones',
      'Copias de prompts de Videos',
      'Copias de prompts de Imagenes',
      'Copias de prompts de Paginas Web',
      'Buscador Inteligente',
      'Comparador de Componentes',
      'Sin tarjeta de crédito requerida',
      'Sin anuncios',
    ],
    cta: 'Explorar gratis',
  },
  {
    id: 'creator',
    name: 'Creator',
    monthly: 9,
    annual: 90,
    credits: 0,
    isMostPopular: false,
    features: [
      'Todo en Free',
      'Generación de Paginas con Page Composer',
      'Catálogo completo de botones, cards, headers y más (Premium)',
      'Copias de prompts de Paginas Web (Premium)',
      'Kids Completosn (Premium)'
    ],
    cta: 'Empezar con Creator',
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 19,
    annual: 190,
    credits: 0,
    isMostPopular: true,
    comingSoon: true,
    features: [
      'Todo en Creator',
      'Web Creator y herramientas web avanzadas',
      'Herramientas avanzadas de imagen y generación',
      'Modelos de IA avanzados',
      'Catálogo Premium completo desbloqueado',
      'Publicación y exportación de páginas web',
    ],
    cta: 'Empezar con Pro',
  },
  {
    id: 'studio',
    name: 'Studio',
    monthly: 39,
    annual: 390,
    credits: 0,
    isMostPopular: false,
    comingSoon: true,
    features: [
      'Todo en Pro',
      'Generación ilimitada de prompts y exportaciones',
      'Acceso prioritario a servidores',
      'Más proyectos e historial extendido',
      'Kids Completos para construir productos',
      'Web creator para desarrollar aplicaciones web con IA',

      'Acceso anticipado a nuevas funciones',
    ],
    cta: 'Empezar con Studio',
  },
];

export default function PricesClient() {
  const t = useTranslations('prices');
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

    if (!mounted) {
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
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-6xl min-w-0">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold font-headline mb-4">
              {t('chooseHowYouCreate')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comienza gratis y mejora cuando necesites más funciones premium, modelos avanzados y herramientas creativas.
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
              className={`rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 sm:px-9 ${!isAnnual
                ? '!bg-blue-600 !text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] ring-1 ring-blue-400'
                : '!text-slate-200 hover:!bg-blue-950/60 hover:!text-white'
                }`}
            >
              Mensual
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              aria-pressed={isAnnual}
              className={`flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold transition-all duration-200 sm:px-9 ${isAnnual
                ? '!bg-blue-600 !text-white shadow-[0_8px_24px_rgba(37,99,235,0.4)] ring-1 ring-blue-400'
                : '!text-slate-200 hover:!bg-blue-950/60 hover:!text-white'
                }`}
            >
              <span>Anual</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                Ahorra ~17%
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8 mx-auto lg:grid-cols-4 max-w-7xl">
            {PLANS.map((paidPlanItem) => {
              const available = paidPlanItem.id === 'free' ||
                (paidPlanItem.id === 'creator' && isCreatorAvailable) ||
                (paidPlanItem.id === 'pro' && isProAvailable) ||
                (paidPlanItem.id === 'studio' && isStudioAvailable);

              return (
                <Card
                  key={paidPlanItem.id}
                  className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl ${paidPlanItem.isMostPopular
                    ? 'border-violet-500 shadow-lg shadow-violet-500/10 scale-[1.02]'
                    : 'border-muted-foreground/20 shadow-sm'
                    } ${paidPlanItem.comingSoon ? 'opacity-60 select-none' : ''} ${!available && !paidPlanItem.comingSoon ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {paidPlanItem.comingSoon && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-500 via-slate-400 to-slate-500" />
                  )}
                  {paidPlanItem.isMostPopular && !paidPlanItem.comingSoon && (
                    <>
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500" />
                      <Badge className="absolute top-4 right-4 bg-violet-500 text-white hover:bg-violet-600">
                        {t('mostPopular')}
                      </Badge>
                    </>
                  )}
                  {paidPlanItem.comingSoon && (
                    <Badge className="absolute top-4 right-4 bg-slate-600 text-white hover:bg-slate-600 border-0">
                      Próximamente
                    </Badge>
                  )}
                  <CardHeader className="pb-4 pt-8">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="font-headline text-2xl">
                        {paidPlanItem.id === 'creator' && <Crown className="w-6 h-6 text-blue-500 mr-2 inline" />}
                        {paidPlanItem.id === 'pro' && <Sparkles className="w-6 h-6 text-violet-500 mr-2 inline" />}
                        {paidPlanItem.id === 'studio' && <Zap className="w-6 h-6 text-amber-500 mr-2 inline" />}
                        {paidPlanItem.name}
                      </CardTitle>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {paidPlanItem.id === 'free'
                        ? 'Explora el catálogo completo de componentes gratis'
                        : paidPlanItem.id === 'creator'
                          ? 'Constructor visual, descargas y Page Composer'
                          : paidPlanItem.id === 'pro'
                            ? 'El más popular. Máximas herramientas y catálogo Premium'
                            : 'El máximo nivel de creación sin límites'}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="mb-6">
                      <PaidPlanPrice
                        isAnnual={isAnnual}
                        monthly={paidPlanItem.monthly}
                        yearly={paidPlanItem.annual}
                      />
                    </div>
                    <ul className="space-y-3 mb-8 flex-grow">
                      {paidPlanItem.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm">
                          <Check className="w-5 h-5 shrink-0 mt-0.5 text-blue-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto">
                      {paidPlanItem.comingSoon ? (
                        <Button
                          className="w-full bg-slate-700 hover:bg-slate-700 text-slate-300 cursor-not-allowed"
                          disabled
                        >
                          Próximamente
                        </Button>
                      ) : (
                        getCTA(paidPlanItem)
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
