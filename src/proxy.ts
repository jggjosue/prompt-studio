import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  PROMPT_EDIT_ENABLED,
  PROMPT_EDIT_PATH,
} from '@/lib/prompt-edit';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

const LEGACY_LANDING_PAGE_REDIRECTS: Record<string, string> = {
  'samsung-clone': '/landing-pages',
  'cozyloft-home-decor': '/landing-pages',
  'voltgear-tech-shop': '/landing-pages/3d-tech-showroom-pro',
  'motionlab-freelance-video':
    '/landing-pages/3d-photography-portfolio-video-projections',
  'magzin-job-html-css': '/landing-pages/magzin-job-dark',
};

function withEdgeHeaders(
  response: NextResponse,
  req?: { headers: Headers }
): NextResponse {
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  const country = req?.headers.get('x-vercel-ip-country');
  const region = req?.headers.get('x-vercel-ip-country-region');
  const city = req?.headers.get('x-vercel-ip-city');
  if (country) response.headers.set('x-edge-country', country);
  if (region) response.headers.set('x-edge-region', region);
  if (city) response.headers.set('x-edge-city', city);

  return response;
}

export default clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/landing-pages/')) {
    const slug = pathname.slice('/landing-pages/'.length).replace(/\/+$/, '');
    const destination = LEGACY_LANDING_PAGE_REDIRECTS[slug];

    if (destination) {
      return withEdgeHeaders(
        NextResponse.redirect(new URL(destination, req.url), 308),
        req
      );
    }
  }

  if (pathname === '/pricing' || pathname.startsWith('/pricing/')) {
    return withEdgeHeaders(
      NextResponse.redirect(new URL('/prices', req.url), 308),
      req
    );
  }

  const legacyNumericGallery = pathname.match(/^\/gallery\/(\d+)\/?$/);
  if (legacyNumericGallery) {
    return withEdgeHeaders(
      NextResponse.redirect(
        new URL(`/gallery/img-${legacyNumericGallery[1]}`, req.url),
        308
      ),
      req
    );
  }

  if (
    pathname.startsWith('/gallery/') &&
    !/^\/gallery\/img-\d+$/.test(pathname)
  ) {
    return withEdgeHeaders(
      NextResponse.redirect(new URL('/image-prompts', req.url), 308),
      req
    );
  }

  if (
    pathname.startsWith('/gallery-videos/') &&
    !/^\/gallery-videos\/v-\d+$/.test(pathname)
  ) {
    return withEdgeHeaders(
      NextResponse.redirect(new URL('/video-prompts', req.url), 308),
      req
    );
  }

  if (
    pathname === '/webpages/instagram-clone' ||
    pathname === '/webpages/instagram-clone/'
  ) {
    return withEdgeHeaders(
      NextResponse.redirect(new URL('/landing-pages', req.url), 308),
      req
    );
  }

  if (
    pathname.startsWith('/webpages/') &&
    (pathname.endsWith('.html') || !/\.[a-z0-9]+$/i.test(pathname))
  ) {
    const response = NextResponse.next();
    const slug = pathname.split('/')[2];
    // Raw demos remain usable, while Google consolidates their signals into
    // the richer server-rendered landing page instead of excluding them.
    if (slug && slug !== 'refactory-online') {
      response.headers.set(
        'Link',
        `<https://www.prompstudio.com/landing-pages/${encodeURIComponent(slug)}>; rel="canonical"`
      );
    }
    return withEdgeHeaders(response, req);
  }

  const disabledDashboardPaths = [
    '/dashboard',
    '/dashboard/',
    '/dashboard/analytics',
    '/dashboard/creations',
    '/dashboard/favorites',
    '/dashboard/settings',
    '/dashboard/billing',
  ];

  const shouldRedirect = disabledDashboardPaths.some(p => {
    if (p === '/dashboard' || p === '/dashboard/') {
      return pathname === '/dashboard' || pathname === '/dashboard/';
    }
    return pathname === p || pathname.startsWith(p + '/');
  });

  if (shouldRedirect) {
    return withEdgeHeaders(
      NextResponse.redirect(new URL('/dashboard/profile', req.url)),
      req
    );
  }

  if (!PROMPT_EDIT_ENABLED && pathname === PROMPT_EDIT_PATH) {
    return withEdgeHeaders(
      NextResponse.redirect(new URL('/', req.url)),
      req
    );
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  return withEdgeHeaders(NextResponse.next(), req);
});

export const config = {
  matcher: [
    // Clerk proxy (must run before static .js exclusion) — failed_to_load_clerk_js if missing
    '/__clerk(.*)',
    '/pricing(.*)',
    '/landing-pages/:path*',
    '/gallery/:path*',
    '/gallery-videos/:path*',
    '/webpages/:path*',
    // Skip Next.js internals and static files (see Clerk docs)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
