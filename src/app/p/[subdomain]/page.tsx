import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/editor/page-renderer';
import { resolveTenantSite } from '@/lib/tenant-site-resolver';
import { defaultStructuredData, resolvePageSeo } from '@/lib/editor/page-seo';

/**
 * Ruta pública de un sitio de tenant (customer.prompstudio.com).
 *
 * El middleware reescribe el hostname aquí. Solo se sirve la versión publicada
 * e inmutable: un sitio inválido o no publicado responde 404, y nunca se
 * accede al borrador.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 60;

type TenantSiteProps = { params: Promise<{ subdomain: string }> };

export async function generateMetadata({ params }: TenantSiteProps): Promise<Metadata> {
  const { subdomain } = await params;
  const resolution = await resolveTenantSite(subdomain);
  if (resolution.status !== 'published') return { robots: { index: false, follow: false } };

  const hostname = `${resolution.subdomain}.prompstudio.com`;
  const rootPage = resolution.schema.pages.find(page => page.slug === '/') ?? resolution.schema.pages[0];
  if (!rootPage) return { robots: { index: false, follow: false } };

  const seo = resolvePageSeo(resolution.schema, rootPage, hostname);
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

export default async function TenantSitePage({ params }: TenantSiteProps) {
  const { subdomain } = await params;
  const resolution = await resolveTenantSite(subdomain);

  if (resolution.status !== 'published') {
    notFound();
  }

  const hostname = `${resolution.subdomain}.prompstudio.com`;
  const rootPage = resolution.schema.pages.find(page => page.slug === '/') ?? resolution.schema.pages[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
        {resolution.schema.site.name} · versión publicada v{resolution.version} · {hostname}
      </div>
      {rootPage ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(defaultStructuredData(resolution.schema, rootPage, hostname)) }}
        />
      ) : null}
      <PageRenderer schema={resolution.schema} />
    </div>
  );
}