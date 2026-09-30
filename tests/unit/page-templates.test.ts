import assert from 'node:assert/strict';
import test from 'node:test';
import {
  TEMPLATE_CONFIGS,
  createTemplateSchema,
  getPageTemplate,
  isTemplateId,
  listPageTemplates,
} from '../../src/lib/editor/page-templates.ts';
import {
  validatePageSchema,
  type PageNode,
  type SiteSchema,
} from '../../src/lib/editor/page-schema.ts';

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

test('existen las 9 categorías pedidas', () => {
  const labels = listPageTemplates().map(template => template.category);
  assert.deepEqual(labels, ['SaaS', 'Agency', 'Restaurant', 'Portfolio', 'E-commerce', 'Real Estate', 'Education', 'Personal', 'Event']);
});

test('cada plantilla se construye como un PageSchema válido', () => {
  for (const template of listPageTemplates()) {
    const schema = createTemplateSchema(template.id);
    const result = validatePageSchema(schema);
    assert.equal(result.ok, true, `${template.id} debe ser válido: ${result.ok ? '' : result.issues[0]?.message}`);
  }
});

test('cada plantilla tiene ids únicos en todo el sitio', () => {
  for (const template of listPageTemplates()) {
    const schema = createTemplateSchema(template.id);
    const ids = schema.pages.flatMap(page => collectIdsOf(page.sections));
    assert.equal(new Set(ids).size, ids.length, `${template.id}: ids duplicados`);
  }
});

test('toda plantilla abre con navbar primero y un solo footer al final', () => {
  for (const template of listPageTemplates()) {
    const schema: SiteSchema = createTemplateSchema(template.id);
    const sections = schema.pages[0].sections;
    assert.equal(sections[0].type, 'navbar', `${template.id}: navbar primero`);
    assert.equal(sections[sections.length - 1].type, 'footer', `${template.id}: footer al final`);
    const footers = sections.filter(section => section.type === 'footer').length;
    assert.equal(footers, 1, `${template.id}: un solo footer`);
  }
});

test('cada plantilla declara su categoría y tema de acento', () => {
  for (const template of listPageTemplates()) {
    const config = TEMPLATE_CONFIGS[template.id];
    assert.ok(config.primary, `${template.id}: color de acento`);
    const schema = createTemplateSchema(template.id);
    assert.equal(schema.site.theme.tokens['color.primary'], config.primary);
  }
});

test('las plantillas son copias editables: dos usos no comparten ids', () => {
  const a = createTemplateSchema('restaurant');
  const b = createTemplateSchema('restaurant');
  const idsA = a.pages.flatMap(page => collectIdsOf(page.sections));
  const idsB = b.pages.flatMap(page => collectIdsOf(page.sections));
  assert.equal(idsA.length, idsB.length);
  assert.equal(idsA.some(id => idsB.includes(id)), false, 'no deben compartir ids');
});

test('getPageTemplate e isTemplateId', () => {
  assert.equal(getPageTemplate('saas')?.category, 'SaaS');
  assert.equal((getPageTemplate as (id: string) => ReturnType<typeof getPageTemplate>)('nope'), undefined);
  assert.equal(isTemplateId('portfolio'), true);
  assert.equal(isTemplateId('nope'), false);
});

test('las plantillas reutilizan los tipos del catálogo existente', () => {
  const schema = createTemplateSchema('ecommerce');
  const types = new Set(schema.pages[0].sections.map(section => section.type));
  for (const type of types) {
    assert.ok(
      ['navbar', 'hero', 'features', 'pricing', 'testimonials', 'faq', 'cta', 'contact-form', 'footer', 'gallery'].includes(type),
      `tipo inesperado en plantilla: ${type}`
    );
  }
});