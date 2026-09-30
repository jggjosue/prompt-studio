import { resolveTenantSite } from '@/lib/tenant-site-resolver';
import { robotsTxt } from '@/lib/editor/page-seo';

export const dynamic = 'force-dynamic';

/** GET /p/[subdomain]/robots.txt — robots del sitio publicado. */
export async function GET(_request: Request, { params }: { params: Promise<{ subdomain: string }> }) {
  const { subdomain } = await params;
  const resolution = await resolveTenantSite(subdomain);
  if (resolution.status !== 'published') return new Response('Not found', { status: 404 });

  const hostname = `${resolution.subdomain}.prompstudio.com`;
  return new Response(robotsTxt(hostname), {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}