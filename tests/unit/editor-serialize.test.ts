import assert from 'node:assert/strict';
import test from 'node:test';
import { createDocument, createNode, incrementalIds, insertNode, setStyles, type EditorDocument } from '../../src/lib/editor/document.ts';
import { parseDocument, assertRoundTrip, documentFingerprint, serializeDocument } from '../../src/lib/editor/serialize.ts';

function shaped() {
  const makeId = incrementalIds();
  let doc = createDocument(makeId);
  const section = createNode('section', makeId);
  doc = (insertNode(doc, section, doc.rootId, 0) as { document: EditorDocument }).document;
  doc = setStyles(doc, section.id, 'mobile', { width: '100%', top: 0 });
  return { doc, sectionId: section.id };
}

test('serializar y reparsificar devuelve un documento equivalente', () => {
  const { doc } = shaped();
  const result = parseDocument(serializeDocument(doc));
  assert.ok('document' in result, 'debe reparsificar sin errores');
  assert.deepEqual(result.document, doc);
});

test('assertRoundTrip valida y devuelve el documento', () => {
  const { doc } = shaped();
  assert.deepEqual(assertRoundTrip(doc), doc);
});

test('la huella es estable aunque cambie el orden de las claves', () => {
  const { doc, sectionId } = shaped();
  const reordered = {
    schemaVersion: doc.schemaVersion,
    rootId: doc.rootId,
    definitions: doc.definitions,
    nodes: Object.fromEntries(Object.entries(doc.nodes).reverse()),
  };
  (reordered.nodes as Record<string, unknown>)[sectionId] = {
    children: doc.nodes[sectionId]!.children,
    styles: doc.nodes[sectionId]!.styles,
    type: doc.nodes[sectionId]!.type,
    props: doc.nodes[sectionId]!.props,
    id: doc.nodes[sectionId]!.id,
    parentId: doc.nodes[sectionId]!.parentId,
  };
  assert.equal(documentFingerprint(reordered as EditorDocument), documentFingerprint(doc));
});

test('la huella cambia cuando cambia el contenido', () => {
  const { doc, sectionId } = shaped();
  const before = documentFingerprint(doc);
  const changed = setStyles(doc, sectionId, 'desktop', { width: 720 });
  assert.notEqual(documentFingerprint(changed), before);
});

test('parseDocument rechaza JSON roto y versiones futuras', () => {
  assert.ok('error' in parseDocument('{no es json'));
  assert.ok('error' in parseDocument('{"schemaVersion": 99, "rootId": "root-1", "nodes": {}, "definitions": {}}'));
});

test('parseDocument rechaza un árbol estructuralmente inválido', () => {
  const { doc, sectionId } = shaped();
  const broken = {
    ...doc,
    nodes: { ...doc.nodes, [sectionId]: { ...doc.nodes[sectionId]!, children: ['padre-fantasma'] } },
  };
  const result = parseDocument(serializeDocument(broken));
  assert.ok('error' in result);
  assert.equal(result.error, 'dangling-child');
});