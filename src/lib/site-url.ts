const PRODUCTION_SITE_URL = 'https://www.prompstudio.com';

export function getSiteUrl(): string {
  const environmentUrl =
    process.env.NODE_ENV === 'production'
      ? process.env.DOMAIN_PROD
      : process.env.DOMAIN_DEV;
  const configuredUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ??
    environmentUrl
  )?.trim();

  if (!configuredUrl) return PRODUCTION_SITE_URL;

  try {
    const url = new URL(configuredUrl);

    // Vercel serves the production site from www and permanently redirects the
    // apex domain. Keep every SEO signal on the final, non-redirecting host.
    if (
      url.protocol === 'https:' &&
      (url.hostname === 'prompstudio.com' ||
        url.hostname === 'www.prompstudio.com')
    ) {
      return PRODUCTION_SITE_URL;
    }
    if (url.origin === 'null') {
      return PRODUCTION_SITE_URL;
    }

    return url.origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export const SITE_URL = getSiteUrl();
