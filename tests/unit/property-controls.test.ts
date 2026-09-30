import assert from 'node:assert/strict';
import test from 'node:test';
import { getPageComponent } from '../../src/components/editor/page-components.tsx';
import {
  buildControls,
  propControl,
  styleControl,
  tokenOptions,
} from '../../src/lib/editor/property-controls.ts';
import {
  PAGE_COMPONENT_TYPES,
  PAGE_PROP_FIELDS,
  createLandingSchema,
  type SiteSchema,
} from '../../src/lib/editor/page-schema.ts';
import {
  clearNodeStyle,
  locateNode,
  resetNode,
  resetNodeProp,
  resetNodeStyles,
  setNodeProp,
  setNodeStyle,
} from '../../src/lib/editor/page-schema-ops.ts';

const HOME = '/';

function landing(): SiteSchema {
  return structuredClone(createLandingSchema());
}

/* --------------------------------------------------------------- metadatos --- */

test('buildControls: cada tipo tiene controles de contenido, layout y borde', () => {
  for (const type of PAGE_COMPONENT_TYPES) {
    const controls = buildControls(type);
    assert.ok(controls.length > 0, `${type} necesita controles`);
    assert.ok(controls.some(control => control.target.type === 'prop'), `${type} necesita props`);
    assert.ok(controls.some(control => control.kind === 'padding'), `${type} necesita layout`);
    assert.ok(controls.some(control => control.kind === 'borderRadius'), `${type} necesita borde`);
  }
});

test('buildControls: no duplica una propiedad entre metadata específica y controles compartidos', () => {
  const controls = buildControls('hero');
  const keys = controls.map(control => control.target.type === 'prop'
    ? `prop:${control.target.key}`
    : `style:${control.target.property}`);

  assert.equal(new Set(keys).size, keys.length);
  assert.equal(keys.filter(key => key === 'style:paddingBlock').length, 1);
  assert.equal(keys.filter(key => key === 'style:textAlign').length, 1);
});

test('buildControls: los controles de prop coinciden con el contrato', () => {
  for (const type of PAGE_COMPONENT_TYPES) {
    const fields = PAGE_PROP_FIELDS[type];
    const controls = buildControls(type).filter(control => control.target.type === 'prop');
    assert.equal(controls.length, fields.length, `${type} debe tener un control por prop`);
    for (const field of fields) {
      assert.ok(
        controls.some(control => control.target.type === 'prop' && control.target.key === field.key),
        `${type} debe exponer ${field.key}`
      );
    }
  }
});

test('buildControls: la tipografía solo aparece en componentes con texto', () => {
  const heading = buildControls('heading');
  assert.ok(heading.some(control => control.kind === 'fontSize'));
  assert.ok(heading.some(control => control.kind === 'textAlign'));

  const image = buildControls('image');
  assert.equal(image.some(control => control.kind === 'fontSize'), false);
});

test('propControl/styleControl: traducen los kinds del contrato', () => {
  assert.equal(propControl({ key: 'text', label: 'Texto', kind: 'text' }).kind, 'text');
  assert.equal(propControl({ key: 'href', label: 'Enlace', kind: 'url' }).kind, 'url');
  assert.equal(propControl({ key: 'src', label: 'Imagen', kind: 'image' }).kind, 'image');
  assert.equal(propControl({ key: 'align', label: 'Alineación', kind: 'select', options: ['left'] }).kind, 'select');

  assert.equal(styleControl({ property: 'color', label: 'Color', kind: 'color' }).kind, 'color');
  assert.equal(styleControl({ property: 'paddingBlock', label: 'Relleno', kind: 'length' }).kind, 'padding');
  assert.equal(styleControl({ property: 'textAlign', label: 'Alineación', kind: 'alignment' }).kind, 'alignment');
});

test('tokenOptions: genera referencias token: por grupo', () => {
  const colors = tokenOptions({ 'color.primary': '#000', 'spacing.md': '16px' }, 'color');
  assert.deepEqual(colors, [{ value: 'token:color.primary', label: 'color.primary' }]);
});

/* ------------------------------------------------------------------- props --- */

test('setNodeProp: cambia una prop y valida contra el contrato', () => {
  const schema = landing();
  const result = setNodeProp(schema, HOME, 'heading-home-features', 'text', 'Nuevo título');
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(locateNode(result.schema.pages[0], 'heading-home-features')?.node.props.text, 'Nuevo título');

  const unknown = setNodeProp(schema, HOME, 'heading-home-features', 'inventada', 'x');
  assert.equal(unknown.ok, false);
  if (!unknown.ok) assert.equal(unknown.reason, 'invalid-prop');

  const badUrl = setNodeProp(schema, HOME, 'button-home-more', 'href', 'javascript:alert(1)');
  assert.equal(badUrl.ok, false);
  if (!badUrl.ok) assert.equal(badUrl.reason, 'invalid-prop');

  const badSelect = setNodeProp(schema, HOME, 'heading-home-features', 'level', 'h9');
  assert.equal(badSelect.ok, false);
  if (!badSelect.ok) assert.equal(badSelect.reason, 'invalid-prop');
});

/* ----------------------------------------------------------------- estilos --- */

test('setNodeStyle: cambia un estilo en un breakpoint y valida', () => {
  const schema = landing();
  const result = setNodeStyle(schema, HOME, 'hero-home', 'paddingBlock', 96);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const node = locateNode(result.schema.pages[0], 'hero-home')?.node;
  assert.equal(node?.styles.desktop?.paddingBlock, 96);

  const unsafe = setNodeStyle(schema, HOME, 'hero-home', 'background', 'red;{}');
  assert.equal(unsafe.ok, false);
  if (!unsafe.ok) assert.equal(unsafe.reason, 'invalid-style');

  const unknown = setNodeStyle(schema, HOME, 'hero-home', '!!!', 'x');
  assert.equal(unknown.ok, false);
  if (!unknown.ok) assert.equal(unknown.reason, 'invalid-style');

  const badBreakpoint = setNodeStyle(schema, HOME, 'hero-home', 'paddingBlock', 8, 'enorme' as never);
  assert.equal(badBreakpoint.ok, false);
  if (!badBreakpoint.ok) assert.equal(badBreakpoint.reason, 'invalid-style');
});

test('clearNodeStyle: quita una propiedad de estilo', () => {
  const schema = landing();
  const set = setNodeStyle(schema, HOME, 'hero-home', 'opacity', 0.5);
  assert.equal(set.ok, true);
  if (!set.ok) return;

  const cleared = clearNodeStyle(set.schema, HOME, 'hero-home', 'opacity');
  assert.equal(cleared.ok, true);
  if (!cleared.ok) return;
  const node = locateNode(cleared.schema.pages[0], 'hero-home')?.node;
  assert.equal(node?.styles.desktop?.opacity, undefined);
});

/* -------------------------------------------------------------- restablecer --- */

test('resetNodeProp: restaura el valor por defecto del catálogo', () => {
  const schema = landing();
  const changed = setNodeProp(schema, HOME, 'heading-home-features', 'text', 'Cambiado');
  assert.equal(changed.ok, true);
  if (!changed.ok) return;

  const defaults = getPageComponent('heading')?.defaultProps ?? {};
  const result = resetNodeProp(changed.schema, HOME, 'heading-home-features', 'text', defaults);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(locateNode(result.schema.pages[0], 'heading-home-features')?.node.props.text, defaults.text);
});

test('resetNodeStyles: quita todos los estilos del nodo', () => {
  const schema = landing();
  const set = setNodeStyle(schema, HOME, 'hero-home', 'paddingBlock', 32);
  assert.equal(set.ok, true);
  if (!set.ok) return;

  const result = resetNodeStyles(set.schema, HOME, 'hero-home');
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(locateNode(result.schema.pages[0], 'hero-home')?.node.styles, {});
});

test('resetNode: restaura props por defecto y limpia estilos', () => {
  const schema = landing();
  const changed = setNodeProp(schema, HOME, 'heading-home-features', 'text', 'Otro');
  assert.equal(changed.ok, true);
  if (!changed.ok) return;
  const styled = setNodeStyle(changed.schema, HOME, 'heading-home-features', 'fontSize', 40);
  assert.equal(styled.ok, true);
  if (!styled.ok) return;

  const defaults = getPageComponent('heading')?.defaultProps ?? {};
  const result = resetNode(styled.schema, HOME, 'heading-home-features', defaults);
  assert.equal(result.ok, true);
  if (!result.ok) return;

  const node = locateNode(result.schema.pages[0], 'heading-home-features')?.node;
  assert.deepEqual(node?.props, defaults);
  assert.deepEqual(node?.styles, {});
});

/* ------------------------------------------------------------ inmutabilidad --- */

test('las mutaciones del inspector no alteran el documento de entrada', () => {
  const schema = landing();
  const before = JSON.stringify(schema);

  setNodeProp(schema, HOME, 'heading-home-features', 'text', 'X');
  setNodeStyle(schema, HOME, 'hero-home', 'paddingBlock', 10);
  clearNodeStyle(schema, HOME, 'hero-home', 'paddingBlock');
  resetNodeProp(schema, HOME, 'heading-home-features', 'text', {});
  resetNodeStyles(schema, HOME, 'hero-home');
  resetNode(schema, HOME, 'hero-home', {});

  assert.equal(JSON.stringify(schema), before);
});
