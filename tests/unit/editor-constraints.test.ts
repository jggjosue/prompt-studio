import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createDocument,
  createNode,
  incrementalIds,
  insertNode,
  type EditorDocument,
} from '../../src/lib/editor/document.ts';
import {
  LAYOUT_CONSTRAINTS,
  MAX_NODE_COUNT,
  VIEWPORT_WIDTH,
  isValidDocument,
  layoutViolations,
  validateDocument,
} from '../../src/lib/editor/constraints.ts';

function base() {
  const makeId = incrementalIds();
  let doc = createDocument(makeId);
  const section = createNode('section', makeId);
  doc = (insertNode(doc, section, doc.rootId, 0) as { document: EditorDocument }).document;
  return { doc, sectionId: section.id };
}

function violationCodes(doc: EditorDocument) {
  return validateDocument(doc).map(violation => violation.code);
}

test('un documento bien formado no tiene violaciones', () => {
  const { doc } = base();
  assert.deepEqual(validateDocument(doc), []);
  assert.equal(isValidDocument(doc), true);
});

test('detecta claves que no coinciden con el id del nodo', () => {
  const { doc, sectionId } = base();
  const broken = { ...doc, nodes: { ...doc.nodes, [sectionId]: { ...doc.nodes[sectionId]!, id: 'otro-id' } } };
  assert.ok(violationCodes(broken).includes('id-mismatch'));
});

test('detecta hijos que no existen entre los nodos', () => {
  const { doc, sectionId } = base();
  const broken = {
    ...doc,
    nodes: { ...doc.nodes, [sectionId]: { ...doc.nodes[sectionId]!, children: ['fantasma'] } },
  };
  assert.ok(violationCodes(broken).includes('dangling-child'));
});

test('detecta hijos duplicados en un mismo padre', () => {
  const { doc, sectionId } = base();
  const broken = {
    ...doc,
    nodes: { ...doc.nodes, [sectionId]: { ...doc.nodes[sectionId]!, children: ['a', 'a'] } },
  };
  assert.ok(violationCodes(broken).includes('duplicate-children'));
});

test('detecta un nodo bajo dos padres', () => {
  const { doc, sectionId } = base();
  const root = doc.nodes[doc.rootId]!;
  const broken = {
    ...doc,
    nodes: {
      ...doc.nodes,
      [root.id]: { ...root, children: [...root.children, sectionId] },
    },
  };
  assert.ok(violationCodes(broken).includes('two-parents'));
});

test('detecta un padre que no lista al hijo, y un padre inexistente', () => {
  const { doc, sectionId } = base();
  const orphan = {
    ...doc,
    nodes: { ...doc.nodes, [sectionId]: { ...doc.nodes[sectionId]!, parentId: 'desaparecido' } },
  };
  assert.ok(violationCodes(orphan).includes('dangling-parent'));

  const ghost = {
    ...doc,
    nodes: {
      ...doc.nodes,
      [sectionId]: { ...doc.nodes[sectionId]!, parentId: doc.rootId },
      [doc.rootId]: { ...doc.nodes[doc.rootId]!, children: [] },
    },
  };
  assert.ok(violationCodes(ghost).includes('parent-mismatch'));
});

test('detecta una raíz ausente o con padre', () => {
  const { doc } = base();
  const broken = { ...doc, rootId: 'nada' };
  assert.ok(violationCodes(broken).includes('root-missing'));

  const withParent = {
    ...doc,
    nodes: { ...doc.nodes, [doc.rootId]: { ...doc.nodes[doc.rootId]!, parentId: 'algo' } },
  };
  assert.ok(violationCodes(withParent).includes('root-parent'));
});

test('rechaza versión de esquema desconocida y estilos fuera de breakpoints', () => {
  const { doc } = base();
  assert.ok(violationCodes({ ...doc, schemaVersion: 99 }).includes('schema-version'));

  const badStylesNode = {
    ...doc.nodes[doc.rootId]!,
    styles: { telefono: { width: 100 } },
  } as unknown as EditorDocument['nodes'][string];
  const badStyles = {
    ...doc,
    nodes: { ...doc.nodes, [doc.rootId]: badStylesNode },
  };
  assert.ok(violationCodes(badStyles).includes('invalid-styles'));
});

test('rechaza documentos que superan el tope de nodos', () => {
  const { doc } = base();
  const nodes: Record<string, (typeof doc)['nodes'][string]> = { ...doc.nodes };
  for (let i = 0; i < MAX_NODE_COUNT + 2; i += 1) {
    const id = `extra-${i}`;
    nodes[id] = { id, type: 'text', props: {}, styles: {}, children: [], parentId: null };
  }
  assert.ok(violationCodes({ ...doc, nodes }).includes('too-many-nodes'));
});

test('la geometría rechaza dimensiones negativas o no finitas', () => {
  const ok = layoutViolations({ width: 400, left: 0, height: '64px' }, 'desktop');
  assert.deepEqual(ok, []);
  const bad = layoutViolations({ width: -12, top: Number.NaN, height: 60000 }, 'mobile');
  assert.equal(bad.length, 3);
  assert.ok(bad.some(violation => violation.property === 'width'));
  assert.ok(bad.some(violation => violation.property === 'top'));
  assert.ok(bad.some(violation => violation.property === 'height'));
});

test('borrar una propiedad con null nunca es una violación', () => {
  assert.deepEqual(layoutViolations({ width: null, left: null }, 'tablet'), []);
});

test('la geometría vacía y los límites declarados protegen el lienzo', () => {
  assert.equal(layoutViolations({ width: '' }, 'desktop').length, 1);
  assert.equal(VIEWPORT_WIDTH.mobile, 375);
  assert.equal(LAYOUT_CONSTRAINTS.maxDimension >= VIEWPORT_WIDTH.desktop, true);
});