/**
 * Resolución multi-tenant de sitios publicados (parte pura / edge-safe).
 *
 * Todos los sitios viven en la misma app Next.js/Vercel (no hay un proyecto por
 * cliente). Un hostname `customer.prompstudio.com` se resuelve así:
 *
 *   hostname → subdominio → sitio publicado → publishedVersionId → PageSchema
 *
 * Estas funciones son puras (las usa el middleware edge). La resolución a base
 * de datos vive en `tenant-site-resolver.ts`; aquí nunca se toca el borrador.
 */

import { migratePageSchema, type SiteSchema } from './editor/page-schema';

/** Dominio raíz de los sitios de tenants. Ajustable por entorno. */
export const ROOT_DOMAIN = (process.env.PROMPT_STUDIO_ROOT_DOMAIN || 'prompstudio.com').toLowerCase();

/** Nombres reservados: no se pueden usar como subdominio de un cliente. */
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  'www',
  'app',
  'api',
  'admin',
  'blog',
  'mail',
  'dev',
  'staging',
  'test',
  'stage',
  'prompstudio',
  'docs',
  'help',
  'support',
  'status',
  'shop',
  'store',
  'cpanel',
  'ftp',
]);

/** Patrón de subdominio válido: `[a-z0-9]` con guiones internos, máx 63. */
export const SUBDOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Normaliza un hostname: minúsculas, sin puerto ni punto final. */
export function normalizeHostname(host: string): string {
  const cleaned = host.trim().toLowerCase().replace(/\.$/, '');
  return cleaned.replace(/:\d+$/, '');
}

/** Normaliza un subdominio para almacenarlo y compararlo. */
export function normalizeSubdomain(value: string): string {
  return value.trim().toLowerCase().replace(/\.$/, '');
}

/** `true` si el subdominio es válido por forma y no está reservado. */
export function isValidSubdomain(value: string): boolean {
  const normalized = normalizeSubdomain(value);
  if (!SUBDOMAIN_PATTERN.test(normalized)) return false;
  if (RESERVED_SUBDOMAINS.has(normalized)) return false;
  return true;
}

/**
 * Extrae el subdominio de un hostname de tenant, o `null`.
 * Rechaza el dominio raíz, `www` y los nombres reservados.
 */
export function tenantSubdomain(host: string, rootDomain = ROOT_DOMAIN): string | null {
  const hostname = normalizeHostname(host);
  if (hostname === rootDomain) return null;
  if (!hostname.endsWith(`.${rootDomain}`)) return null;
  const prefix = hostname.slice(0, hostname.length - rootDomain.length - 1);
  if (RESERVED_SUBDOMAINS.has(prefix)) return null;
  if (!SUBDOMAIN_PATTERN.test(prefix)) return null;
  return prefix;
}

/** `true` si el host pertenece a un sitio de tenant. */
export function isTenantHost(host: string, rootDomain = ROOT_DOMAIN): boolean {
  return tenantSubdomain(host, rootDomain) !== null;
}

/**
 * `true` si el host pertenece a la propia app (dev, preview de Vercel o el
 * dominio raíz), y por tanto NO debe tratarse como un dominio personalizado.
 */
export function isAppOwnHost(host: string): boolean {
  const hostname = normalizeHostname(host);
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]') return true;
  if (hostname === ROOT_DOMAIN || hostname === `www.${ROOT_DOMAIN}`) return true;
  if (hostname.endsWith('.vercel.app') || hostname.endsWith('.now.sh')) return true;
  return false;
}

export type TenantLookup = {
  findSite: (subdomain: string) => Promise<{ siteId: string; publishedVersionId: string | null } | null>;
  loadPublished: (versionId: string) => Promise<{ schema: unknown; version: number } | null>;
};

export type TenantResolution =
  | { status: 'published'; siteId: string; schema: SiteSchema; version: number; subdomain: string }
  | { status: 'not-found'; subdomain: string }
  | { status: 'unpublished'; subdomain: string };

/**
 * Resuelve un subdominio a su versión publicada **inmutable** (nunca el borrador).
 * `findSite`/`loadPublished` se inyectan para poder testear aislamiento en memoria.
 */
export async function resolveTenantSiteWith(subdomain: string, lookup: TenantLookup): Promise<TenantResolution> {
  const normalized = normalizeSubdomain(subdomain);
  const site = await lookup.findSite(normalized);
  if (!site) return { status: 'not-found', subdomain: normalized };
  if (!site.publishedVersionId) return { status: 'unpublished', subdomain: normalized };

  const published = await lookup.loadPublished(site.publishedVersionId);
  if (!published) return { status: 'unpublished', subdomain: normalized };

  const schema = migratePageSchema(published.schema);
  if (!schema) return { status: 'unpublished', subdomain: normalized };

  return { status: 'published', siteId: site.siteId, schema, version: published.version, subdomain: normalized };
}