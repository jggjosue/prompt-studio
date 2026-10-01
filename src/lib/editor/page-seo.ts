/**
 * Resolución SEO de las páginas publicadas (puro).
 *
 * Combina los defaults de nivel de sitio con los overrides de la página y deriva
 * la canonical a partir del hostname real (dominio personalizado o subdominio de
 * tenant), de modo que la URL canónica siempre coincide con dónde se sirve el
 * sitio.
 */

import type { SitePage, SiteSchema } from './page-schema';

export type ResolvedSeo = {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  noIndex: boolean;
  structuredData?: Record<string, unknown>;
};

export type SeoPatch = {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: Record<string, unknown>;
};

/** `https://{hostname}{slug}` con slash limpio. */
export function buildCanonical(hostname: string, slug: string): string {
  const host = hostname.replace(/\/$/, '');
  const path = slug === '/' || slug === '' ? '/' : `/${slug.replace(/^\//, '')}`;
  return `https://${host}${path}`;
}

/** SEO efectivo de una página: defaults del sitio + overrides de la página. */
export function resolvePageSeo(schema: SiteSchema, page: SitePage, hostname: string): ResolvedSeo {
  const siteSeo = schema.site.seo ?? {};
  const pageSeo = page.seo ?? {};
  // Una canonical relativa ("/") se resuelve contra el hostname real; una
  // absoluta se respeta tal cual.
  const explicit = pageSeo.canonical;
  const canonical = explicit && explicit.startsWith('/')
    ? buildCanonical(hostname, explicit)
    : explicit || buildCanonical(hostname, page.slug);
  return {
    title: pageSeo.title || siteSeo.title || schema.site.name,
    description: pageSeo.description || siteSeo.description || '',
    canonical,
    ogTitle: pageSeo.ogTitle || pageSeo.title || siteSeo.ogTitle || siteSeo.title || pageSeo.title || schema.site.name,
    ogDescription: pageSeo.ogDescription || pageSeo.description || siteSeo.ogDescription || siteSeo.description || '',
    ogImage: pageSeo.ogImage || siteSeo.ogImage,
    noIndex: pageSeo.noIndex === true,
    structuredData: pageSeo.structuredData ?? siteSeo.structuredData,
  };
}

const TITLE_MAX = 70;
const DESCRIPTION_MAX = 165;

/** Valida un patch de SEO antes de guardarlo o aplicarlo. */
export function validateSeoPatch(patch: SeoPatch): string[] {
  const errors: string[] = [];
  if (patch.title !== undefined && patch.title.length > TITLE_MAX) {
    errors.push(`El título supera ${TITLE_MAX} caracteres.`);
  }
  if (patch.description !== undefined && patch.description.length > DESCRIPTION_MAX) {
    errors.push(`La descripción supera ${DESCRIPTION_MAX} caracteres.`);
  }
  if (patch.canonical !== undefined && patch.canonical && !/^https?:\/\//i.test(patch.canonical) && !patch.canonical.startsWith('/')) {
    errors.push('La canonical debe ser una URL http(s) o una ruta interna.');
  }
  if (patch.ogImage !== undefined && patch.ogImage && !/^https?:\/\//i.test(patch.ogImage) && !patch.ogImage.startsWith('/images/')) {
    errors.push('La imagen OG debe ser una URL http(s) o una imagen interna.');
  }
  return errors;
}

/** Entradas de sitemap de un sitio publicado (todas las páginas). */
export function pageSitemapEntries(schema: SiteSchema, hostname: string): Array<{ loc: string; slug: string }> {
  return schema.pages.map(page => ({
    loc: page.seo?.noIndex ? '' : buildCanonical(hostname, page.slug),
    slug: page.slug,
  })).filter(entry => entry.loc !== '');
}

/** Serializa entradas a XML de sitemap. */
export function sitemapXml(hostname: string, entries: Array<{ loc: string; slug: string }>): string {
  const urls = entries
    .map(
      entry =>
        `  <url>\n    <loc>${entry.loc}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/** robots.txt de un sitio publicado. */
export function robotsTxt(hostname: string): string {
  return `User-agent: *\nAllow: /\nSitemap: https://${hostname}/sitemap.xml\n`;
}

/** JSON-LD básico por página (Organization/Site) cuando no hay structuredData. */
export function defaultStructuredData(schema: SiteSchema, page: SitePage, hostname: string): Record<string, unknown> {
  if (page.seo?.structuredData) return page.seo.structuredData;
  if (page.slug === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: schema.site.name,
      url: buildCanonical(hostname, page.slug),
    };
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.seo?.title || page.name,
    url: buildCanonical(hostname, page.slug),
  };
}

/**
 * JSON-LD seguro para un nodo script. JSON.stringify por sí solo permite que
 * una cadena de contenido cierre el script (`</script>`); escapamos los
 * caracteres HTML relevantes antes de pasarlo a dangerouslySetInnerHTML.
 */
export function serializeStructuredData(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
