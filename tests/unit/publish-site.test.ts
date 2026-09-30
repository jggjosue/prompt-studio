import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PublishError,
  collectImageUrls,
  publishSiteCore,
  validateSiteAssets,
  type PublishDeps,
} from '../../src/lib/publish-site-core.ts';
import { createLandingSchema, type SiteSchema } from '../../src/lib/editor/page-schema.ts';

const PUBLISHER = 'user-1';

function validSchema(): SiteSchema {
  return createLandingSchema();
}

/** Estado en memoria que simula el sitio + versiones publicadas. */
function makeState(schema: unknown, options: { publishedVersion?: number | null; failPoint?: boolean } = {}) {
  const state = {
    schema,
    draftVersion: 7,
    publishedVersion: options.publishedVersion ?? null,
    pointer: options.publishedVersion ?? null,
    versions: [] as Array<{ version: number; id: string }>,
    deletes: [] as string[],
    invalidations: 0,
  };
  const deps: PublishDeps = {
    loadSite: async () => ({
      schema: state.schema,
      draftVersion: state.draftVersion,
      publishedVersion: state.publishedVersion,
    }),
    insertVersion: async ({ version }) => {
      const id = `version-${version}`;
      state.versions.push({ version, id });
      return id;
    },
    deleteVersion: async versionId => {
      state.deletes.push(versionId);
      state.versions = state.versions.filter(v => v.id !== versionId);
    },
    pointSite: async (_, pointer) => {
      if (options.failPoint) throw new Error('fallo al apuntar el sitio');
      state.pointer = pointer.publishedVersion;
      state.publishedVersion = pointer.publishedVersion;
    },
    invalidate: async () => {
      state.invalidations += 1;
    },
  };
  return { state, deps };
}

test('publicar un borrador válido crea la versión y apunta el sitio', async () => {
  const { state, deps } = makeState(validSchema());
  const result = await publishSiteCore('site-1', PUBLISHER, deps);

  assert.equal(result.publishedVersion, 1);
  assert.equal(state.versions.length, 1);
  assert.equal(state.pointer, 1);
  assert.equal(state.invalidations, 1);
});

test('un schema inválido no crea versión ni cambia el puntero', async () => {
  const { state, deps } = makeState({ schemaVersion: 99 }, { publishedVersion: 3 });
  await assert.rejects(publishSiteCore('site-1', PUBLISHER, deps), (error: unknown) =>
    error instanceof PublishError && error.code === 'INVALID_SCHEMA');

  assert.equal(state.versions.length, 0, 'no se crea versión');
  assert.equal(state.pointer, 3, 'la versión anterior sigue online');
  assert.equal(state.invalidations, 0);
});

test('assets inseguros bloquean la publicación sin tocar la versión anterior', async () => {
  const schema = createLandingSchema();
  const gallery = schema.pages[0].sections.find(section => section.type === 'gallery');
  // `mailto:` pasa la validación de URL del schema pero no es un asset de imagen.
  if (gallery && Array.isArray(gallery.props.images)) {
    (gallery.props.images as Array<{ src: string }>)[0].src = 'mailto:no-es-una-imagen';
  }

  const issues = validateSiteAssets(schema);
  assert.ok(issues.length > 0, 'el asset de imagen inválido debe detectarse');

  const { state, deps } = makeState(schema, { publishedVersion: 2 });
  await assert.rejects(publishSiteCore('site-1', PUBLISHER, deps), (error: unknown) =>
    error instanceof PublishError && error.code === 'INVALID_ASSETS');
  assert.equal(state.versions.length, 0);
  assert.equal(state.pointer, 2);
});

test('si el apuntado falla, la versión huérfana se borra y sigue la anterior', async () => {
  const { state, deps } = makeState(validSchema(), { publishedVersion: 1, failPoint: true });
  await assert.rejects(publishSiteCore('site-1', PUBLISHER, deps), (error: unknown) =>
    error instanceof PublishError && error.code === 'PUBLISH_FAILED');

  assert.equal(state.deletes.length, 1, 'se compensa borrando la versión huérfana');
  assert.equal(state.pointer, 1, 'la versión anterior sigue online');
});

test('si la inserción de la versión falla, el puntero no cambia', async () => {
  const state = {
    schema: validSchema(),
    draftVersion: 5,
    publishedVersion: 4,
    pointer: 4,
  };
  const deps: PublishDeps = {
    loadSite: async () => ({ schema: state.schema, draftVersion: state.draftVersion, publishedVersion: state.publishedVersion }),
    insertVersion: async () => { throw new Error('db caída'); },
    deleteVersion: async () => undefined,
    pointSite: async (_, pointer) => { state.pointer = pointer.publishedVersion; },
    invalidate: async () => undefined,
  };
  await assert.rejects(publishSiteCore('site-1', PUBLISHER, deps), (error: unknown) =>
    error instanceof PublishError && error.code === 'PUBLISH_FAILED');
  assert.equal(state.pointer, 4, 'la versión anterior sigue online');
});

test('republish incrementa el número de versión y conserva el histórico', async () => {
  const { state, deps } = makeState(validSchema());
  await publishSiteCore('site-1', PUBLISHER, deps);
  await publishSiteCore('site-1', PUBLISHER, deps);

  assert.equal(state.versions.length, 2, 'cada publicación crea una versión inmutable');
  assert.deepEqual(state.versions.map(v => v.version), [1, 2]);
  assert.equal(state.pointer, 2);
});

test('validateSiteAssets y collectImageUrls', () => {
  const schema = createLandingSchema();
  assert.equal(validateSiteAssets(schema).length, 0, 'la semilla usa assets válidos');

  const urls = collectImageUrls(schema);
  assert.ok(urls.some(url => url.startsWith('/images/')), 'recoge imágenes internas');

  assert.ok(validateSiteAssets(schema).length === 0);
});