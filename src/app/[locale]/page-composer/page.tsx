import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { getServerSubscriptionStatus, hasDownloadPlan } from '@/lib/server-subscription-status';
import PageComposerClient from './page-composer-editor-client';

export const metadata: Metadata = {
  title: 'Generador de Páginas por Componentes | Prompt Studio',
  description: 'Combina componentes, genera un prompt maestro y descarga un proyecto Next.js coherente.',
  alternates: { canonical: '/page-composer' },
  robots: { index: false, follow: true },
};

/** El editor y la exportación requieren comprobar el plan desde el servidor. */
export const dynamic = 'force-dynamic';

export default async function PageComposerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await auth();
  const subscription = userId ? await getServerSubscriptionStatus() : null;
  return <PageComposerClient canEdit={Boolean(userId && subscription && hasDownloadPlan(subscription))} />;
}
