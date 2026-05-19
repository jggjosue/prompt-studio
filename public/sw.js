/**
 * Service Worker — estrategias de caché:
 * - Cache-First: estáticos inmutables (_next/static, fuentes)
 * - Stale-While-Revalidate: JSON de catálogo, imágenes /api/webpages/assets
 * - Network-First: HTML (navegación) y APIs dinámicas
 */

const CACHE_VERSION = 'ps-cache-v4';

const CACHE = {
  static: `${CACHE_VERSION}-static`,
  runtime: `${CACHE_VERSION}-runtime`,
  data: `${CACHE_VERSION}-data`,
  pages: `${CACHE_VERSION}-pages`,
};

/** Máximo de entradas por almacén (LRU — expulsa lo menos solicitado). */
const LRU_MAX_ENTRIES = {
  [CACHE.static]: 120,
  [CACHE.runtime]: 80,
  [CACHE.data]: 48,
  [CACHE.pages]: 24,
};

/** url → timestamp del último acceso (para eviction LRU en el cliente). */
const lruAccess = new Map();

function touchLru(cacheName, requestUrl) {
  let bucket = lruAccess.get(cacheName);
  if (!bucket) {
    bucket = new Map();
    lruAccess.set(cacheName, bucket);
  }
  bucket.set(requestUrl, Date.now());
}

async function evictLruIfNeeded(cache, cacheName) {
  const max = LRU_MAX_ENTRIES[cacheName];
  if (!max) return;

  const keys = await cache.keys();
  if (keys.length <= max) return;

  const bucket = lruAccess.get(cacheName) || new Map();
  const scored = keys.map(req => ({
    req,
    at: bucket.get(req.url) ?? 0,
  }));
  scored.sort((a, b) => a.at - b.at);

  const toRemove = scored.length - max;
  for (let i = 0; i < toRemove; i++) {
    const url = scored[i].req.url;
    await cache.delete(scored[i].req);
    bucket.delete(url);
  }
}

async function lruCachePut(cache, cacheName, request, response) {
  if (!response?.ok) return;
  await cache.put(request, response.clone());
  touchLru(cacheName, request.url);
  await evictLruIfNeeded(cache, cacheName);
}

const PRECACHE_URLS = ['/offline.html'];

const NO_CACHE_HOSTS = [
  'clerk.com',
  'clerk.accounts.dev',
  'clerk.promptstudio.com',
  'googletagmanager.com',
  'google-analytics.com',
  'googlesyndication.com',
  'doubleclick.net',
  'stripe.com',
  'challenges.cloudflare.com',
];

function isSkippableRequest(request, url) {
  if (request.method !== 'GET') return true;
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return true;
  if (NO_CACHE_HOSTS.some(h => url.hostname.includes(h))) return true;
  return false;
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    touchLru(cacheName, request.url);
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    await lruCachePut(cache, cacheName, request, response);
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request)
    .then(response => {
      if (response.ok) {
        return lruCachePut(cache, cacheName, request, response).then(() => response);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    touchLru(cacheName, request.url);
    networkFetch.catch(() => {});
    return cached;
  }

  const fromNetwork = await networkFetch;
  if (fromNetwork) return fromNetwork;

  return new Response('Offline', { status: 503, statusText: 'Offline' });
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await lruCachePut(cache, cacheName, request, response);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      touchLru(cacheName, request.url);
      return cached;
    }
    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

function pickStrategy(request) {
  const url = new URL(request.url);

  // Clerk loads clerk.browser.js from /__clerk/* — never intercept (→ failed_to_load_clerk_js)
  if (url.pathname.startsWith('/__clerk/')) return null;
  if (
    url.pathname.startsWith('/sign-in') ||
    url.pathname.startsWith('/sign-up')
  ) {
    return null;
  }

  if (isSkippableRequest(request, url)) return null;
  if (!isSameOrigin(url)) return null;

  if (request.mode === 'navigate') {
    return { name: 'network-first', cache: CACHE.pages, fallback: '/offline.html' };
  }

  if (url.pathname.startsWith('/_next/static/')) {
    return { name: 'cache-first', cache: CACHE.static };
  }

  if (url.pathname.startsWith('/_next/image')) {
    return { name: 'stale-while-revalidate', cache: CACHE.runtime };
  }

  if (url.pathname.startsWith('/api/webpages/assets/')) {
    return { name: 'stale-while-revalidate', cache: CACHE.runtime };
  }

  if (
    url.pathname === '/api/landing-pages/catalog' ||
    url.pathname.startsWith('/api/landing-pages/readability-index')
  ) {
    return { name: 'stale-while-revalidate', cache: CACHE.data };
  }

  if (
    url.pathname.startsWith('/prompts/') &&
    url.pathname.endsWith('.json')
  ) {
    return { name: 'stale-while-revalidate', cache: CACHE.data };
  }

  if (
    url.pathname === '/webpages/web-pages.json' ||
    url.pathname.endsWith('/web-pages.json')
  ) {
    return { name: 'stale-while-revalidate', cache: CACHE.data };
  }

  if (/\.(js|css|woff2?|ico|svg|png|webp|avif)(\?|$)/i.test(url.pathname)) {
    return { name: 'cache-first', cache: CACHE.static };
  }

  if (url.pathname.startsWith('/api/')) {
    return { name: 'network-first', cache: CACHE.runtime };
  }

  return { name: 'stale-while-revalidate', cache: CACHE.runtime };
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE.static)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(key => !Object.values(CACHE).includes(key))
          .map(key => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', event => {
  const strategy = pickStrategy(event.request);
  if (!strategy) return;

  if (strategy.name === 'cache-first') {
    event.respondWith(cacheFirst(event.request, strategy.cache));
    return;
  }

  if (strategy.name === 'stale-while-revalidate') {
    event.respondWith(staleWhileRevalidate(event.request, strategy.cache));
    return;
  }

  if (strategy.name === 'network-first') {
    event.respondWith(
      networkFirst(event.request, strategy.cache, strategy.fallback)
    );
  }
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
