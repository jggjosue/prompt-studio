const DEFAULT_SITE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://www.prompstudio.com'
    : 'http://localhost:3041';

export function getSiteUrl(): string {
  const configuredUrl = (
    process.env.DOMAIN ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL
  )?.trim();

  if (!configuredUrl) return DEFAULT_SITE_URL;

  try {
    return new URL(configuredUrl).origin;
  } catch {
    console.warn(
      `[site-url] DOMAIN no es una URL válida; usando ${DEFAULT_SITE_URL}.`
    );
    return DEFAULT_SITE_URL;
  }
}

export const SITE_URL = getSiteUrl();
