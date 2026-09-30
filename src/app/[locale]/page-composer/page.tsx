import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { getServerSubscriptionStatus, hasComponentBuilderPlan } from '@/lib/server-subscription-status';
import PageComposerClient from './page-composer-client';
import PageComposerPremiumGate from './page-composer-premium-gate';

export const metadata: Metadata = {
  title: 'Generador de Páginas por Componentes | Prompt Studio',
  description: 'Combina componentes, genera un prompt maestro y descarga un proyecto Next.js coherente.',
  alternates: { canonical: '/page-composer' },
  robots: { index: false, follow: true },
};

/** El generador requiere el plan Creator o superiores, comprobado en servidor. */
export const dynamic = 'force-dynamic';

export default async function PageComposerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await auth();
  if (!userId) return <PageComposerPremiumGate reason="anonymous" locale={locale} />;

  const status = await getServerSubscriptionStatus();
  if (!hasComponentBuilderPlan(status)) {
    return <PageComposerPremiumGate reason="unpaid" locale={locale} />;
  }

  return <PageComposerClient />;
}