import assert from 'node:assert/strict';
import test from 'node:test';
import {
  SECTION_DEFINITIONS,
  createSection,
  isSectionId,
  listPageSections,
  sectionIdFactory,
} from '../../src/lib/editor/page-sections.ts';
import { validatePageSchema, type PageNode, type SiteSchema } from '../../src/lib/editor/page-schema.ts';
import { createTemplateSchema } from '../../src/lib/editor/page-templates.ts';

function collectIdsOf(nodes: readonly PageNode[]): string[] {
  const out: string[] = [];
  const walk = (list: readonly PageNode[]) => {
    for (const node of list) {
      out.push(node.id);
      walk(node.children);
    }
  };
  walk(nodes);
  return out;
}

const idsUnique = (ids: string[]) => new Set(ids).size === ids.length;

test('la biblioteca expone las 9 secciones pedidas', () => {
  const ids = listPageSections().map(section => section.id);
  assert.deepEqual(ids, ['hero', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'contact', 'footer', 'gallery']);
  assert.equal(Object.keys(SECTION_DEFINITIONS).length, 9);
});

test('cada sección se construye con el tipo correcto, ids únicos y sin compartir', () => {
  for (const definition of listPageSections()) {
    const makeId = sectionIdFactory('test');
    const section = createSection(definition.id, makeId);
    assert.equal(section.type, definition.type, `${definition.id} debe usar ${definition.type}`);
    const ids = collectIdsOf([section]);
    assert.ok(idsUnique(ids), `${definition.id}: ids duplicados`);
    assert.ok(ids.every(id => id.startsWith('test-')), `${definition.id}: ids prefijados`);
  }
});

test('dos instancias de la misma sección no comparten ids', () => {
  const a = createSection('features', sectionIdFactory());
  const b = createSection('features', sectionIdFactory());
  assert.ok(idsUnique([...collectIdsOf([a]), ...collectIdsOf([b])]));
});

test('los textos se pueden sobrescribir por sección', () => {
  const hero = createSection('hero', sectionIdFactory(), { title: 'Título propio', cta: 'Reservar' });
  assert.equal(hero.props.title, 'Título propio');
  assert.equal(hero.props.primaryLabel, 'Reservar');
});

test('una sección insertada dentro de una plantilla sigue siendo válida', () => {
  const schema = createTemplateSchema('saas');
  const result = validatePageSchema(schema);
  assert.equal(result.ok, true);
});

test('isSectionId distingue ids conocidos', () => {
  assert.equal(isSectionId('hero'), true);
  assert.equal(isSectionId('inexistente'), false);
});

test('las secciones de una plantilla conservan su contrato dentro de un SiteSchema', () => {
  const schema: SiteSchema = createTemplateSchema('agency');
  const sections = schema.pages[0].sections;
  assert.ok(sections.length >= 3);
  assert.equal(sections[0].type, 'navbar');
  assert.equal(sections[sections.length - 1].type, 'footer');
});