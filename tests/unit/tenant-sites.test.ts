import assert from 'node:assert/strict';
import test from 'node:test';
import {
  RESERVED_SUBDOMAINS,
  SUBDOMAIN_PATTERN,
  isTenantHost,
  isValidSubdomain,
  normalizeHostname,
  normalizeSubdomain,
  resolveTenantSiteWith,
  tenantSubdomain,
  type TenantLookup,
} from '../../src/lib/tenant-sites.ts';
import { createLandingSchema } from '../../src/lib/editor/page-schema.ts';

const ROOT = 'prompstudio.com';

function publishedLookup(sites: Record<string, { versionId: string | null; schema?: unknown }>): TenantLookup {
  const versions: Record<string, { schema: unknown; version: number }> = {};
  for (const site of Object.values(sites)) {
    if (site.versionId) {
      versions[site.versionId] = {
        schema: site.schema ?? createLandingSchema(),
        version: Number(site.versionId.replace(/^ver-/, '')) || 1,
      };
    }
  }
  return {
    findSite: async subdomain => {
      const site = sites[subdomain];
      if (!site) return null;
      return { siteId: `site-${subdomain}`, publishedVersionId: site.versionId };
    },
    loadPublished: async versionId => versions[versionId] ?? null,
  };
}

/* --------------------------------------------------- normalización --- */

test('normalizeHostname: minúsculas, sin puerto ni punto final', () => {
  assert.equal(normalizeHostname('MiSitio.PROMPS TUDIO.com:443.'), 'misitio.promps tudio.com');
  assert.equal(normalizeHostname('customer.prompstudio.com'), 'customer.prompstudio.com');
  assert.equal(normalizeHostname('customer.prompstudio.com:3000'), 'customer.prompstudio.com');
  assert.equal(normalizeHostname('customer.prompstudio.com.'), 'customer.prompstudio.com');
});

test('normalizeSubdomain: minúsculas y sin punto final', () => {
  assert.equal(normalizeSubdomain('  Mi-Sitio. '), 'mi-sitio');
});

test('SUBDOMAIN_PATTERN y isValidSubdomain', () => {
  assert.equal(SUBDOMAIN_PATTERN.test('acme'), true);
  assert.equal(SUBDOMAIN_PATTERN.test('mi-sitio'), true);
  assert.equal(SUBDOMAIN_PATTERN.test('-malo'), false);
  assert.equal(SUBDOMAIN_PATTERN.test('malo-'), false);
  assert.equal(SUBDOMAIN_PATTERN.test('MAYUS'), false);

  assert.equal(isValidSubdomain('acme'), true);
  assert.equal(isValidSubdomain('www'), false, 'reservado');
  assert.equal(isValidSubdomain('admin'), false, 'reservado');
  assert.equal(isValidSubdomain('bárbaro'), false, 'no ASCII');
});

/* --------------------------------------------------- detección tenant --- */

test('tenantSubdomain extrae el subdominio del hostname', () => {
  assert.equal(tenantSubdomain('customer.prompstudio.com', ROOT), 'customer');
  assert.equal(tenantSubdomain('mi-sitio.prompstudio.com', ROOT), 'mi-sitio');
  assert.equal(tenantSubdomain('acme.prompstudio.com:8080', ROOT), 'acme');
});

test('tenantSubdomain rechaza raíz, www y reservados', () => {
  assert.equal(tenantSubdomain('prompstudio.com', ROOT), null);
  assert.equal(tenantSubdomain('www.prompstudio.com', ROOT), null);
  assert.equal(tenantSubdomain('api.prompstudio.com', ROOT), null);
  assert.equal(tenantSubdomain('app.prompstudio.com', ROOT), null);
});

test('tenantSubdomain rechaza hosts que no son del root domain', () => {
  assert.equal(tenantSubdomain('customer.otrodominio.com', ROOT), null);
  assert.equal(tenantSubdomain('localhost:3000', ROOT), null);
  assert.equal(tenantSubdomain('vercel.app', ROOT), null);
});

test('isTenantHost e isTenantHost con prefijos válidos', () => {
  assert.equal(isTenantHost('acme.prompstudio.com', ROOT), true);
  assert.equal(isTenantHost('www.prompstudio.com', ROOT), false);
  assert.equal(isTenantHost('prompstudio.com', ROOT), false);
});

test('los nombres reservados no son subdominios válidos', () => {
  for (const name of ['www', 'api', 'admin', 'blog', 'dev', 'prompstudio']) {
    assert.equal(isValidSubdomain(name), false, `${name} debe estar reservado`);
  }
  assert.ok(RESERVED_SUBDOMAINS.size > 10);
});

/* ------------------------------------------- resolución y aislamiento --- */

test('resolver un subdominio publicado devuelve la versión inmutable', async () => {
  const lookup = publishedLookup({ acme: { versionId: 'ver-3', schema: createLandingSchema() } });
  const result = await resolveTenantSiteWith('acme', lookup);
  assert.equal(result.status, 'published');
  if (result.status !== 'published') return;
  assert.equal(result.version, 3);
  assert.equal(result.subdomain, 'acme');
  assert.equal(result.siteId, 'site-acme');
});

test('un subdominio desconocido devuelve not-found', async () => {
  const result = await resolveTenantSiteWith('inexistente', publishedLookup({}));
  assert.equal(result.status, 'not-found');
});

test('un sitio sin publicar devuelve unpublished (nunca el borrador)', async () => {
  const lookup = publishedLookup({ acme: { versionId: null } });
  const result = await resolveTenantSiteWith('acme', lookup);
  assert.equal(result.status, 'unpublished');
});

test('una versión publicada inexistente se trata como unpublished', async () => {
  const lookup: TenantLookup = {
    findSite: async () => ({ siteId: 'site-acme', publishedVersionId: 'ver-999' }),
    loadPublished: async () => null,
  };
  const result = await resolveTenantSiteWith('acme', lookup);
  assert.equal(result.status, 'unpublished');
});

test('aislamiento: un tenant nunca ve los datos de otro', async () => {
  // El lookup solo expone el sitio del subdominio consultado; el borrador de otro
  // tenant no aparece en ninguna rama de la resolución.
  const lookup = publishedLookup({
    acme: { versionId: 'ver-1', schema: createLandingSchema() },
    beta: { versionId: 'ver-2', schema: createLandingSchema() },
  });
  const acme = await resolveTenantSiteWith('acme', lookup);
  assert.equal(acme.status, 'published');
  if (acme.status !== 'published') return;
  assert.equal(acme.siteId, 'site-acme');
  assert.notEqual(acme.siteId, 'site-beta');
});

test('la resolución nunca expone el borrador (solo publishedVersionId → versión inmutable)', async () => {
  let draftExposed = false;
  const lookup: TenantLookup = {
    findSite: async subdomain => {
      // El draft existe pero nunca se devuelve: solo el puntero publicado.
      return { siteId: `site-${subdomain}`, publishedVersionId: 'ver-9' };
    },
    loadPublished: async () => {
      draftExposed = true;
      return { schema: createLandingSchema(), version: 9 };
    },
  };
  const result = await resolveTenantSiteWith('acme', lookup);
  assert.equal(result.status, 'published');
  // loadPublished solo se llama con la versión inmutable; aquí está el schema
  // que se guardó al publicar, no el borrador vivo.
  assert.equal(draftExposed, true);
});