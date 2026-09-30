import assert from 'node:assert/strict';
import test from 'node:test';
import { getPageComponent } from '../../src/components/editor/page-components.tsx';
import {
  MAX_DEPTH,
  createLandingSchema,
  type SiteSchema,
} from '../../src/lib/editor/page-schema.ts';
import {
  addNode,
  canInsert,
  canMove,
  duplicateNode,
  locateNode,
  moveNode,
  moveWithinParent,
  removeNode,
  reorderSection,
  restoreNode,
  type OpsDeps,
} from '../../src/lib/editor/page-schema-ops.ts';

const HOME = '/';

/** Dependencias deterministas: ids previsibles y defaults del catálogo real. */
function deps(): OpsDeps {
  let counter = 0;
  return {
    makeId: type => `${type}-op${(counter += 1)}`,
    defaults: type => {
      const definition = getPageComponent(type);
      return definition
        ? { defaultProps: definition.defaultProps, defaultStyles: definition.defaultStyles }
        : undefined;
    },
  };
}

function landing(): SiteSchema {
  return structuredClone(createLandingSchema());
}

const ids = (schema: SiteSchema): string[] =>
  (schema.pages[0].sections).map(section => section.id);

/* -------------------------------------------------------------------- add --- */

test('add: inserta un componente nuevo con las props del catálogo', () => {
  const schema = landing();
  const result = addNode(schema, HOME, { parentId: 'container-main', index: 0 }, 'heading', deps());

  assert.equal(result.ok, true);
  if (!result.ok) return;
  const container = locateNode(result.schema.pages[0], 'container-main');
  assert.ok(container);
  assert.equal(container.node.children[0].type, 'heading');
  assert.equal(container.node.children[0].id, result.id);
  assert.equal(typeof container.node.children[0].props.text, 'string');
});

test('add: coloca una sección nueva en el primer nivel y respeta el índice', () => {
  const schema = landing();
  const result = addNode(schema, HOME, { parentId: null, index: 1 }, 'cta', deps());
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.schema.pages[0].sections[1].type, 'cta');
  assert.equal(result.schema.pages[0].sections.length, schema.pages[0].sections.length + 1);
});

test('add: la barra de navegación se fuerza al principio y es única', () => {
  const schema = landing();
  const first = addNode(schema, HOME, { parentId: null, index: 5 }, 'navbar', deps());
  assert.equal(first.ok, false);
  if (first.ok) return;
  assert.equal(first.reason, 'single-instance');

  const sinNav = landing();
  sinNav.pages[0].sections = sinNav.pages[0].sections.filter(section => section.type !== 'navbar');
  const added = addNode(sinNav, HOME, { parentId: null, index: 4 }, 'navbar', deps());
  assert.equal(added.ok, true);
  if (!added.ok) return;
  assert.equal(added.schema.pages[0].sections[0].type, 'navbar');
});

test('invalid nesting: rechaza anidar un tipo que el padre no admite', () => {
  const schema = landing();
  const navbar = addNode(schema, HOME, { parentId: 'columns-home', index: 0 }, 'navbar', deps());
  assert.equal(navbar.ok, false);
  if (navbar.ok) return;
  assert.equal(navbar.reason, 'invalid-nesting');

  const imageInColumns = addNode(schema, HOME, { parentId: 'columns-home', index: 0 }, 'image', deps());
  assert.equal(imageInColumns.ok, true);

  const unknown = addNode(schema, HOME, { parentId: null, index: 0 }, 'inexistente' as never, deps());
  assert.equal(unknown.ok, false);
  if (unknown.ok) return;
  assert.equal(unknown.reason, 'unknown-component');
});

/* ------------------------------------------------------------------- move --- */

test('move: mueve un nodo a un contenedor compatible y lo reindexa', () => {
  const schema = landing();
  const result = moveNode(schema, HOME, 'heading-home-features', { parentId: 'columns-home', index: 0 });
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(locateNode(result.schema.pages[0], 'heading-home-features')?.parentId, 'columns-home');
  const columns = locateNode(result.schema.pages[0], 'columns-home');
  assert.equal(columns?.node.children[0].id, 'heading-home-features');
  const container = locateNode(result.schema.pages[0], 'container-main');
  assert.equal(container?.node.children.some(child => child.id === 'heading-home-features'), false);
});

test('move: reordenar secciones es un movimiento en el primer nivel', () => {
  const schema = landing();
  const before = ids(schema);
  const result = reorderSection(schema, HOME, 2, 0);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  const after = ids(result.schema);
  assert.equal(after[0], before[2]);
  assert.deepEqual(after.slice(1, 3), [before[0], before[1]]);
  assert.deepEqual([...after].sort(), [...before].sort());
});

test('move: subir y bajar entre hermanos respeta los extremos', () => {
  const schema = landing();
  const index = ids(schema).indexOf('gallery-home');
  const down = moveWithinParent(schema, HOME, 'gallery-home', 1);
  assert.equal(down.ok, true);
  if (down.ok) assert.equal(ids(down.schema).indexOf('gallery-home'), index + 1);

  const first = ids(schema)[0];
  const upEdge = moveWithinParent(schema, HOME, first, -1);
  assert.equal(upEdge.ok, false);
  if (!upEdge.ok) assert.equal(upEdge.reason, 'invalid-target');
});

test('move: rechaza mover un nodo dentro de sí mismo o su subárbol', () => {
  const schema = landing();
  const self = moveNode(schema, HOME, 'container-a', { parentId: 'container-a', index: 0 });
  assert.equal(self.ok, false);
  if (!self.ok) assert.equal(self.reason, 'cycle');

  const inside = moveNode(schema, HOME, 'container-main', { parentId: 'container-a', index: 0 });
  assert.equal(inside.ok, false);
  if (!inside.ok) assert.equal(inside.reason, 'cycle');
});

/* -------------------------------------------------------------- duplicate --- */

test('duplicate: clona el subárbol con ids nuevos justo después del original', () => {
  const schema = landing();
  const before = locateNode(schema.pages[0], 'features-home')?.node;
  const result = duplicateNode(schema, HOME, 'features-home', deps());
  assert.equal(result.ok, true);
  if (!result.ok || !before) return;

  const container = locateNode(result.schema.pages[0], 'container-a');
  assert.ok(container);
  const copy = locateNode(result.schema.pages[0], result.id);
  assert.ok(copy);
  assert.equal(copy.parentId, 'container-a');
  assert.equal(copy.node.type, before.type);
  assert.equal(container.node.children.filter(child => child.id === result.id).length, 1);

  const originalIndex = container.node.children.findIndex(child => child.id === 'features-home');
  assert.equal(container.node.children[originalIndex + 1].id, result.id);
});

test('duplicate: no se permite duplicar navbar ni footer', () => {
  const schema = landing();
  const result = duplicateNode(schema, HOME, 'nav-home', deps());
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, 'single-instance');
});

/* ----------------------------------------------------------------- delete --- */

test('delete: elimina el nodo y su subárbol, y se puede restaurar', () => {
  const schema = landing();
  const result = removeNode(schema, HOME, 'container-main');
  assert.equal(result.ok, true);
  if (!result.ok) return;

  assert.equal(locateNode(result.schema.pages[0], 'container-main'), undefined);
  assert.equal(locateNode(result.schema.pages[0], 'columns-home'), undefined);

  const restored = restoreNode(result.schema, HOME, result.removed);
  assert.equal(restored.ok, true);
  if (!restored.ok) return;
  assert.ok(locateNode(restored.schema.pages[0], 'container-main'));
  assert.ok(locateNode(restored.schema.pages[0], 'columns-home'));
});

/* --------------------------------------------------- predicados del lienzo --- */

test('canInsert/canMove: describen el rechazo sin aplicar la mutación', () => {
  const schema = landing();
  const good = canInsert(schema, HOME, { parentId: 'container-main', index: 0 }, 'text');
  assert.equal(good, null);

  const bad = canInsert(schema, HOME, { parentId: 'hero-home', index: 0 }, 'text');
  assert.equal(bad?.reason, 'invalid-nesting');

  const moveBad = canMove(schema, HOME, 'hero-home', { parentId: 'columns-home', index: 0 });
  assert.equal(moveBad?.reason, 'invalid-nesting');

  const moveGood = canMove(schema, HOME, 'heading-home-features', { parentId: 'columns-home', index: 0 });
  assert.equal(moveGood, null);
});

test('límites: rechaza superar la profundidad máxima', () => {
  let schema = landing();
  const options = deps();
  let parentId: string | null = 'container-main';
  let lastError: string | null = null;

  for (let depth = 0; depth < MAX_DEPTH + 2; depth += 1) {
    const result = addNode(schema, HOME, { parentId, index: 0 }, 'container', options);
    if (!result.ok) {
      lastError = result.reason;
      break;
    }
    schema = result.schema;
    parentId = result.id;
  }

  assert.equal(lastError, 'depth-limit');
});

/* ------------------------------------------------------------ inmutabilidad --- */

test('las operaciones no mutan el documento de entrada', () => {
  const schema = landing();
  const before = JSON.stringify(schema);

  addNode(schema, HOME, { parentId: null, index: 0 }, 'cta', deps());
  moveNode(schema, HOME, 'heading-home-features', { parentId: 'columns-home', index: 0 });
  duplicateNode(schema, HOME, 'features-home', deps());
  removeNode(schema, HOME, 'gallery-home');
  reorderSection(schema, HOME, 0, 2);

  assert.equal(JSON.stringify(schema), before);
});
