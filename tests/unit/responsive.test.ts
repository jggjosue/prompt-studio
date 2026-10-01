import assert from 'node:assert/strict';
import test from 'node:test';
import {
  EDITOR_BREAKPOINTS,
  findStyleSource,
  overrideBreakpoints,
  overriddenProperties,
  resolveNodeStyles,
  styleMapToCssProperties,
} from '../../src/lib/editor/responsive.ts';
import { resolveStyles, type EditorNode } from '../../src/lib/editor/document.ts';
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

/* -------------------------------------------------------- nivel laptop --- */

test('laptop: tablet hereda de laptop cuando no tiene override propio', () => {
  const subject = node({ desktop: { fontSize: 64 }, laptop: { fontSize: 56 } });

  assert.deepEqual(resolveNodeStyles(subject, 'desktop'), { fontSize: 64 });
  // Sin este nivel en la cadena, el editor mostraría 64 y se publicaría 56.
  assert.deepEqual(resolveNodeStyles(subject, 'tablet'), { fontSize: 56 });
  assert.deepEqual(resolveNodeStyles(subject, 'mobile'), { fontSize: 56 });
});

test('laptop: mobile recorre mobile → tablet → laptop → desktop en orden', () => {
  const subject = node({
    desktop: { fontSize: 64, color: 'black', padding: 8 },
    laptop: { fontSize: 56, color: 'gray' },
    tablet: { fontSize: 48, color: 'dimgray' },
  });

  // Cada breakpoint gana donde declara; el resto cae al siguiente nivel.
  assert.deepEqual(resolveNodeStyles(subject, 'mobile'), { fontSize: 48, color: 'dimgray', padding: 8 });
  assert.deepEqual(resolveNodeStyles(subject, 'tablet'), { fontSize: 48, color: 'dimgray', padding: 8 });
});

test('laptop: un override local de tablet gana a laptop', () => {
  const subject = node({ desktop: { fontSize: 64 }, laptop: { fontSize: 56 }, tablet: { fontSize: 48 } });

  assert.deepEqual(resolveNodeStyles(subject, 'tablet'), { fontSize: 48 });
  // Mobile cae a tablet antes que a laptop.
  assert.deepEqual(resolveNodeStyles(subject, 'mobile'), { fontSize: 48 });
});

test('laptop: no es un breakpoint editable', () => {
  // El editor ofrece tres dispositivos; `laptop` solo se hereda.
  assert.deepEqual([...EDITOR_BREAKPOINTS], ['desktop', 'tablet', 'mobile']);

  const subject = node({ desktop: { fontSize: 64 }, laptop: { fontSize: 56 } });
  // `laptop` tiene override local pero no se reporta: no se puede editar ahí.
  assert.deepEqual(overrideBreakpoints(subject, 'fontSize'), ['desktop']);
});

test('laptop: findStyleSource lo señala como origen heredado', () => {
  const subject = node({ desktop: { fontSize: 64 }, laptop: { fontSize: 56 }, tablet: { color: 'red' } });

  assert.equal(findStyleSource(subject, 'fontSize', 'tablet'), 'laptop');
  assert.equal(findStyleSource(subject, 'fontSize', 'mobile'), 'laptop');
  assert.equal(findStyleSource(subject, 'color', 'tablet'), 'tablet');
});

test('paridad: el editor resuelve exactamente lo que se publica', () => {
  // Regresión de la divergencia laptop: la cascada del editor y la del renderer
  // publicado deben coincidir en los tres breakpoints editables, para cualquier
  // combinación de overrides.
  const combos: PageNode['styles'][] = [
    { desktop: { fontSize: 64 } },
    { desktop: { fontSize: 64 }, laptop: { fontSize: 56 } },
    { desktop: { fontSize: 64 }, laptop: { fontSize: 56 }, tablet: { fontSize: 48 } },
    { desktop: { fontSize: 64 }, laptop: { fontSize: 56 }, tablet: { fontSize: 48 }, mobile: { fontSize: 36 } },
    { laptop: { fontSize: 56 } },
    { mobile: { fontSize: 36 } },
    { tablet: { color: 'red' }, laptop: { color: 'blue' }, desktop: { color: 'black' } },
    {},
  ];

  for (const styles of combos) {
    const subject = node(styles);
    // `resolveStyles` es la cascada que aplica la página publicada; solo usa
    // `styles`, así que el cast no pierde relevancia para esta aserción.
    const published = subject.styles as unknown as EditorNode['styles'];
    for (const bp of EDITOR_BREAKPOINTS) {
      assert.deepEqual(
        resolveNodeStyles(subject, bp),
        resolveStyles({ styles: published } as unknown as EditorNode, bp),
        `divergen en ${bp} con ${JSON.stringify(styles)}`
      );
    }
  }
});

/* ---------------------------------------------------------- fuentes/origen --- */

test('findStyleSource: distingue override local de herencia', () => {
  const subject = node({ desktop: { fontSize: 64 }, tablet: { fontSize: 48 } });

  assert.equal(findStyleSource(subject, 'fontSize', 'desktop'), 'desktop');
  assert.equal(findStyleSource(subject, 'fontSize', 'tablet'), 'tablet');
  assert.equal(findStyleSource(subject, 'fontSize', 'mobile'), 'tablet');
  assert.equal(findStyleSource(subject, 'paddingBlock', 'mobile'), null);
});

test('resolver y origen permiten mostrar un valor heredado sin crear un override local', () => {
  const subject = node({ desktop: { fontSize: 64 }, tablet: { fontSize: 48 } });

  assert.equal(resolveNodeStyles(subject, 'mobile').fontSize, 48);
  assert.equal(findStyleSource(subject, 'fontSize', 'mobile'), 'tablet');
  assert.equal(subject.styles.mobile, undefined, 'leer el valor efectivo no muta el schema');
  assert.deepEqual(overrideBreakpoints(subject, 'fontSize'), ['desktop', 'tablet']);
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
