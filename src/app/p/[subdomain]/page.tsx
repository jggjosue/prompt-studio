import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { PageRenderer } from '@/components/editor/page-renderer';
import { resolveTenantSite } from '@/lib/tenant-site-resolver';

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

  const { schema, subdomain: normalized } = resolution;
  return {
    title: schema.site.seo?.title || schema.site.name,
    description: schema.site.seo?.description || '',
    alternates: { canonical: `https://${normalized}.prompstudio.com/` },
    robots: { index: true, follow: true },
  };
}

export default async function TenantSitePage({ params }: TenantSiteProps) {
  const { subdomain } = await params;
  const resolution = await resolveTenantSite(subdomain);

  if (resolution.status !== 'published') {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="border-b bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
          {resolution.schema.site.name} · versión publicada v{resolution.version} · {resolution.subdomain}.prompstudio.com
        </div>
        <PageRenderer schema={resolution.schema} />
      </main>
      <Footer />
    </div>
  );
}