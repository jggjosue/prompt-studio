/**
 * Cabeceras de caché para la red edge de Vercel (Anycast).
 * `CDN-Cache-Control` gobierna el POP más cercano; `Cache-Control` el navegador.
 *
 * @see https://vercel.com/docs/headers/cache-control-headers
 */

export type CdnCachePolicy =
  | 'immutable'
  | 'static'
  | 'staleWhileRevalidate'
  | 'catalog'
  | 'apiShort'
  | 'private';

const POLICIES: Record<
  CdnCachePolicy,
  { browser: string; cdn: string }
> = {
  /** Assets con hash o transcodificados (AVIF/WebP). */
  immutable: {
    browser: 'public, max-age=31536000, immutable',
    cdn: 'public, max-age=31536000, immutable',
  },
  /** JS/CSS/fuentes en /public. */
  static: {
    browser: 'public, max-age=31536000, immutable',
    cdn: 'public, max-age=31536000, immutable',
  },
  /**
   * Stale-While-Revalidate: el POP responde al instante desde caché
   * y revalida en segundo plano (menor TTFB percibido).
   */
  staleWhileRevalidate: {
    browser: 'public, max-age=60, stale-while-revalidate=600',
    cdn: 'public, s-maxage=300, stale-while-revalidate=3600',
  },
  /** JSON de catálogo (web-pages, placeholders). */
  catalog: {
    browser: 'public, max-age=120, stale-while-revalidate=3600',
    cdn: 'public, s-maxage=3600, stale-while-revalidate=86400',
  },
  /** APIs dinámicas con TTL corto en edge. */
  apiShort: {
    browser: 'public, max-age=30, stale-while-revalidate=120',
    cdn: 'public, s-maxage=60, stale-while-revalidate=300',
  },
  private: {
    browser: 'private, no-cache',
    cdn: 'private, no-cache',
  },
};

/**
 * Regiones Vercel para ejecutar funciones cerca del usuario.
 * Si cambias esta lista, actualiza también `preferredRegion` en las rutas API
 * (`api/webpages/assets`, `api/refactory-online`) — Next.js exige un literal estático allí.
 */
export const VERCEL_EDGE_REGIONS = [
  'iad1',
  'sfo1',
  'cdg1',
  'fra1',
  'sin1',
  'syd1',
  'gru1',
  'hnd1',
] as const;

export function cdnCacheHeaders(
  policy: CdnCachePolicy,
  extra?: Record<string, string>
): Record<string, string> {
  const { browser, cdn } = POLICIES[policy];
  return {
    'Cache-Control': browser,
    'CDN-Cache-Control': cdn,
    ...extra,
  };
}

export function mergeHeaders(
  base: HeadersInit | undefined,
  policy: CdnCachePolicy,
  extra?: Record<string, string>
): Headers {
  const headers = new Headers(base);
  for (const [key, value] of Object.entries(cdnCacheHeaders(policy, extra))) {
    headers.set(key, value);
  }
  return headers;
}
