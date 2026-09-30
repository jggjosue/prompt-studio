import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/editor/page-renderer';
import { resolveCustomDomain } from '@/lib/custom-domains';

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

  const { schema, hostname: canonicalHost } = resolution;
  return {
    title: schema.site.seo?.title || schema.site.name,
    description: schema.site.seo?.description || '',
    alternates: { canonical: `https://${canonicalHost}/` },
    robots: { index: true, follow: true },
  };
}

export default async function CustomDomainSitePage({ params }: CustomDomainProps) {
  const { hostname } = await params;
  const resolution = await resolveCustomDomain(hostname);
  if (!resolution) notFound();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/40 px-4 py-2 text-center text-xs text-muted-foreground">
        {resolution.schema.site.name} · {hostname} · versión publicada v{resolution.version}
      </div>
      <PageRenderer schema={resolution.schema} />
    </div>
  );
}