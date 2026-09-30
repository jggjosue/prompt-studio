import { resolveCustomDomain } from '@/lib/custom-domains';
import { robotsTxt } from '@/lib/editor/page-seo';

export const dynamic = 'force-dynamic';

/** GET /d/[hostname]/robots.txt — robots de un dominio personalizado. */
export async function GET(_request: Request, { params }: { params: Promise<{ hostname: string }> }) {
  const { hostname } = await params;
  const resolution = await resolveCustomDomain(hostname);
  if (!resolution) return new Response('Not found', { status: 404 });

  return new Response(robotsTxt(hostname), {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
  });
}