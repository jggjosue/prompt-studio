import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
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

/** El editor y la exportación requieren comprobar el plan desde el servidor. */
export const dynamic = 'force-dynamic';

type PageSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

export default async function PageComposerPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await auth();
  const subscription = userId ? await getServerSubscriptionStatus() : null;
  const canEdit = Boolean(userId && subscription && hasComponentBuilderPlan(subscription));

  const sp = await searchParams;
  const seed: PageComposerSeed = {
    kit: first(sp.kit),
    projectName: first(sp.projectName),
    brand: first(sp.brand),
    description: first(sp.description),
    primary: first(sp.primary),
    secondary: first(sp.secondary),
    background: first(sp.background),
    header: first(sp.header),
    sidebar: first(sp.sidebar),
    card: first(sp.card),
    form: first(sp.form),
    button: first(sp.button),
  };

  // Los kits publicados todavía enlazan al compositor v1 con una receta en
  // query params. Sin esa semilla, /page-composer debe abrir el nuevo editor
  // PageSchema; el merge con main había vuelto a montar v1 para todo el mundo.
  const hasLegacySeed = Object.values(seed).some(Boolean);
  if (hasLegacySeed) return <PageComposerClient canEdit={canEdit} seed={seed} />;
  const templates = await loadSourcePageTemplates();
  return <VisualPageComposerClient canEdit={canEdit} templates={templates} />;
}
