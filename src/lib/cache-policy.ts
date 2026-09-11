export const PUBLIC_CATALOG_CACHE =
  'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';

export const PRIVATE_USER_CACHE =
  'private, max-age=30, stale-while-revalidate=60';

export const PRIVATE_NO_STORE =
  'private, no-store, max-age=0, must-revalidate';

type CachePolicy = 'public-catalog' | 'private-user' | 'private-no-store';

export function cacheHeaders(
  policy: CachePolicy,
  extra: HeadersInit = {}
): Headers {
  const headers = new Headers(extra);
  const cacheControl =
    policy === 'public-catalog'
      ? PUBLIC_CATALOG_CACHE
      : policy === 'private-user'
        ? PRIVATE_USER_CACHE
        : PRIVATE_NO_STORE;

  headers.set('Cache-Control', cacheControl);
  headers.set(
    'CDN-Cache-Control',
    policy === 'public-catalog'
      ? 'public, s-maxage=86400, stale-while-revalidate=604800'
      : 'private, no-store'
  );
  headers.set(
    'Vercel-CDN-Cache-Control',
    policy === 'public-catalog'
      ? 'public, s-maxage=86400, stale-while-revalidate=604800'
      : 'private, no-store'
  );
  headers.set('X-Cache-Policy', policy);
  return headers;
}
