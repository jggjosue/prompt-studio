import assert from 'node:assert/strict';
import test from 'node:test';
import { createDocument, createNode, countNodes, incrementalIds } from '../../src/lib/editor/document.ts';
import { applyCommand, applyInverse } from '../../src/lib/editor/history.ts';
import { createEditorStore } from '../../src/lib/editor/store.ts';

test('aplicar un grupo equivale a aplicar sus pasos uno a uno', () => {
  const makeId = incrementalIds();
  let sequential = createDocument(makeId);
  const section = createNode('section', makeId);
  const container = createNode('container', makeId);
  const text = createNode('text', makeId);

  const a = applyCommand(sequential, { kind: 'insert', node: section, parentId: sequential.rootId, index: 0 }, makeId);
  assert.ok('document' in a);
  sequential = a.document;
  const b = applyCommand(sequential, { kind: 'insert', node: container, parentId: section.id, index: 0 }, makeId);
  assert.ok('document' in b);
  sequential = b.document;
  const c = applyCommand(sequential, { kind: 'insert', node: text, parentId: container.id, index: 0 }, makeId);
  assert.ok('document' in c);
  sequential = c.document;

  const grouped = applyCommand(
    createDocument(incrementalIds()),
    {
      kind: 'group',
      steps: [
        { kind: 'insert', node: { ...section, id: 'section-1' }, parentId: 'root-1', index: 0 },
        { kind: 'insert', node: { ...container, id: 'container-2' }, parentId: 'section-1', index: 0 },
        { kind: 'insert', node: { ...text, id: 'text-3' }, parentId: 'container-2', index: 0 },
      ],
    },
    incrementalIds()
  );
  assert.ok('document' in grouped);

  assert.deepEqual(countNodes(sequential), countNodes(grouped.document));
  assert.equal(grouped.document.nodes['section-1']!.parentId, sequential.nodes[section.id]!.parentId);
  assert.equal(grouped.document.nodes['container-2']!.children[0], 'text-3');
});

test('un grupo es atómico: un paso inválido revierte el efecto de los previos', () => {
  const makeId = incrementalIds();
  const doc = createDocument(makeId);
  const section = createNode('section', makeId);
  const result = applyCommand(
    doc,
    {
      kind: 'group',
      steps: [
        // Válido en solitario…
        { kind: 'insert', node: section, parentId: doc.rootId, index: 0 },
        // …pero el destino no existe: todo el grupo debe fallar.
        { kind: 'insert', node: createNode('button', makeId), parentId: 'padre-fantasma', index: 0 },
      ],
    },
    makeId
  );
  assert.ok('error' in result);
  assert.deepEqual(countNodes(doc), 0, 'ningún paso parcial queda aplicado');
});

test('deshacer un grupo lo revierte entero; rehacerlo lo restaura igual', () => {
  const makeId = incrementalIds(100);
  const doc = createDocument(makeId);
  const applied = applyCommand(
    doc,
    {
      kind: 'group',
      steps: [
        { kind: 'insert', node: createNode('section', makeId), parentId: doc.rootId, index: 0 },
        { kind: 'insert', node: createNode('container', makeId), parentId: 'section-102', index: 0 },
        { kind: 'insert', node: createNode('button', makeId), parentId: 'container-103', index: 0 },
      ],
    },
    makeId
  );
  assert.ok('document' in applied);

  const undone = applyInverse(applied.document, applied.inverse, makeId);
  assert.ok('document' in undone);
  assert.deepEqual(countNodes(undone.document), 0, 'el grupo se deshace de una vez');

  const redone = applyInverse(undone.document, undone.inverse, makeId);
  assert.ok('document' in redone);
  assert.deepEqual(redone.document, applied.document, 'el redo reconstruye el mismo árbol');
});

test('insertTypeOnCanvas sobre canvas vacío añade estructura y un deshacer lo retira entero', () => {
  const store = createEditorStore();
  const result = store.insertTypeOnCanvas('button');
  assert.equal(result.ok, true);
  assert.ok(result.id, 'devuelve el id del nodo insertado');
  assert.equal(countNodes(store.getState().document), 3, 'sección + contenedor + botón');
  assert.equal(store.getState().history.past.length, 1, 'un solo paso en el historial, no tres');
  assert.equal(store.getState().selection.length, 1);

  assert.equal(store.undo(), true);
  assert.equal(countNodes(store.getState().document), 0, 'un deshacer retira la estructura completa');
  assert.equal(store.getState().history.future.length, 1);

  assert.equal(store.redo(), true);
  assert.equal(countNodes(store.getState().document), 3);
  assert.equal(store.getState().history.past.length, 1);
});

test('el repliegue sobre un lienzo con contenido no rompe la estructura existente', () => {
  const store = createEditorStore();
  assert.equal(store.insertType('section', store.getState().document.rootId, 0).ok, true);
  assert.equal(store.insertTypeOnCanvas('text').ok, true);
  assert.equal(countNodes(store.getState().document), 4, 'sección + sección + contenedor + texto');
  assert.equal(store.undo(), true);
  assert.equal(countNodes(store.getState().document), 1, 'el deshacer quita solo la segunda sección');
});