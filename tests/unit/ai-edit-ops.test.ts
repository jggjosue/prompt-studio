import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyAIEditOps,
  describeAIEditOp,
  isAIEditOp,
  type AIEditOp,
} from '../../src/lib/editor/ai-edit-ops.ts';
import { parseAIEditOps, planAIEdit } from '../../src/lib/editor/ai-edit-planner.ts';
import { AIPlanError } from '../../src/lib/editor/ai-site-planner.ts';
import { createLandingSchema, validatePageSchema, type SiteSchema } from '../../src/lib/editor/page-schema.ts';
import type { OpsDeps } from '../../src/lib/editor/page-schema-ops.ts';

const HOME = '/';

function deps(): OpsDeps {
  let counter = 0;
  return { makeId: type => `${type}-ai${(counter += 1)}`, defaults: () => ({ defaultProps: {}, defaultStyles: {} }) };
}

function landing(): SiteSchema {
  return structuredClone(createLandingSchema());
}

test('applyAIEditOps: updateProps valida contra el contrato', () => {
  const schema = landing();
  const outcome = applyAIEditOps(schema, HOME, [{ op: 'updateProps', nodeId: 'heading-home-features', props: { text: 'Nuevo título', level: 'h3' } }], deps());
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  const heading = outcome.schema.pages[0].sections
    .flatMap(section => [section, ...section.children])
    .find(node => node.id === 'heading-home-features');
  assert.equal(heading?.props.text, 'Nuevo título');
});

test('applyAIEditOps: rechaza props desconocidas o valores inválidos', () => {
  const schema = landing();
  const outcome = applyAIEditOps(schema, HOME, [
    { op: 'updateProps', nodeId: 'heading-home-features', props: { inventada: 1, level: 'h9', text: 'ok' } },
  ], deps());
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  const heading = outcome.schema.pages[0].sections
    .flatMap(section => [section, ...section.children])
    .find(node => node.id === 'heading-home-features');
  assert.equal(heading?.props.text, 'ok');
  assert.equal('inventada' in (heading?.props ?? {}), false, 'clave fuera del contrato');
  assert.notEqual(heading?.props.level, 'h9', 'el valor fuera de opciones no se aplica');
});

test('applyAIEditOps: updateStyles filtra valores peligrosos', () => {
  const schema = landing();
  const outcome = applyAIEditOps(schema, HOME, [
    { op: 'updateStyles', nodeId: 'hero-home', styles: { desktop: { paddingBlock: 40, background: 'red;}' } } },
  ], deps());
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  const hero = outcome.schema.pages[0].sections.find(section => section.id === 'hero-home');
  assert.equal(hero?.styles.desktop?.paddingBlock, 40);
  assert.notEqual(hero?.styles.desktop?.background, 'red;}', 'el valor inseguro no se aplica');
});

test('applyAIEditOps: addChild respeta el anidamiento permitido', () => {
  const schema = landing();
  const good = applyAIEditOps(schema, HOME, [
    { op: 'addChild', parentId: 'container-main', node: { id: 'nuevo', type: 'heading', props: { text: 'Sección nueva' }, styles: {}, children: [] } },
  ], deps());
  assert.equal(good.ok, true);
  if (!good.ok) return;

  // footer no puede anidarse en container: se rechaza.
  const bad = applyAIEditOps(schema, HOME, [
    { op: 'addChild', parentId: 'container-main', node: { id: 'nuevo', type: 'footer', props: {}, styles: {}, children: [] } },
  ], deps());
  assert.equal(bad.ok, false);
});

test('applyAIEditOps: removeChild elimina y reorderChildren exige permutación', () => {
  const schema = landing();
  const removed = applyAIEditOps(schema, HOME, [{ op: 'removeChild', nodeId: 'gallery-home' }], deps());
  assert.equal(removed.ok, true);
  if (!removed.ok) return;
  assert.equal(removed.schema.pages[0].sections.some(section => section.id === 'gallery-home'), false);

  // Reordenar requiere una permutación exacta.
  const container = schema.pages[0].sections.find(section => section.id === 'container-main');
  const childIds = (container?.children ?? []).map(child => child.id);
  const reversed = [...childIds].reverse();
  const reordered = applyAIEditOps(schema, HOME, [{ op: 'reorderChildren', parentId: 'container-main', order: reversed }], deps());
  assert.equal(reordered.ok, true);
  if (!reordered.ok) return;
  const after = reordered.schema.pages[0].sections.find(section => section.id === 'container-main');
  assert.deepEqual(after?.children.map(child => child.id), reversed);

  const bad = applyAIEditOps(schema, HOME, [{ op: 'reorderChildren', parentId: 'container-main', order: ['a', 'b'] }], deps());
  assert.equal(bad.ok, false);
});

test('applyAIEditOps: replaceSection solo para secciones de primer nivel', () => {
  const schema = landing();
  const ok = applyAIEditOps(schema, HOME, [
    { op: 'replaceSection', nodeId: 'cta-home', node: { id: 'nuevo-cta', type: 'cta', props: { title: 'Nuevo CTA', buttonLabel: 'Ir', buttonHref: '#', align: 'center' }, styles: {}, children: [] } },
  ], deps());
  assert.equal(ok.ok, true);
  if (!ok.ok) return;
  const sections = ok.schema.pages[0].sections;
  assert.equal(sections.some(section => section.id === 'cta-home'), false);
  assert.equal(sections.some(section => section.type === 'cta'), true);

  // Reemplazar un nodo anidado se rechaza.
  const nested = applyAIEditOps(schema, HOME, [
    { op: 'replaceSection', nodeId: 'heading-home-features', node: { id: 'x', type: 'heading', props: {}, styles: {}, children: [] } },
  ], deps());
  assert.equal(nested.ok, false);
});

test('applyAIEditOps: nodos desconocidos se rechazan sin romper el documento', () => {
  const schema = landing();
  const outcome = applyAIEditOps(schema, HOME, [
    { op: 'updateProps', nodeId: 'no-existe', props: { text: 'x' } },
    { op: 'removeChild', nodeId: 'tampoco' },
  ], deps());
  assert.equal(outcome.ok, false);
  assert.ok(outcome.rejected.length >= 2);
});

test('describeAIEditOp: describe en lenguaje humano', () => {
  assert.equal(describeAIEditOp({ op: 'updateProps', nodeId: 'hero', props: { title: 'x' } }), 'Actualizar props de hero (title)');
  assert.equal(describeAIEditOp({ op: 'replaceSection', nodeId: 'a', node: { id: 'b', type: 'cta', props: {}, styles: {}, children: [] } }), 'Reemplazar a por cta');
});

test('parseAIEditOps: acepta JSON con vallas y descarta operaciones desconocidas', () => {
  const ops = parseAIEditOps('```json\n[{"op":"updateProps","nodeId":"hero","props":{"title":"X"}},{"op":"ejecutar","code":"alert(1)"}]\n```');
  assert.equal(ops.length, 1);
  assert.equal(ops[0].op, 'updateProps');
});

test('parseAIEditOps: JSON no válido produce INVALID_JSON', () => {
  assert.throws(() => parseAIEditOps('no es json'), (error: unknown) => error instanceof AIPlanError && error.code === 'INVALID_JSON');
  assert.throws(() => parseAIEditOps('{"op":"updateProps"}'), (error: unknown) => error instanceof AIPlanError && error.code === 'INVALID_JSON');
});

test('planAIEdit: instrucción → operaciones con modelo simulado', async () => {
  const result = await planAIEdit('Haz este hero más profesional', { node: { type: 'hero' } }, 'hero', {
    model: 'gemini-2.5-flash',
    callModel: async () => JSON.stringify([{ op: 'updateProps', nodeId: 'hero', props: { title: 'Profesional' } }]),
  });
  assert.equal(result.model, 'gemini-2.5-flash');
  assert.equal((result.ops[0] as AIEditOp).op, 'updateProps');
});

test('planAIEdit: instrucción vacía o fallo de proveedor son errores tipados', async () => {
  await assert.rejects(planAIEdit('  ', { node: {} }, 'x', { callModel: async () => '[]' }),
    (error: unknown) => error instanceof AIPlanError && error.code === 'EMPTY_PROMPT');
  await assert.rejects(planAIEdit('cambia', { node: {} }, 'x', {
    callModel: async () => { throw new Error('red'); },
  }), (error: unknown) => error instanceof AIPlanError && error.code === 'PROVIDER_ERROR');
});

test('isAIEditOp: discrimina operaciones estructuradas', () => {
  assert.equal(isAIEditOp({ op: 'updateProps', nodeId: 'a', props: {} }), true);
  assert.equal(isAIEditOp({ op: 'delete', nodeId: 'a' }), false);
  assert.equal(isAIEditOp('texto'), false);
});

test('toda edición aplicada conserva un documento válido', () => {
  const schema = landing();
  const outcome = applyAIEditOps(schema, HOME, [
    { op: 'updateProps', nodeId: 'hero-home', props: { title: 'Nuevo hero' } },
    { op: 'addChild', parentId: 'container-main', node: { id: 'n', type: 'text', props: { text: 'Cuerpo' }, styles: {}, children: [] } },
    { op: 'replaceSection', nodeId: 'faq-home', node: { id: 'r', type: 'cta', props: { title: 'CT', buttonLabel: 'Ir', buttonHref: '#', align: 'center' }, styles: {}, children: [] } },
  ], deps());
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.equal(validatePageSchema(outcome.schema).ok, true);
});