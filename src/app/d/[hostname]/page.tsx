import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { PageRenderer } from '@/components/editor/page-renderer';
import { resolveCustomDomain } from '@/lib/custom-domains';
import { defaultStructuredData, resolvePageSeo, serializeStructuredData } from '@/lib/editor/page-seo';

/**
 * Ruta pública de un dominio personalizado conectado (example.com).
 *
 * El middleware reescribe el hostname aquí. Solo se sirve la versión publicada
 * de un dominio **activo**; un dominio inexistente, no activo o sin versión
 * publicada responde 404. Nunca se sirve el borrador.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 60;

type CustomDomainProps = { params: Promise<{ hostname: string }> };

export async function generateMetadata({ params }: CustomDomainProps): Promise<Metadata> {
  const { hostname } = await params;
  const resolution = await resolveCustomDomain(hostname);
  if (!resolution) return { robots: { index: false, follow: false } };

  const rootPage = resolution.schema.pages.find(page => page.slug === '/') ?? resolution.schema.pages[0];
  if (!rootPage) return { robots: { index: false, follow: false } };

  const seo = resolvePageSeo(resolution.schema, rootPage, resolution.canonicalHostname);
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.canonical },
    robots: seo.noIndex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title: seo.ogTitle,
      description: seo.ogDescription,
      url: seo.canonical,
      images: seo.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
  };
}

export default async function CustomDomainSitePage({ params }: CustomDomainProps) {
  const { hostname } = await params;
  const resolution = await resolveCustomDomain(hostname);
  if (!resolution) notFound();
  if (resolution.canonicalHostname !== hostname) redirect(`https://${resolution.canonicalHostname}`);

  const rootPage = resolution.schema.pages.find(page => page.slug === '/') ?? resolution.schema.pages[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
        {resolution.schema.site.name} · {hostname} · versión publicada v{resolution.version}
      </div>
      {rootPage ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeStructuredData(defaultStructuredData(resolution.schema, rootPage, hostname)) }}
        />
      ) : null}
      <PageRenderer schema={resolution.schema} />
    </div>
  );
}
