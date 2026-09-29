import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BREAKPOINTS,
  PAGE_COMPONENT_TYPES,
  PAGE_SCHEMA_VERSION,
  allowsChild,
  canonicalize,
  collectIds,
  countNodes,
  createLandingSchema,
  findPage,
  fingerprintSchema,
  isValidPageSchema,
  safeUrl,
  styleValueToCss,
  tokenRefToCssVariable,
  treeDepth,
  validatePageSchema,
  type SiteSchema,
} from '../../src/lib/editor/page-schema.ts';
import {
  PAGE_COMPONENT_REGISTRY,
  getPageComponent,
  listPageComponents,
  withDefaultProps,
} from '../../src/components/editor/page-components.tsx';
import { MEDIA_MAX_WIDTH, PageRenderer, rulesFor, themeVariables } from '../../src/components/editor/page-renderer.tsx';
import { DEFAULT_TOKENS } from '../../src/lib/editor/tokens.ts';

/** Documento válido de trabajo, clonado para cada prueba. */
function landing(): SiteSchema {
  return structuredClone(createLandingSchema());
}

test('el catálogo cubre exactamente los 16 tipos del contrato', () => {
  assert.equal(PAGE_COMPONENT_TYPES.length, 16);
  assert.equal(Object.keys(PAGE_COMPONENT_REGISTRY).length, 16);
  assert.deepEqual(
    [...PAGE_COMPONENT_TYPES].sort(),
    Object.keys(PAGE_COMPONENT_REGISTRY).sort()
  );
  for (const type of PAGE_COMPONENT_TYPES) {
    const definition = PAGE_COMPONENT_REGISTRY[type];
    assert.equal(definition.type, type, `${type} debe declarar su propio tipo`);
    assert.equal(typeof definition.component, 'function', `${type} necesita componente React`);
    assert.ok(Object.keys(definition.defaultProps).length > 0, `${type} necesita props por defecto`);
    assert.ok(definition.editableProps.length > 0, `${type} necesita propiedades editables`);
    assert.ok(definition.styleControls.length > 0, `${type} necesita controles de estilo`);
    assert.ok(definition.responsive.breakpoints.includes('mobile'), `${type} debe declarar mobile`);
    assert.ok(definition.label && definition.description, `${type} necesita etiqueta y descripción`);
  }
});

test('el registro deriva hijos y props editables del contrato puro', () => {
  const container = getPageComponent('container');
  assert.ok(container);
  assert.ok(container.allowedChildren.includes('heading'));
  assert.equal(getPageComponent('navbar')?.allowedChildren.length, 0);
  assert.equal(getPageComponent('tipo-inexistente'), undefined);
  assert.equal(listPageComponents().length, 16);
  assert.equal(allowsChild('columns', 'button'), true);
  assert.equal(allowsChild('button', 'heading'), false);
});

test('withDefaultProps rellena huecos sin pisar lo declarado', () => {
  const merged = withDefaultProps('button', { label: 'Mío' });
  assert.equal(merged.label, 'Mío');
  assert.equal(merged.variant, 'primary');
  assert.equal(merged.size, 'md');
});

test('la semilla del builder es válida y usa los 16 componentes', () => {
  const schema = landing();
  const result = validatePageSchema(schema);
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.issues, null, 2));
  assert.equal(schema.schemaVersion, PAGE_SCHEMA_VERSION);

  const used = new Set<string>();
  type AnyNode = { type: string; children: AnyNode[] };
  const walk = (nodes: AnyNode[]): void => {
    for (const node of nodes) {
      used.add(node.type);
      walk(node.children);
    }
  };
  walk(schema.pages[0].sections as unknown as AnyNode[]);
  assert.deepEqual([...used].sort(), [...PAGE_COMPONENT_TYPES].sort(), 'la semilla debe ejercitar el catálogo completo');
});

test('rechaza un componente desconocido señalando la ruta', () => {
  const schema = landing();
  (schema.pages[0].sections[0] as { type: string }).type = 'evil-iframe';
  const result = validatePageSchema(schema);
  assert.equal(result.ok, false);
  if (result.ok) return;
  const issue = result.issues.find(item => item.code === 'unknown-component');
  assert.ok(issue);
  assert.match(issue.path, /pages\[0\]\.sections\[0\]\.type/);
});

test('rechaza propiedades no declaradas y valores fuera de rango', () => {
  const schema = landing();
  const hero = schema.pages[0].sections[1];
  hero.props.onClick = 'alert(1)';
  hero.props.align = 'diagonal';
  const result = validatePageSchema(schema);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.issues.some(item => item.code === 'unknown-prop' && item.path.endsWith('.props.onClick')));
  assert.ok(result.issues.some(item => item.code === 'invalid-prop' && item.path.endsWith('.props.align')));
});

test('rechaza anidamiento no permitido y hojas con hijos', () => {
  const schema = landing();
  const navbar = schema.pages[0].sections[0];
  navbar.children = [{ id: 'colada', type: 'heading', props: { text: 'x' }, styles: {}, children: [] }];
  const result = validatePageSchema(schema);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.ok(result.issues.some(item => item.code === 'unexpected-nesting'), 'una hoja no admite hijos');
});

test('rechaza ids duplicados y claves de prototipo', () => {
  const duplicate = landing();
  duplicate.pages[1].sections[0].id = duplicate.pages[0].sections[0].id;
  const dupResult = validatePageSchema(duplicate);
  assert.equal(dupResult.ok, false);
  if (!dupResult.ok) assert.ok(dupResult.issues.some(item => item.code === 'duplicate-id'));

  const proto = landing() as unknown as Record<string, unknown>;
  Object.defineProperty(proto, '__proto__', { value: { polluted: true }, enumerable: true, configurable: true });
  const protoResult = validatePageSchema(proto);
  assert.equal(protoResult.ok, false);
  if (!protoResult.ok) assert.ok(protoResult.issues.some(item => item.code === 'invalid-structure'));
});

test('exige navbar primera y una sola navbar y footer', () => {
  const lateNavbar = landing();
  const [navbar] = lateNavbar.pages[0].sections.splice(0, 1);
  assert.ok(navbar);
  lateNavbar.pages[0].sections.splice(2, 0, navbar);
  const result = validatePageSchema(lateNavbar);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.ok(result.issues.some(item => item.message.includes('primera sección')));
  }

  const twoFooters = landing();
  twoFooters.pages[0].sections.push(structuredClone(twoFooters.pages[0].sections.at(-1)!));
  twoFooters.pages[0].sections.at(-1)!.id = 'footer-extra';
  const footerResult = validatePageSchema(twoFooters);
  assert.equal(footerResult.ok, false);
  if (!footerResult.ok) assert.ok(footerResult.issues.some(item => item.message.includes('un footer')));
});

test('rechaza esquemas malformados sin lanzar excepciones', () => {
  assert.equal(validatePageSchema(null).ok, false);
  assert.equal(validatePageSchema('texto').ok, false);
  assert.equal(validatePageSchema({}).ok, false);
  assert.equal(validatePageSchema({ schemaVersion: 99, site: {}, pages: [] }).ok, false);
  assert.equal(isValidPageSchema(createLandingSchema()), true);
  assert.equal(isValidPageSchema({ pages: 'no' }), false);
});

test('valida tokens del tema y rechaza inyección en la hoja', () => {
  const schema = landing();
  schema.site.theme.tokens['color.primary; } body { color: red'] = 'red';
  const result = validatePageSchema(schema);
  assert.equal(result.ok, false);
  if (!result.ok) assert.ok(result.issues.some(item => item.code === 'invalid-token'));
});

test('los estilos descartan valores capaces de cerrar una regla', () => {
  assert.equal(styleValueToCss('background', 'red;} body { color: red'), null);
  assert.equal(styleValueToCss('background', '</style><script>alert(1)</script>'), null);
  assert.equal(styleValueToCss('paddingBlock', 32), '32px');
  assert.equal(styleValueToCss('fontWeight', 700), '700');
  assert.equal(styleValueToCss('backgroundColor', 'red'), 'red');
});

test('las referencias a tokens se publican como variables CSS', () => {
  assert.equal(tokenRefToCssVariable('token:color.primary'), 'var(--ps-color-primary)');
  assert.equal(tokenRefToCssVariable('token:color.primary; }'), null);
  assert.equal(tokenRefToCssVariable('red'), null);
  assert.equal(styleValueToCss('background', 'token:color.primary'), 'var(--ps-color-primary)');
});

test('safeUrl solo admite rutas internas y esquemas seguros', () => {
  assert.equal(safeUrl('/precios'), '/precios');
  assert.equal(safeUrl('#contacto'), '#contacto');
  assert.equal(safeUrl('https://example.com'), 'https://example.com');
  assert.equal(safeUrl('mailto:hola@example.com'), 'mailto:hola@example.com');
  assert.equal(safeUrl('javascript:alert(1)'), undefined);
  assert.equal(safeUrl('data:text/html,<script>alert(1)</script>'), undefined);
  assert.equal(safeUrl('  javascript:alert(1)'), undefined);
  assert.equal(safeUrl(42), undefined);
});

test('la hoja generada incluye base y media queries, y no se puede inyectar', () => {
  const node = {
    id: 'demo',
    type: 'hero' as const,
    props: {},
    styles: {
      desktop: { paddingBlock: 80, background: 'red; } body { display:none' },
      tablet: { paddingBlock: 40 },
      mobile: { paddingBlock: 24 },
    },
    children: [],
  };
  const css = rulesFor(node, 'scope-x');
  assert.match(css, /\[data-ps-scope="scope-x"\] \[data-ps-id="demo"\]\{padding-block:80px/);
  assert.match(css, /@media \(max-width: 1023\.98px\)/);
  assert.match(css, /@media \(max-width: 767\.98px\)/);
  assert.doesNotMatch(css, /body \{ display:none/, 'un valor inyectado no debe llegar a la hoja');
  assert.equal(MEDIA_MAX_WIDTH.laptop > MEDIA_MAX_WIDTH.tablet, true);
  assert.deepEqual(BREAKPOINTS, ['desktop', 'laptop', 'tablet', 'mobile']);
});

test('el tema se publica como variables --ps-*', () => {
  const schema = landing();
  const variables = themeVariables(schema.pages[0], schema);
  assert.equal(variables['--ps-color-primary'], '#7c3aed');
  assert.equal(variables['--ps-color-secondary'], '#ec4899');
  assert.equal(variables['--ps-color-ink'], DEFAULT_TOKENS['color.ink']);
  assert.equal(variables['--ps-font-family'], 'Inter, system-ui, sans-serif');
});

test('el renderer produce HTML semántico sin ejecutar nada', () => {
  const html = renderToStaticMarkup(createElement(PageRenderer, { schema: landing() }));
  assert.match(html, /data-ps-scope="ps-site"/);
  assert.match(html, /<header/);
  assert.match(html, /<footer/);
  assert.match(html, /<section/);
  assert.match(html, /<form/);
  assert.match(html, /@media \(max-width: 767\.98px\)/);
  assert.doesNotMatch(html, /javascript:/i);
  assert.doesNotMatch(html, /<script/i);
});

test('el renderer devuelve null para una página ausente', () => {
  const html = renderToStaticMarkup(createElement(PageRenderer, { schema: landing(), slug: '/no-existe' }));
  assert.equal(html, '');
});

test('el renderer no usa eval, Function ni HTML crudo', () => {
  const files = ['page-renderer.tsx', 'page-components.tsx'];
  for (const file of files) {
    const source = readFileSync(new URL(`../../src/components/editor/${file}`, import.meta.url), 'utf8');
    assert.doesNotMatch(source, /\beval\s*\(/, `${file}`);
    assert.doesNotMatch(source, /new\s+Function\s*\(/, `${file}`);
    assert.doesNotMatch(source, /dangerouslySetInnerHTML/, `${file}`);
    assert.doesNotMatch(source, /innerHTML\s*=/, `${file}`);
  }
});

test('utilidades del árbol cuentan, miden y serializan de forma estable', () => {
  const schema = landing();
  const sections = schema.pages[0].sections;
  assert.equal(countNodes(sections), collectIds(sections).length);
  assert.equal(treeDepth(sections) >= 3, true);
  assert.equal(canonicalize({ b: 1, a: 2 }), canonicalize({ a: 2, b: 1 }));
  const fingerprint = fingerprintSchema(schema);
  assert.match(fingerprint, /^[0-9a-f]{8}$/);
  assert.equal(fingerprintSchema(landing()), fingerprint);
  const changed = landing();
  changed.pages[0].sections[1].props.title = 'Otro título';
  assert.notEqual(fingerprintSchema(changed), fingerprint);
  assert.equal(findPage(schema, '/precios')?.id, 'page-pricing');
  assert.equal(findPage(schema)?.slug, '/');
});
