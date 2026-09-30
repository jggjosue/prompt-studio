import { resolveCustomDomain } from '@/lib/custom-domains';
import { pageSitemapEntries, sitemapXml } from '@/lib/editor/page-seo';

export const dynamic = 'force-dynamic';

/** GET /d/[hostname]/sitemap.xml — sitemap de un dominio personalizado. */
export async function GET(_request: Request, { params }: { params: Promise<{ hostname: string }> }) {
  const { hostname } = await params;
  const resolution = await resolveCustomDomain(hostname);
  if (!resolution) return new Response('Not found', { status: 404 });

  const entries = pageSitemapEntries(resolution.schema, hostname);
  return new Response(sitemapXml(hostname, entries), {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}