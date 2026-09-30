import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { PageRenderer } from '@/components/editor/page-renderer';
import { getSitePublishedVersion } from '@/lib/publish-site';

export const metadata: Metadata = {
  title: 'Sitio publicado | Prompt Studio',
  description: 'Versión publicada e inmutable de un sitio creado con el Website Builder.',
  robots: { index: false, follow: true },
};

export const dynamic = 'force-dynamic';

/**
 * Ruta pública de un sitio publicado.
 *
 * Sirve **solo la versión inmutable** apuntada por el sitio: nunca el borrador.
 * Si el sitio no está publicado o la versión falta, responde 404; la web anterior
 * simplemente no cambia.
 */
export default async function PublishedSitePage({
  params,
}: {
  params: Promise<{ locale: string; siteId: string }>;
}) {
  const { locale, siteId } = await params;
  setRequestLocale(locale);

  const published = await getSitePublishedVersion(siteId);
  if (!published) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="border-b bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
          Versión publicada v{published.version} · {new Date(published.publishedAt).toLocaleString(locale)}
        </div>
        <PageRenderer schema={published.schema} />
      </main>
      <Footer />
    </div>
  );
}