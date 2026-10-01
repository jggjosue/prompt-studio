import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCanonical,
  pageSitemapEntries,
  resolvePageSeo,
  robotsTxt,
  serializeStructuredData,
  sitemapXml,
  validateSeoPatch,
} from '../../src/lib/editor/page-seo.ts';
import { createTemplateSchema } from '../../src/lib/editor/page-templates.ts';
import { setPageSeo, setPageSlug, setSiteSeo } from '../../src/lib/editor/page-schema-ops.ts';
import { createLandingSchema, type SiteSchema } from '../../src/lib/editor/page-schema.ts';

test('buildCanonical: dominio personalizado genera la URL correcta', () => {
  assert.equal(buildCanonical('example.com', '/'), 'https://example.com/');
  assert.equal(buildCanonical('example.com', '/precios'), 'https://example.com/precios');
  assert.equal(buildCanonical('sub.example.co', '/'), 'https://sub.example.co/');
});

test('resolvePageSeo: defaults del sitio + overrides de la página', () => {
  const schema: SiteSchema = createTemplateSchema('saas');
  const page = schema.pages[0];
  page.seo.title = 'Título propio';
  page.seo.description = 'Descripción propia';

  const seo = resolvePageSeo(schema, page, 'acme.prompstudio.com');
  assert.equal(seo.title, 'Título propio');
  assert.equal(seo.description, 'Descripción propia');
  assert.equal(seo.canonical, 'https://acme.prompstudio.com/');
  assert.equal(seo.noIndex, false);

  // Sin overrides, usa los defaults del sitio.
  const bare = resolvePageSeo(schema, { ...page, seo: { title: '', description: '' } }, 'acme.prompstudio.com');
  assert.equal(bare.title, schema.site.seo?.title);
});

test('resolvePageSeo: canonical explícita gana a la derivada', () => {
  const schema = createTemplateSchema('agency');
  const page = schema.pages[0];
  page.seo.canonical = 'https://canonico.ejemplo.com/';
  const seo = resolvePageSeo(schema, page, 'ejemplo.com');
  assert.equal(seo.canonical, 'https://canonico.ejemplo.com/');
});

test('resolvePageSeo: noIndex y og de la página', () => {
  const schema = createTemplateSchema('portfolio');
  const page = schema.pages[0];
  page.seo.noIndex = true;
  page.seo.ogTitle = 'OG propio';
  const seo = resolvePageSeo(schema, page, 'miportafolio.com');
  assert.equal(seo.noIndex, true);
  assert.equal(seo.ogTitle, 'OG propio');
});

test('validateSeoPatch: longitudes y URLs', () => {
  assert.deepEqual(validateSeoPatch({ title: 'Hola' }), []);
  assert.ok(validateSeoPatch({ title: 'x'.repeat(80) }).length > 0);
  assert.ok(validateSeoPatch({ description: 'y'.repeat(200) }).length > 0);
  assert.ok(validateSeoPatch({ canonical: 'javascript:alert(1)' }).length > 0);
  assert.deepEqual(validateSeoPatch({ canonical: '/ruta-interna' }), []);
  assert.deepEqual(validateSeoPatch({ ogImage: '/images/hero.webp' }), []);
});

test('setPageSeo: actualiza el SEO de la página', () => {
  const schema = createTemplateSchema('restaurant');
  const result = setPageSeo(schema, '/', { title: 'Café de la esquina', noIndex: true });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const page = result.schema.pages.find(p => p.slug === '/');
  assert.equal(page?.seo.title, 'Café de la esquina');
  assert.equal(page?.seo.noIndex, true);
});

test('setSiteSeo: define defaults que las páginas pueden heredar', () => {
  const schema = createTemplateSchema('restaurant');
  const result = setSiteSeo(schema, { title: 'Restaurante en México', description: 'Cocina local.' });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.schema.site.seo.title, 'Restaurante en México');
  assert.equal(result.schema.site.seo.description, 'Cocina local.');
});

test('setPageSeo y setSiteSeo: rechazan URLs SEO inseguras', () => {
  const schema = createTemplateSchema('restaurant');
  const pageResult = setPageSeo(schema, '/', { canonical: 'javascript:alert(1)' });
  assert.equal(pageResult.ok, false);
  const siteResult = setSiteSeo(schema, { ogImage: 'javascript:alert(1)' });
  assert.equal(siteResult.ok, false);
});

test('setPageSlug: valida duplicados y patrón', () => {
  const schema = createLandingSchema();
  // Intentar usar un slug existente falla.
  const dup = setPageSlug(schema, '/', '/precios');
  assert.equal(dup.ok, false);
  if (!dup.ok) assert.match(dup.message, /Ya existe/);

  // Patrón inválido falla.
  const bad = setPageSlug(schema, '/', 'sin-barra');
  assert.equal(bad.ok, false);

  // Slug nuevo y válido se aplica.
  const ok = setPageSlug(schema, '/', '/nueva-ruta');
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  assert.equal(ok.schema.pages.find(p => p.id === 'page-home')?.slug, '/nueva-ruta');
});

test('pageSitemapEntries + sitemapXml: omite noIndex y usa el hostname', () => {
  const schema: SiteSchema = createTemplateSchema('ecommerce');
  const page = schema.pages[0];
  page.seo.noIndex = true;
  const entries = pageSitemapEntries(schema, 'tienda.com');
  assert.equal(entries.length, 0);

  page.seo.noIndex = false;
  const withIndex = pageSitemapEntries(schema, 'tienda.com');
  assert.equal(withIndex.length, 1);
  assert.equal(withIndex[0].loc, 'https://tienda.com/');
  assert.match(sitemapXml('tienda.com', withIndex), /https:\/\/tienda\.com\//);
});

test('robotsTxt: permite y apunta al sitemap', () => {
  const robots = robotsTxt('ejemplo.com');
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Sitemap: https:\/\/ejemplo\.com\/sitemap\.xml/);
});

test('serializeStructuredData: no permite cerrar el script JSON-LD', () => {
  const serialized = serializeStructuredData({ name: '</script><img src=x onerror=alert(1)>' });
  assert.ok(!serialized.includes('</script>'));
  assert.match(serialized, /\\u003c\/script\\u003e/);
});
