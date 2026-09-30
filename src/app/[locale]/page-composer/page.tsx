import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import {
  getServerSubscriptionStatus,
  hasComponentBuilderPlan,
} from '@/lib/server-subscription-status';
import type { PageComposerSeed } from '@/lib/page-composer';
import { loadSourcePageTemplates } from '@/lib/page-builder/source-template-catalog';
import PageComposerClient from './page-composer-client';
import VisualPageComposerClient from './page-composer-editor-client';

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

  // Los kits publicados todavía enlazan al compositor v1 con una receta en
  // query params. Sin esa semilla, /page-composer debe abrir el nuevo editor
  // PageSchema; el merge con main había vuelto a montar v1 para todo el mundo.
  const hasLegacySeed = Object.values(seed).some(Boolean);
  if (hasLegacySeed) return <PageComposerClient canEdit={canEdit} seed={seed} />;
  const templates = await loadSourcePageTemplates();
  return <VisualPageComposerClient canEdit={canEdit} templates={templates} />;
}
