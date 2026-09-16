import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  PROMPT_EDIT_ENABLED,
  PROMPT_EDIT_PATH,
} from '@/lib/prompt-edit';
import { NextResponse, type NextRequest } from 'next/server';
import { detectLocale } from '@/i18n/detect-locale';
import { locales } from '@/i18n/config';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']);

const LEGACY_LANDING_PAGE_REDIRECTS: Record<string, string> = {
  'samsung-clone': '/landing-pages',
  'cozyloft-home-decor': '/landing-pages',
  'voltgear-tech-shop': '/landing-pages/3d-tech-showroom-pro',
  'motionlab-freelance-video':
    '/landing-pages/3d-photography-portfolio-video-projections',
  'magzin-job-html-css': '/landing-pages/magzin-job-dark',
};

/**
 * Ficheros fuente del catálogo que NO deben servirse por HTTP.
 *
 * Viven bajo `public/` porque el código los consume con `import` en build y con
 * lectura de disco en servidor, pero eso los hace también descargables. Y
 * contienen el producto: los 15 JSON de `public/prompts/` y
 * `webpages/web-pages.json` llevan dentro los prompts de pago (299 imágenes,
 * 197 vídeos, 236 landing pages, 450 componentes; ~255 de ellos Premium).
 *
 * Antes solo se bloqueaban los 8 `web-*-components.json`, lo que dejaba fuera
 * imágenes, vídeos, landing pages, animaciones, kits y los catálogos por modelo.
 *
 * La regla cubre cualquier `.json` en la raíz de esos dos directorios, no una
 * lista de nombres: en `public/webpages/` había cuatro copias de trabajo
 * huérfanas (`web-pages-updated.json` con 381 registros de pago,
 * `web-pages-fail.json` con 218, y dos más) que ninguna lista blanca habría
 * cubierto. Los assets de las demos (`/webpages/{slug}/...`) no se ven
 * afectados porque `[^/]+` no cruza barras.
 *
 * Se incluyen las variantes `.br` y `.gz` que genera `precompress-static.mjs`:
 * sin ellas el bloqueo se saltaría pidiendo `placeholder-images.json.br`.
 *
 * El catálogo paginado de `public/catalog/` NO se bloquea: es el derivado
 * público y `build-paged-catalogs.mjs` ya le quita el campo `description`, que
 * es donde vive el prompt.
 */
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

/**
 * Rutas que NO llevan segmento de idioma: handlers de API, el proxy de Clerk,
 * los ficheros estáticos de `public/` y los metadatos de SEO.
 */
function skipsLocale(pathname: string): boolean {
  return (
    /**
     * Internos de Next. Sin esta exclusión, `/_next/image` se reescribía a
     * `/en/_next/image`, que no existe: **todas** las imágenes optimizadas
     * daban 404 y la tarjeta caía al icono de «imagen no disponible».
     *
     * El `matcher` de `config` ya declara `(?!_next|…)`, pero no basta: la
     * comprobación se hace aquí, en código, porque el lookahead del matcher no
     * lo estaba filtrando en la práctica. Verificado con
     * `curl -D - '/_next/image?url=…'`: la respuesta traía
     * `x-middleware-rewrite: /en/_next/image?url=…`.
     */
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

/**
 * Reescribe internamente `/ruta` → `/{locale}/ruta`.
 *
 * La URL que ve el visitante no cambia: sigue siendo `/prices`, sin prefijo de
 * idioma, así que no hay impacto en SEO ni en los enlaces existentes. Lo que
 * cambia es que Next resuelve una ruta con segmento `[locale]`, que sí puede
 * prerenderizarse y cachearse en el edge por idioma.
 */
function withLocaleRewrite(req: NextRequest): NextResponse {
  const { pathname, search } = req.nextUrl;
  if (skipsLocale(pathname)) return NextResponse.next();

  /**
   * El prefijo de idioma es interno: solo lo genera la reescritura. Si llega
   * desde fuera (un enlace copiado de las herramientas de desarrollo, un
   * rastreador que lo dedujo), se consolida en la URL canónica sin prefijo.
   * Sin esto la petición se re-prefijaría a `/en/en/...` y daría un 404 opaco,
   * y peor aún: dos URLs servirían el mismo contenido si algún día dejara de
   * dar 404, que es exactamente el duplicado que el SEO no debe tener.
   */
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
  /**
   * La URL pública (`/prices`) no lleva idioma, pero el contenido sí depende de
   * él. Una caché compartida que indexe por esa URL serviría la versión inglesa
   * a un visitante español, así que se desactiva para el HTML localizado.
   *
   * No se pierde el prerender: la página se sigue sirviendo desde la caché de
   * Next (`x-nextjs-cache: HIT`), sin coste de render por petición. Lo que se
   * renuncia es a distribuir ese HTML por el edge.
   *
   * Para recuperarlo haría falta el idioma en la URL, la opción descartada por
   * SEO.
   *
   * SIN VERIFICAR EN LOCAL: `next start` no refleja esta cabecera en la
   * respuesta (sí lo hace con las que fija el código de la app), así que su
   * efecto real solo puede confirmarse en un despliegue de Vercel. Compruébalo
   * en un preview pidiendo `/` dos veces con `Accept-Language: es` y luego
   * `en`: si la segunda devuelve contenido español, el CDN está cacheando por
   * la URL pública y esta línea no está surtiendo efecto.
   */
  response.headers.set('Vercel-CDN-Cache-Control', 'private, no-store');
  response.headers.set('x-locale', locale);
  return response;
}

/**
 * Redirección permanente que **conserva la query string**.
 *
 * Importa para el dinero: el referido de afiliado viaja en `?ref=` y
 * `readReferrer()` lo lee de `window.location.search`. En una primera visita no
 * hay nada en `localStorage`, así que una redirección que descarte la query
 * destruye la atribución de forma silenciosa e irrecuperable. Un enlace de
 * afiliado a cualquier URL heredada perdía la comisión.
 */
function permanentRedirect(req: NextRequest, destination: string): NextResponse {
  const url = new URL(destination, req.url);
  // No sobrescribir una query que el propio destino ya traiga.
  if (!url.search) url.search = req.nextUrl.search;
  return NextResponse.redirect(url, 308);
}

/** Ruta sin el prefijo de idioma, para comparar contra rutas canónicas. */
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
      return withEdgeHeaders(
        permanentRedirect(req, destination),
        req
      );
    }
  }

  // Se compara sin prefijo de idioma: así `/es/pricing` va a `/prices` en un
  // solo salto en lugar de pasar antes por `/pricing`.
  const canonicalPath = withoutLocalePrefix(pathname);
  if (canonicalPath === '/pricing' || canonicalPath.startsWith('/pricing/')) {
    return withEdgeHeaders(permanentRedirect(req, '/prices'), req);
  }

  const legacyNumericGallery = pathname.match(/^\/gallery\/(\d+)\/?$/);
  if (legacyNumericGallery) {
    return withEdgeHeaders(
      permanentRedirect(req, `/gallery/img-${legacyNumericGallery[1]}`),
      req
    );
  }

  if (
    pathname.startsWith('/gallery/') &&
    !/^\/gallery\/img-\d+$/.test(pathname)
  ) {
    return withEdgeHeaders(
      permanentRedirect(req, '/image-prompts'),
      req
    );
  }

  if (
    pathname.startsWith('/gallery-videos/') &&
    !/^\/gallery-videos\/v-\d+$/.test(pathname)
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

  return withEdgeHeaders(withLocaleRewrite(req), req);
};

// The preview can briefly start without project env vars while the environment
// is being hydrated. Do not initialize Clerk's edge runtime in that window.
export default process.env.CLERK_SECRET_KEY
  ? clerkMiddleware(clerkRequestHandler)
  : async (req: NextRequest) => withEdgeHeaders(withLocaleRewrite(req), req);

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
