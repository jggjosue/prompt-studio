const DEFAULT_PROD_DOMAIN = process.env.DOMAIN_PROD;
const DEFAULT_DEV_DOMAIN = process.env.DOMAIN_DEV;

function normalizeDomain(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function getSiteUrl(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const prodDomain = process.env.DOMAIN_PROD ?? DEFAULT_PROD_DOMAIN;
  const devDomain = process.env.DOMAIN_DEV ?? DEFAULT_DEV_DOMAIN;
  const selected = isProduction ? prodDomain : devDomain;
  return normalizeDomain(selected || '');
}
