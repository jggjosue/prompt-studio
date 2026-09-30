import assert from 'node:assert/strict';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { allPageComponentDefinitions, getPageComponentDefinition } from '../../src/components/page-builder/registry.tsx';
import { PageRenderer } from '../../src/components/page-builder/page-renderer.tsx';
import { createDocument, createNode, incrementalIds, insertNode, type EditorDocument } from '../../src/lib/editor/document.ts';
import { editorDocumentToPageSchema } from '../../src/lib/page-builder/editor-adapter.ts';
import { createEmptyPageSchema, PAGE_COMPONENT_TYPES, type ComponentNodeOf, type ComponentPropsMap, type PageComponentNode, type PageComponentType, type PageSchema } from '../../src/lib/page-builder/schema.ts';
import { buildResponsiveCss } from '../../src/lib/page-builder/styles.ts';
import { validatePageSchema } from '../../src/lib/page-builder/validation.ts';

function component<K extends PageComponentType>(type: K, id: string, props: Partial<ComponentPropsMap[K]> = {}): ComponentNodeOf<K> {
  const definition = getPageComponentDefinition(type);
  return {
    id,
    type,
    props: { ...definition.defaultProps, ...props },
    styles: {},
    responsive: {},
    children: [],
  };
}

function completeSchema(): PageSchema {
  const schema = createEmptyPageSchema('Acme');
  const page = schema.pages[schema.site.defaultPageId];
  const sectionId = 'section-home';
  const navbar = component('navbar', 'navbar-main');
  const hero = component('hero', 'hero-main', { title: '<script>alert(1)</script>', primaryAction: { label: 'Comenzar', href: 'javascript:alert(1)', variant: 'primary' } });
  hero.responsive.mobile = { padding: '24px', fontSize: '18px' };
  const features = component('features', 'features-main');
  const contact = component('contactForm', 'contact-main');
  const footer = component('footer', 'footer-main');
  page.sectionIds = [sectionId];
  schema.sections[sectionId] = { id: sectionId, name: 'Inicio', componentIds: [navbar.id, hero.id, features.id, contact.id, footer.id], styles: {}, responsive: {} };
  for (const node of [navbar, hero, features, contact, footer]) schema.components[node.id] = node as PageComponentNode;
  return schema;
}

test('el registro incluye todos los componentes iniciales y su contrato editable', () => {
  const definitions = allPageComponentDefinitions();
  assert.deepEqual(definitions.map(definition => definition.type).sort(), [...PAGE_COMPONENT_TYPES].sort());
  for (const definition of definitions) {
    assert.equal(typeof definition.component, 'function', `${definition.type} necesita un componente React`);
    assert.ok(definition.defaultProps);
    assert.ok(definition.editableProperties.length > 0);
    assert.ok(definition.allowedChildren === '*' || Array.isArray(definition.allowedChildren));
    assert.ok(definition.styleControls.length > 0);
    assert.equal(typeof definition.responsive.enabled, 'boolean');
  }
});

test('un PageSchema válido se renderiza como página React responsive sin ejecutar HTML o JavaScript', () => {
  const schema = completeSchema();
  const validation = validatePageSchema(schema);
  assert.equal(validation.success, true, !validation.success ? JSON.stringify(validation.issues) : '');
  const html = renderToStaticMarkup(createElement(PageRenderer, { schema, onInvalid: 'throw' }));
  assert.match(html, /data-page-schema-version="1"/);
  assert.match(html, /@media \(max-width:767px\)/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.doesNotMatch(html, /javascript:alert/);
  assert.match(html, /href="#"/);
  assert.match(html, /<form/);
});

test('la validación rechaza componentes desconocidos, referencias rotas y nesting inválido', () => {
  const unknown = structuredClone(completeSchema()) as unknown as Record<string, unknown>;
  const components = unknown.components as Record<string, Record<string, unknown>>;
  components['hero-main'].type = 'generatedHtml';
  const unknownResult = validatePageSchema(unknown);
  assert.equal(unknownResult.success, false);
  if (!unknownResult.success) assert.ok(unknownResult.issues.some(entry => entry.code === 'component-unknown'));

  const dangling = completeSchema();
  dangling.sections['section-home'].componentIds.push('missing-component');
  const danglingResult = validatePageSchema(dangling);
  assert.equal(danglingResult.success, false);
  if (!danglingResult.success) assert.ok(danglingResult.issues.some(entry => entry.code === 'component-missing'));

  const nesting = completeSchema();
  const heading = component('heading', 'heading-main');
  const button = component('button', 'button-main');
  heading.children = [button.id];
  nesting.components[heading.id] = heading;
  nesting.components[button.id] = button;
  nesting.sections['section-home'].componentIds.push(heading.id);
  const nestingResult = validatePageSchema(nesting);
  assert.equal(nestingResult.success, false);
  if (!nestingResult.success) assert.ok(nestingResult.issues.some(entry => entry.code === 'child-not-allowed'));

  const unknownToken = completeSchema();
  unknownToken.components['hero-main'].styles.color = 'token:colors.not-defined';
  const unknownTokenResult = validatePageSchema(unknownToken);
  assert.equal(unknownTokenResult.success, false);
  if (!unknownTokenResult.success) assert.ok(unknownTokenResult.issues.some(entry => entry.code === 'theme-token-unknown'));
});

test('los overrides responsive generan CSS acotado por componente', () => {
  const schema = completeSchema();
  const page = schema.pages[schema.site.defaultPageId];
  const css = buildResponsiveCss(schema, page);
  assert.match(css, /\.ps-component-hero-main/);
  assert.match(css, /padding:24px/);
  assert.match(css, /font-size:18px/);
});

test('el documento existente de Page Composer se adapta al PageSchema validado', () => {
  const ids = incrementalIds();
  let document = createDocument(ids);
  const section = createNode('section', ids);
  document = (insertNode(document, section, document.rootId, 0) as { document: EditorDocument }).document;
  const container = createNode('container', ids);
  document = (insertNode(document, container, section.id, 0) as { document: EditorDocument }).document;
  const heading = createNode('heading', ids);
  document = (insertNode(document, heading, container.id, 0) as { document: EditorDocument }).document;
  const adapted = editorDocumentToPageSchema(document, 'Página migrada');
  const validation = validatePageSchema(adapted);
  assert.equal(validation.success, true, !validation.success ? JSON.stringify(validation.issues) : '');
  assert.match(renderToStaticMarkup(createElement(PageRenderer, { schema: adapted })), /Título de sección/);
});
