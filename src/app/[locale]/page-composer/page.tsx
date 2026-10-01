import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import {
  getServerSubscriptionStatus,
  hasComponentBuilderPlan,
} from '@/lib/server-subscription-status';
import { loadSourcePageTemplates } from '@/lib/page-builder/source-template-catalog';
import VisualPageComposerClient from './page-composer-editor-client';
import PageComposerPremiumGate from './page-composer-premium-gate';

export const metadata: Metadata = {
  title: 'Generador de Páginas por Componentes | Prompt Studio',
  description: 'Combina componentes, genera un prompt maestro y descarga un proyecto Next.js coherente.',
  alternates: { canonical: '/page-composer' },
  robots: { index: false, follow: true },
};

/** El generador requiere el plan Creator o superiores, comprobado en servidor. */
export const dynamic = 'force-dynamic';

/**
 * `/page-composer` es la entrada pública del generador: tras pasar la puerta
 * Premium, el Website Builder (basado en `PageSchema`) es la única
 * implementación. Se conserva la puerta aquí porque el editor vive en una
 * subruta y este es el único punto que la aplica.
 */
export default async function PageComposerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await auth();
  if (!userId) return <PageComposerPremiumGate reason="anonymous" locale={locale} />;

  const status = await getServerSubscriptionStatus();
  if (!hasComponentBuilderPlan(status)) {
    return <PageComposerPremiumGate reason="unpaid" locale={locale} />;
  }

  const templates = await loadSourcePageTemplates();
  return <VisualPageComposerClient canEdit templates={templates} />;
}
