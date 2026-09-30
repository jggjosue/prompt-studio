import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findStyleSource,
  overrideBreakpoints,
  overriddenProperties,
  resolveNodeStyles,
  styleMapToCssProperties,
} from '../../src/lib/editor/responsive.ts';
import { createLandingSchema, type PageNode, type SiteSchema } from '../../src/lib/editor/page-schema.ts';

/** Nodo con estilos base y overrides por breakpoint. */
function node(styles: PageNode['styles']): PageNode {
  return { id: 'test', type: 'heading', props: {}, styles, children: [] };
}

function landing(): SiteSchema {
  return structuredClone(createLandingSchema());
}

/* ------------------------------------------------------------- herencia --- */

test('resolución: desktop es la base y no hereda de nadie', () => {
  const subject = node({ desktop: { fontSize: 64 } });
  assert.deepEqual(resolveNodeStyles(subject, 'desktop'), { fontSize: 64 });
  assert.deepEqual(resolveNodeStyles(subject, 'tablet'), { fontSize: 64 });
  assert.deepEqual(resolveNodeStyles(subject, 'mobile'), { fontSize: 64 });
});

test('resolución: tablet sobrescribe la base y mobile hereda de tablet', () => {
  const subject = node({ desktop: { fontSize: 64 }, tablet: { fontSize: 48 } });
  assert.deepEqual(resolveNodeStyles(subject, 'desktop'), { fontSize: 64 });
  assert.deepEqual(resolveNodeStyles(subject, 'tablet'), { fontSize: 48 });
  assert.deepEqual(resolveNodeStyles(subject, 'mobile'), { fontSize: 48 });
});

test('resolución: mobile sobrescribe a tablet y a la base', () => {
  const subject = node({ desktop: { fontSize: 64 }, tablet: { fontSize: 48 }, mobile: { fontSize: 36 } });
  assert.deepEqual(resolveNodeStyles(subject, 'mobile'), { fontSize: 36 });
});

test('resolución: las propiedades no sobrescritas se mezclan con las heredadas', () => {
  const subject = node({
    desktop: { fontSize: 64, paddingBlock: 32 },
    tablet: { fontSize: 48 },
  });
  assert.deepEqual(resolveNodeStyles(subject, 'tablet'), { fontSize: 48, paddingBlock: 32 });
  assert.deepEqual(resolveNodeStyles(subject, 'mobile'), { fontSize: 48, paddingBlock: 32 });
});

test('resolución: un nodo sin estilos no inventa valores', () => {
  assert.deepEqual(resolveNodeStyles(node({}), 'mobile'), {});
});

/* ---------------------------------------------------------- fuentes/origen --- */

test('findStyleSource: distingue override local de herencia', () => {
  const subject = node({ desktop: { fontSize: 64 }, tablet: { fontSize: 48 } });

  assert.equal(findStyleSource(subject, 'fontSize', 'desktop'), 'desktop');
  assert.equal(findStyleSource(subject, 'fontSize', 'tablet'), 'tablet');
  assert.equal(findStyleSource(subject, 'fontSize', 'mobile'), 'tablet');
  assert.equal(findStyleSource(subject, 'paddingBlock', 'mobile'), null);
});

/* ------------------------------------------------------------- overrides --- */

test('overrideBreakpoints: lista dónde vive un override local', () => {
  const subject = node({ desktop: { fontSize: 64 }, tablet: { fontSize: 48 } });
  assert.deepEqual(overrideBreakpoints(subject, 'fontSize'), ['desktop', 'tablet']);
  assert.deepEqual(overrideBreakpoints(subject, 'paddingBlock'), []);
});

test('overriddenProperties: lista las propiedades con override en un breakpoint', () => {
  const subject = node({ tablet: { fontSize: 48, paddingBlock: 16 } });
  assert.deepEqual(overriddenProperties(subject, 'tablet'), ['fontSize', 'paddingBlock']);
  assert.deepEqual(overriddenProperties(subject, 'mobile'), []);
});

/* ------------------------------------------------------- valores a CSS --- */

test('styleMapToCssProperties: convierte tokens, números y adimensionales', () => {
  const css = styleMapToCssProperties({
    fontSize: 64,
    paddingBlock: 24,
    background: 'token:color.primary',
    opacity: 0.5,
    lineHeight: 1.2,
  });

  assert.equal(css.fontSize, '64px');
  assert.equal(css.paddingBlock, '24px');
  assert.equal(css.background, 'var(--ps-color-primary)');
  assert.equal(css.opacity, '0.5');
  assert.equal(css.lineHeight, '1.2');
});

test('styleMapToCssProperties: descarta valores peligrosos', () => {
  const css = styleMapToCssProperties({ background: 'red;}' });
  assert.equal('background' in css, false);
});

/* ------------------------------------------- compatibilidad con la semilla --- */

test('las páginas existentes sin overrides siguen resolviendo igual en todos los breakpoints', () => {
  const schema = landing();
  const section = schema.pages[0].sections.find(item => !('mobile' in item.styles) && !('tablet' in item.styles));
  assert.ok(section, 'la semilla tiene al menos una sección sin overrides');

  const desktop = resolveNodeStyles(section, 'desktop');
  const tablet = resolveNodeStyles(section, 'tablet');
  const mobile = resolveNodeStyles(section, 'mobile');

  assert.deepEqual(tablet, desktop);
  assert.deepEqual(mobile, desktop);
  assert.ok(Object.keys(desktop).length > 0, 'la sección conserva sus estilos');
});

test('un documento con overrides sigue siendo válido (se mantiene en el schema)', () => {
  const schema = landing();
  const result = { ...schema.pages[0].sections[1], styles: { desktop: { fontSize: 64 }, tablet: { fontSize: 48 } } };
  const resolvedMobile = resolveNodeStyles(result, 'mobile');
  assert.equal(resolvedMobile.fontSize, 48);
});