import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  PROMPT_EDIT_ENABLED,
  PROMPT_EDIT_PATH,
} from '@/lib/prompt-edit';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

function withEdgeHeaders(
  response: NextResponse,
  req?: { headers: Headers }
): NextResponse {
  response.headers.set('Vary', 'Accept-Encoding');
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
    // Skip Next.js internals and static files (see Clerk docs)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
