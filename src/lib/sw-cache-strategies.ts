/**
 * Referencia de estrategias implementadas en `public/sw.js`.
 * El Service Worker aplica la lógica real; este archivo documenta el contrato.
 */

export const SW_CACHE_STRATEGIES = {
  cacheFirst: 'cache-first',
  staleWhileRevalidate: 'stale-while-revalidate',
  networkFirst: 'network-first',
} as const;

export type SwCacheStrategy =
  (typeof SW_CACHE_STRATEGIES)[keyof typeof SW_CACHE_STRATEGIES];

/** Rutas y patrones gestionados por el SW (ver `pickStrategy` en sw.js). */
/** Límites LRU por almacén del Service Worker (ver `LRU_MAX_ENTRIES` en public/sw.js). */
export const SW_LRU_MAX_ENTRIES = {
  runtime: 80,
  data: 48,
  pages: 24,
} as const;

export const SW_ROUTE_POLICIES = [
  {
    pattern: 'navigate (HTML)',
    strategy: SW_CACHE_STRATEGIES.networkFirst,
    note: 'Red primero; fallback a caché de página u offline.html',
  },
  {
    pattern: '/_next/static/*',
    strategy: SW_CACHE_STRATEGIES.cacheFirst,
    note: 'JS/CSS con hash — inmutables',
  },
  {
    pattern: '/api/webpages/assets/*',
    strategy: SW_CACHE_STRATEGIES.staleWhileRevalidate,
    note: 'Previews: SWR + expulsión LRU al superar 80 entradas en runtime',
  },
  {
    pattern: '/prompts/*.json, web-pages.json',
    strategy: SW_CACHE_STRATEGIES.staleWhileRevalidate,
    note: 'Catálogos locales',
  },
  {
    pattern: '/api/landing-pages/catalog, readability-index',
    strategy: SW_CACHE_STRATEGIES.staleWhileRevalidate,
    note: 'API catálogo / legibilidad — SWR + LRU en almacén data (48 entradas)',
  },
  {
    pattern: '/api/* (resto)',
    strategy: SW_CACHE_STRATEGIES.networkFirst,
    note: 'APIs dinámicas; sin bloquear Clerk/Stripe (omitidos)',
  },
] as const;
