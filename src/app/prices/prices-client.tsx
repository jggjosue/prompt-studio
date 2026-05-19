'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { PremiumAccessLink } from '@/components/premium-access-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import { getPremiumStripeCheckoutUrl } from '@/lib/stripe-checkout';
import { SignInButton, SignUpButton, useAuth } from '@clerk/nextjs';
import {
  Check,
  // Code2,
  Crown,
  Download,
  Sparkles,
  // Terminal,
  UserPlus,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useId, useState } from 'react';

const PREMIUM_MONTHLY = 10;
const PREMIUM_YEARLY = 100;
// const DEVELOPER_MONTHLY = 15;
// const DEVELOPER_YEARLY = 150;

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
            <span className="text-primary font-medium">
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
  const annualBillingId = useId();
  const [isAnnual, setIsAnnual] = useState(false);
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { plan, ready } = useStripeSubscription();
  const hasPremiumPlan = ready && (plan === 'premium' || plan === 'startup');

  const freeFeatures = t.raw('freeFeatures') as string[];
  const premiumOnlyFeatures = t.raw('premiumFeatures') as string[];
  // const developerOnlyFeatures = t.raw('developerFeatures') as string[];

  const annualSavingsPremium = PREMIUM_MONTHLY * 12 - PREMIUM_YEARLY;
  // const annualSavingsDeveloper = DEVELOPER_MONTHLY * 12 - DEVELOPER_YEARLY;

  const premiumCheckoutUrl = getPremiumStripeCheckoutUrl(isAnnual, userId);

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

          <div className="mb-10 max-w-lg mx-auto p-4 rounded-lg border bg-muted/40">
            <div className="flex items-start gap-3">
              <Checkbox
                id={annualBillingId}
                checked={isAnnual}
                onCheckedChange={(checked) => setIsAnnual(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor={annualBillingId}
                  className="text-sm font-semibold cursor-pointer"
                >
                  {t('annualBilling')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {t('annualBillingHint', {
                    premiumYear: PREMIUM_YEARLY,
                    premiumSave: annualSavingsPremium,
                    devYear: 0,
                    devSave: 0,
                  })}
                </p>
              </div>
            </div>
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
                  {freeFeatures.map((text) => (
                    <li key={text} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
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
            <Card className="flex flex-col border-primary/40 shadow-md relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-violet-500 to-primary" />
              <CardHeader className="pb-4 pt-8">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Crown className="w-6 h-6 text-primary" />
                    {tCommon('premium')}
                  </CardTitle>
                  <Badge className="bg-primary text-primary-foreground">
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
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>{text}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-3 text-sm">
                    <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground">{t('weeklyDropsLabel')}</strong>{' '}
                      {t('weeklyDrops')}
                    </span>
                  </li>
                </ul>
                <div className="mt-auto space-y-3">
                  {isLoaded && isSignedIn && hasPremiumPlan ? (
                    <>
                      <Badge className="w-full justify-center py-2 text-sm">
                        {t('planActive')}
                      </Badge>
                      <Button className="w-full" asChild>
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
                  ) : isLoaded && isSignedIn ? (
                    <>
                      <Button className="w-full" asChild>
                        <a
                          href={premiumCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
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
                      <Button className="w-full" asChild>
                        <a
                          href={premiumCheckoutUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          {t('subscribePremium')}
                        </a>
                      </Button>
                      <SignUpButton mode="redirect" forceRedirectUrl="/prices">
                        <Button variant="secondary" className="w-full">
                          {tCommon('signUp')}
                        </Button>
                      </SignUpButton>
                      <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                        <Button variant="outline" className="w-full">
                          {tCommon('signIn')}
                        </Button>
                      </SignInButton>
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

            {/* Plan Startup — oculto de momento */}
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
