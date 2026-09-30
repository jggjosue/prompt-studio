import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  PROMPT_EDIT_ENABLED,
  PROMPT_EDIT_PATH,
} from '@/lib/prompt-edit';
import { isAppOwnHost, normalizeHostname, tenantSubdomain } from '@/lib/tenant-sites';
import { NextResponse, type NextRequest } from 'next/server';
import { detectLocale } from '@/i18n/detect-locale';
import { locales } from '@/i18n/config';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

/** Cabeceras de seguridad para los sitios publicados de tenants. */
const TENANT_SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
} as const;

/**
 * Un host de tenant (`customer.prompstudio.com`) se reescribe siempre a su ruta
 * pública `/p/<subdominio>`, que sirve SOLO la versión publicada inmutable.
 * El rewrite ocurre antes de Clerk y de la locale: los sitios publicados son
 * públicos y ningún tenant puede alcanzar rutas del editor/borrador.
 */
function tenantSiteResponse(req: NextRequest, subdomain: string): NextResponse {
  const url = req.nextUrl.clone();
  url.search = '';
  const pathname = req.nextUrl.pathname;
  // Preservar sitemap.xml y robots.txt del sitio publicado.
  if (pathname === '/sitemap.xml') url.pathname = `/p/${subdomain}/sitemap.xml`;
  else if (pathname === '/robots.txt') url.pathname = `/p/${subdomain}/robots.txt`;
  else url.pathname = `/p/${subdomain}`;
  const response = NextResponse.rewrite(url);
  for (const [name, value] of Object.entries(TENANT_SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  response.headers.set('x-tenant-subdomain', subdomain);
  response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
  return response;
}

/** Un dominio personalizado (example.com) se reescribe a su ruta pública. */
function customDomainResponse(req: NextRequest, hostname: string): NextResponse {
  const url = req.nextUrl.clone();
  url.search = '';
  const pathname = req.nextUrl.pathname;
  if (pathname === '/sitemap.xml') url.pathname = `/d/${hostname}/sitemap.xml`;
  else if (pathname === '/robots.txt') url.pathname = `/d/${hostname}/robots.txt`;
  else url.pathname = `/d/${hostname}`;
  const response = NextResponse.rewrite(url);
  for (const [name, value] of Object.entries(TENANT_SECURITY_HEADERS)) {
    response.headers.set(name, value);
  }
  response.headers.set('x-custom-domain', hostname);
  response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
  return response;
}

const LEGACY_LANDING_PAGE_REDIRECTS: Record<string, string> = {
  'samsung-clone': '/landing-pages',
  'cozyloft-home-decor': '/landing-pages',
  'voltgear-tech-shop': '/landing-pages/3d-tech-showroom-pro',
  'motionlab-freelance-video':
    '/landing-pages/3d-photography-portfolio-video-projections',
  'magzin-job-html-css': '/landing-pages/magzin-job-dark',
};

const PROTECTED_CATALOG_SOURCE = /^\/(?:prompts|webpages)\/[^/]+\.json(?:\.(?:br|gz))?$/;

function isProtectedCatalogSource(pathname: string): boolean {
  return PROTECTED_CATALOG_SOURCE.test(pathname);
}

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

function skipsLocale(pathname: string): boolean {
  return (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/trpc/') ||
    pathname.startsWith('/__clerk') ||
    pathname.startsWith('/webpages/') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

function withLocaleRewrite(req: NextRequest): NextResponse {
  const { pathname, search } = req.nextUrl;
  if (skipsLocale(pathname)) return NextResponse.next();

  const prefixed = locales.find(
    l => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (prefixed) {
    const stripped = pathname.slice(prefixed.length + 1) || '/';
    return NextResponse.redirect(new URL(`${stripped}${search}`, req.url), 308);
  }

  const locale = detectLocale(req.headers);
  const url = new URL(`/${locale}${pathname === '/' ? '' : pathname}${search}`, req.url);
  const response = NextResponse.rewrite(url);
  response.headers.set('Vercel-CDN-Cache-Control', 'private, no-store');
  response.headers.set('x-locale', locale);
  return response;
}

function permanentRedirect(req: NextRequest, destination: string): NextResponse {
  const url = new URL(destination, req.url);
  if (!url.search) url.search = req.nextUrl.search;
  return NextResponse.redirect(url, 308);
}

function withoutLocalePrefix(pathname: string): string {
  const prefix = locales.find(l => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!prefix) return pathname;
  return pathname.slice(prefix.length + 1) || '/';
}

const clerkRequestHandler = async (auth: any, req: NextRequest) => {
  const pathname = req.nextUrl.pathname;

  if (isProtectedCatalogSource(pathname)) {
    return withEdgeHeaders(
      new NextResponse('Not found', {
        status: 404,
        headers: { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' },
      }),
      req
    );
  }

  if (pathname.startsWith('/landing-pages/')) {
    const slug = pathname.slice('/landing-pages/'.length).replace(/\/+$/, '');
    const destination = LEGACY_LANDING_PAGE_REDIRECTS[slug];
    if (destination) {
      return withEdgeHeaders(permanentRedirect(req, destination), req);
    }
  }

  const canonicalPath = withoutLocalePrefix(pathname);
  if (canonicalPath === '/pricing' || canonicalPath.startsWith('/pricing/')) {
    return withEdgeHeaders(permanentRedirect(req, '/prices'), req);
  }

  const legacyNumericGallery = canonicalPath.match(/^\/gallery\/(\d+)\/?$/);
  if (legacyNumericGallery) {
    return withEdgeHeaders(
      permanentRedirect(req, `/gallery/img-${legacyNumericGallery[1]}`),
      req
    );
  }

  if (
    canonicalPath.startsWith('/gallery/') &&
    !/^\/gallery\/img-\d+\/?$/.test(canonicalPath)
  ) {
    return withEdgeHeaders(
      permanentRedirect(req, '/image-prompts'),
      req
    );
  }

  if (
    canonicalPath.startsWith('/gallery-videos/') &&
    !/^\/gallery-videos\/v-\d+\/?$/.test(canonicalPath)
  ) {
    return withEdgeHeaders(
      permanentRedirect(req, '/video-prompts'),
      req
    );
  }

  if (
    pathname === '/webpages/instagram-clone' ||
    pathname === '/webpages/instagram-clone/'
  ) {
    return withEdgeHeaders(
      permanentRedirect(req, '/landing-pages'),
      req
    );
  }

  if (
    pathname.startsWith('/webpages/') &&
    (pathname.endsWith('.html') || !/\.[a-z0-9]+$/i.test(pathname))
  ) {
    const response = NextResponse.next();
    const slug = pathname.split('/')[2];
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

  return withEdgeHeaders(withLocaleRewrite(req), req);
};

/**
 * Fallback seguro: si Clerk falla, solo aplica locale rewrite.
 * Evita el 500 MIDDLEWARE_INVOCATION_FAILED en despliegues sin
 * variables de Clerk o con errores de inicialización.
 */
function fallbackHandler(req: NextRequest): NextResponse {
  return withEdgeHeaders(withLocaleRewrite(req), req);
}

import type { NextMiddleware, NextFetchEvent } from 'next/server';

/** Middleware con Clerk, envuelto en try/catch para resiliencia. */
const clerkMiddlewareWrapped = clerkMiddleware(clerkRequestHandler) as NextMiddleware;

// Si no hay CLERK_SECRET_KEY, saltar Clerk completamente.
// Si lo hay, usar Clerk con fallback seguro.
export default async function middleware(req: NextRequest) {
  // Multi-tenant: los sitios publicados se resuelven por hostname antes de
  // cualquier otra lógica (Clerk, locale, rutas del editor).
  const hostname = normalizeHostname(req.headers.get('host') ?? '');
  const tenant = tenantSubdomain(hostname);
  if (tenant) {
    return tenantSiteResponse(req, tenant);
  }
  // Dominios personalizados: cualquier host que no sea de la propia app se
  // resuelve como dominio conectado (si no existe/está inactivo → 404).
  if (!isAppOwnHost(hostname)) {
    return customDomainResponse(req, hostname);
  }
  if (!process.env.CLERK_SECRET_KEY) {
    return fallbackHandler(req);
  }
  try {
    return (await clerkMiddlewareWrapped(req, {} as NextFetchEvent)) ?? fallbackHandler(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[middleware] Clerk error, using fallback:', msg);
    return fallbackHandler(req);
  }
}

export const config = {
  matcher: [
    '/__clerk(.*)',
    '/pricing(.*)',
    '/landing-pages/:path*',
    '/gallery/:path*',
    '/gallery-videos/:path*',
    '/webpages/:path*',
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
