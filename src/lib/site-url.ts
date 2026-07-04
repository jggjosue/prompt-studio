export function getSiteUrl() {
  process.env.DOMAIN?.trim();
}

export const SITE_URL = getSiteUrl();
