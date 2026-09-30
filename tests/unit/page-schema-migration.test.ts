import assert from 'node:assert/strict';
import test from 'node:test';
import { createLandingSchema, migratePageSchema } from '../../src/lib/editor/page-schema.ts';
import { createTemplateSchema } from '../../src/lib/editor/page-templates.ts';

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