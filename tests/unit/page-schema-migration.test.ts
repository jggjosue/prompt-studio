import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  createLandingSchema,
  migratePageSchema,
  validatePageSchema,
  PAGE_SCHEMA_VERSION,
} from '../../src/lib/editor/page-schema.ts';
import { createTemplateSchema, TEMPLATE_IDS } from '../../src/lib/editor/page-templates.ts';
import { listPageSections } from '../../src/lib/editor/page-sections.ts';

test('migratePageSchema acepta un v1 válido y lo devuelve', () => {
  const schema = createLandingSchema();
  const migrated = migratePageSchema(schema);
  assert.ok(migrated);
  assert.equal(migrated.schemaVersion, 1);
  assert.equal(migrated.pages.length, 2);
});

test('migratePageSchema acepta documentos sin versión tratándolos como v1', () => {
  const schema = createTemplateSchema('saas');
  const { schemaVersion: _version, ...sinVersion } = schema;
  const migrated = migratePageSchema(sinVersion as typeof schema);
  assert.ok(migrated);
  assert.equal(migrated.schemaVersion, 1);
});

test('migratePageSchema rechaza versiones futuras (v2+) sin adivinar', () => {
  const schema = createTemplateSchema('portfolio');
  const futuro = { ...schema, schemaVersion: 2 };
  assert.equal(migratePageSchema(futuro), null);
});

test('migratePageSchema rechaza datos que no son un documento', () => {
  assert.equal(migratePageSchema(null), null);
  assert.equal(migratePageSchema(42), null);
  assert.equal(migratePageSchema([]), null);
  assert.equal(migratePageSchema({ pages: 'no' }), null);
});

test('migratePageSchema es el paso de entrada de un borrador guardado', () => {
  const schema = createTemplateSchema('agency');
  const roundTrip = migratePageSchema(structuredClone(schema));
  assert.ok(roundTrip);
  assert.deepEqual(roundTrip.pages[0].sections.map(s => s.type), schema.pages[0].sections.map(s => s.type));
});

/* ------------------------------------------- paridad migrador vs validador --- */

test('paridad: con la versión actual, migrar da el mismo resultado que validar', () => {
  // `getPageComposerDraft` migrar en lugar de validar solo es seguro mientras
  // ambas coincidan. Este test es la alarma: cuando `PAGE_SCHEMA_VERSION` suba,
  // dejó de cumplirse y habrá que escribir el paso de migración v1 → v2 en vez de
  // dejar que el editor devuelva `null` a los borradores antiguos.
  assert.equal(PAGE_SCHEMA_VERSION, 1, 'al subir la versión, revisa este test');

  for (const id of TEMPLATE_IDS) {
    const schema = createTemplateSchema(id);
    const estricto = validatePageSchema(schema);
    assert.ok(estricto.ok, `${id}: la plantilla debe ser válida`);
    assert.deepEqual(migratePageSchema(structuredClone(schema)), estricto.schema, `${id}: divergen`);
  }

  for (const section of listPageSections()) {
    const schema = createLandingSchema();
    const estricto = validatePageSchema(schema);
    assert.ok(estricto.ok);
    assert.deepEqual(migratePageSchema(structuredClone(schema)), estricto.schema, `${section.id}: divergen`);
  }
});

test('paridad: un borrador sin versión lo aceptan ambos, y el migrador lo estampa', () => {
  // No son idénticos y no deben serlo: el validador tolera el `schemaVersion`
  // ausente pero lo devuelve sin rellenar, mientras que el migrador lo normaliza
  // a 1. Es justo lo que evita que un borrador sin versionar se vuelva a guardar
  // sin etiquetar. El resto del documento sí coincide.
  for (const id of TEMPLATE_IDS) {
    const { schemaVersion: _version, ...sinVersion } = createTemplateSchema(id);
    const estricto = validatePageSchema(sinVersion);
    const migrado = migratePageSchema(sinVersion);

    assert.ok(estricto.ok, `${id}: el validador debe tolerar la ausencia`);
    assert.ok(migrado, `${id}: el migrador debe recuperarlo`);
    assert.equal(migrado.schemaVersion, 1, `${id}: el migrador debe estampar la versión`);
    assert.equal(estricto.schema.schemaVersion, undefined, `${id}: el validador no rellena`);

    // `deepEqual` estricto distingue `{k: undefined}` de `{}`, así que hay que
    // quitar la clave, no ponerla a undefined.
    const { schemaVersion: _stamp, ...resto } = migrado;
    assert.deepEqual(resto, estricto.schema, `${id}: fuera de la versión, el documento debe coincidir`);
  }
});

test('la ruta de lectura del editor usa el migrador, no el validador estricto', async () => {
  // Guarda contra la regresión: si alguien cambia estas llamadas por
  // `validatePageSchema`, el editor deja de poder leer borradores antiguos en
  // cuanto suba la versión del schema, y cae a un lienzo en blanco sin aviso.
  // Se mira el import, no el texto: el comentario explica el porqué y menciona
  // ambos nombres a propósito.
  const source = await readFile(new URL('../../src/lib/page-composer-project.ts', import.meta.url), 'utf8');
  const importLine = source.match(/import \{[^}]*\} from '@\/lib\/editor\/page-schema'/)?.[0] ?? '';

  assert.match(importLine, /migratePageSchema/, 'la lectura del editor debe pasar por migratePageSchema');
  assert.doesNotMatch(importLine, /validatePageSchema/, 'no debe importar el validador estricto');
  assert.match(source, /migratePageSchema\(project\.document\)/);
});