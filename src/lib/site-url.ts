const FALLBACK_PRODUCTION_SITE_URL = 'https://www.prompstudio.com';
const FALLBACK_DEVELOPMENT_SITE_URL = 'http://localhost:3043';

function normalizeOrigin(value: string): string | null {
  const candidate = value.trim();
  if (!candidate) return null;

  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(candidate)
        ? candidate
        : `https://${candidate}`
    );

    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const configuredUrl = isProduction
    ? process.env.DOMAIN
    : process.env.DOMAIN_DEV;
  const fallback = isProduction
    ? FALLBACK_PRODUCTION_SITE_URL
    : FALLBACK_DEVELOPMENT_SITE_URL;

  if (!configuredUrl?.trim()) return fallback;

  const origin = normalizeOrigin(configuredUrl);
  if (origin) return origin;

  if (process.env.NODE_ENV !== 'test') {
    const variableName = isProduction ? 'DOMAIN' : 'DOMAIN_DEV';
    console.warn(
      `[site-url] ${variableName} no contiene una URL válida; usando ${fallback}.`
    );
  }

  return fallback;
}

export const SITE_URL = getSiteUrl();
