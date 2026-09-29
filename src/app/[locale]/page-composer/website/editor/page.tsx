import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { WebsiteBuilder } from '@/components/editor/website-builder/website-builder';
import { createLandingSchema } from '@/lib/editor/page-schema';

export const metadata: Metadata = {
  title: 'Editor visual | Prompt Studio',
  description: 'Edita el sitio arrastrando componentes sobre un lienzo. PageSchema es la fuente de verdad.',
  alternates: { canonical: '/page-composer/website/editor' },
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

/**
 * Editor visual del Website Builder.
 *
 * Carga la semilla de `PageSchema` y la pasa al editor de cliente. `?slug=` abre
 * una página concreta del sitio. El autoguardado escribe en `localStorage`, nunca
 * en cada movimiento del puntero.
 */
export default async function WebsiteBuilderEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ slug?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { slug } = await searchParams;

  return <WebsiteBuilder initialSchema={createLandingSchema()} initialSlug={slug} persistKey="ps:website-builder" />;
}
