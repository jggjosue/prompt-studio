import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { getServerSubscriptionStatus, hasComponentBuilderPlan } from '@/lib/server-subscription-status';
import ComponentBuilderClient from './component-builder-client';
import ComponentBuilderPremiumGate from './premium-gate';

export const metadata: Metadata = {
  title: 'Constructor Visual de Componentes | Prompt Studio',
  description: 'Personaliza componentes visualmente y copia un prompt listo para React y Next.js.',
  alternates: { canonical: '/component-builder' },
  // Es un editor de producto, no una landing editorial.
  robots: { index: false, follow: true },
};

/**
 * El constructor es Premium: la comprobación se hace en servidor contra el
 * estado que Stripe sincroniza con Clerk, no contra un flag del navegador.
 */
export const dynamic = 'force-dynamic';

export default async function ComponentBuilderPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { userId } = await auth();
  if (!userId) return <ComponentBuilderPremiumGate reason="anonymous" locale={locale} />;

  const status = await getServerSubscriptionStatus();
  if (!hasComponentBuilderPlan(status)) {
    return <ComponentBuilderPremiumGate reason="unpaid" locale={locale} />;
  }

  return <ComponentBuilderClient />;
}
