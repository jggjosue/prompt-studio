import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BREAKPOINTS,
  SCHEMA_VERSION,
  ancestorsOf,
  countNodes,
  createDocument,
  createNode,
  descendantsOf,
  duplicateNode,
  incrementalIds,
  insertNode,
  isOverridden,
  migrateDocument,
  moveNode,
  removeNode,
  resolveStyles,
  restoreSubtree,
  setStyles,
  wrapInContainer,
  type EditorDocument,
  type EditorNode,
} from '../../src/lib/editor/document.ts';
import {
  getDefinition,
  registerComponent,
  searchDefinitions,
  validateChild,
} from '../../src/lib/editor/registry.ts';
import {
  applyCommand,
  applyInverse,
  emptyHistory,
  pushHistory,
  HISTORY_LIMIT,
  type CommandInverse,
  type EditorCommand,
} from '../../src/lib/editor/history.ts';
import { createEditorStore, selectNodeCount, ZOOM_STEPS } from '../../src/lib/editor/store.ts';
import { buildEditorPrompt } from '../../src/lib/editor/prompt.ts';

/** Documento de trabajo: root > section > container. */
function base() {
  const makeId = incrementalIds();
  let doc = createDocument(makeId);
  const section = createNode('section', makeId);
  doc = (insertNode(doc, section, doc.rootId, 0) as { document: EditorDocument }).document;
  const container = createNode('container', makeId);
  doc = (insertNode(doc, container, section.id, 0) as { document: EditorDocument }).document;
  return { doc, makeId, sectionId: section.id, containerId: container.id };
}

/* ------------------------------------------------------------- registro --- */

test('el registro cubre las categorías del diseño y busca de forma difusa', () => {
  for (const type of ['text', 'heading', 'button', 'link', 'image', 'section', 'row', 'column', 'grid', 'input', 'submitButton', 'navbar', 'card', 'badge', 'avatar', 'video', 'chart', 'html']) {
    assert.ok(getDefinition(type), `falta la definición de ${type}`);
  }
  assert.ok(searchDefinitions('btn').some(d => d.type === 'button'), 'búsqueda difusa: btn → button');
  assert.ok(searchDefinitions('cta').some(d => d.type === 'button'), 'palabras clave: cta → button');
  assert.ok(!searchDefinitions('').some(d => d.type === 'root'), 'la raíz no se ofrece en la paleta');
});

test('las reglas de anidamiento impiden los estados que rompen el documento', () => {
  assert.equal(validateChild('text', 'button', 0), 'leaf-parent', 'un botón no va dentro de un texto');
  assert.equal(validateChild('row', 'text', 0), 'child-not-allowed', 'una fila solo admite columnas');
  assert.equal(validateChild('container', 'column', 0), 'parent-not-allowed', 'una columna necesita fila o grid');
  assert.equal(validateChild('row', 'column', 0), null, 'columna en fila sí');
  assert.equal(validateChild('root', 'section', 0), null);
  assert.equal(validateChild('root', 'text', 0), 'child-not-allowed', 'la raíz solo admite estructura');
});

test('un componente nuevo se añade con registerComponent y queda disponible', () => {
  registerComponent({
    type: 'testimonial',
    label: 'Testimonio',
    category: 'content',
    icon: 'Quote',
    defaultProps: { quote: '' },
    defaultStyles: {},
    rules: { canHaveChildren: false, maxChildren: 0 },
  });
  assert.equal(getDefinition('testimonial')?.label, 'Testimonio');
  assert.ok(searchDefinitions('testi').some(d => d.type === 'testimonial'));
});

/* ------------------------------------------------------------ documento --- */

test('insertar respeta las reglas y mantiene la relación padre-hijo', () => {
  const { doc, makeId, containerId } = base();
  const heading = createNode('heading', makeId);
  const ok = insertNode(doc, heading, containerId, 0);
  assert.ok('document' in ok);
  const next = (ok as { document: EditorDocument }).document;
  assert.equal(next.nodes[heading.id].parentId, containerId);
  assert.deepEqual(next.nodes[containerId].children, [heading.id]);

  // Y una inserción inválida no toca el documento.
  const text = createNode('text', makeId);
  const rejected = insertNode(next, createNode('button', makeId), text.id, 0);
  assert.ok('error' in rejected);
});

test('mover dentro de un descendiente propio se rechaza: sería un ciclo', () => {
  const { doc, sectionId, containerId } = base();
  const result = moveNode(doc, sectionId, containerId, 0);
  assert.deepEqual(result, { error: 'cycle' }, 'mover un padre dentro de su hijo crea un ciclo');
  assert.deepEqual(moveNode(doc, sectionId, sectionId, 0), { error: 'cycle' });
});

test('mover dentro del mismo padre reordena sin perder nodos', () => {
  const { doc, makeId, containerId } = base();
  let d = doc;
  const ids: string[] = [];
  for (let i = 0; i < 3; i++) {
    const node = createNode('text', makeId);
    ids.push(node.id);
    d = (insertNode(d, node, containerId, i) as { document: EditorDocument }).document;
  }
  const moved = moveNode(d, ids[0], containerId, 2);
  assert.ok('document' in moved);
  const children = (moved as { document: EditorDocument }).document.nodes[containerId].children;
  assert.equal(children.length, 3, 'no se pierde ni se duplica');
  assert.equal(children[2], ids[0]);
});

test('borrar se lleva el subárbol y restaurarlo lo devuelve igual', () => {
  const { doc, makeId, sectionId, containerId } = base();
  let d = doc;
  const heading = createNode('heading', makeId);
  d = (insertNode(d, heading, containerId, 0) as { document: EditorDocument }).document;
  const antes = countNodes(d);

  const removed = removeNode(d, sectionId);
  assert.ok('document' in removed);
  const { document: sinSeccion, removed: subtree } = removed as {
    document: EditorDocument;
    removed: { nodes: EditorNode[]; parentId: string; index: number };
  };
  assert.equal(countNodes(sinSeccion), 0, 'se van sección, contenedor y título');
  assert.equal(subtree.nodes.length, 3);

  const restaurado = restoreSubtree(sinSeccion, subtree);
  assert.equal(countNodes(restaurado), antes);
  assert.deepEqual(restaurado.nodes[containerId].children, [heading.id]);
});

test('la raíz y los nodos bloqueados no se borran', () => {
  const { doc, containerId } = base();
  assert.deepEqual(removeNode(doc, doc.rootId), { error: 'root' });
  const bloqueado = { ...doc, nodes: { ...doc.nodes, [containerId]: { ...doc.nodes[containerId], locked: true } } };
  assert.deepEqual(removeNode(bloqueado, containerId), { error: 'locked' });
});

test('duplicar copia el subárbol con ids nuevos y sin compartir referencias', () => {
  const { doc, makeId, containerId, sectionId } = base();
  let d = doc;
  const heading = createNode('heading', makeId);
  d = (insertNode(d, heading, containerId, 0) as { document: EditorDocument }).document;

  const result = duplicateNode(d, containerId, makeId);
  assert.ok('document' in result);
  const { document: dup, newId } = result as { document: EditorDocument; newId: string };
  assert.equal(dup.nodes[sectionId].children.length, 2, 'la copia va junto al original');
  assert.notEqual(newId, containerId);
  assert.equal(descendantsOf(dup, newId).length, 1, 'el hijo también se copió');
  // Las props son objetos distintos: editar la copia no debe tocar el original.
  const copiaHijo = dup.nodes[descendantsOf(dup, newId)[0]];
  assert.notEqual(copiaHijo.props, dup.nodes[heading.id].props);
});

test('envolver en contenedor conserva la posición del nodo', () => {
  const { doc, makeId, sectionId } = base();
  let d = doc;
  const second = createNode('container', makeId);
  d = (insertNode(d, second, sectionId, 1) as { document: EditorDocument }).document;

  const result = wrapInContainer(d, second.id, 'stack', makeId);
  assert.ok('document' in result);
  const { document: wrapped, containerId: stackId } = result as { document: EditorDocument; containerId: string };
  assert.equal(wrapped.nodes[sectionId].children[1], stackId, 'el envoltorio ocupa el sitio del nodo');
  assert.deepEqual(wrapped.nodes[stackId].children, [second.id]);
  assert.equal(wrapped.nodes[second.id].parentId, stackId);
});

test('los ancestros dan la jerarquía que muestra el panel de selección', () => {
  const { doc, containerId, sectionId } = base();
  assert.deepEqual(ancestorsOf(doc, containerId), [doc.rootId, sectionId]);
});

/* -------------------------------------------------- estilos y breakpoints --- */

test('los estilos heredan desktop → laptop → tablet → mobile', () => {
  const { doc, containerId } = base();
  let d = setStyles(doc, containerId, 'desktop', { padding: '40px', color: 'red' });
  d = setStyles(d, containerId, 'tablet', { padding: '20px' });

  const node = d.nodes[containerId];
  assert.equal(resolveStyles(node, 'desktop').padding, '40px');
  assert.equal(resolveStyles(node, 'laptop').padding, '40px', 'laptop hereda de desktop');
  assert.equal(resolveStyles(node, 'tablet').padding, '20px', 'tablet sobrescribe');
  assert.equal(resolveStyles(node, 'mobile').padding, '20px', 'mobile hereda de tablet');
  assert.equal(resolveStyles(node, 'mobile').color, 'red', 'lo no sobrescrito sigue llegando');
});

test('se sabe qué propiedad está sobrescrita en cada breakpoint', () => {
  const { doc, containerId } = base();
  let d = setStyles(doc, containerId, 'desktop', { gap: '16px' });
  d = setStyles(d, containerId, 'mobile', { gap: '8px' });
  const node = d.nodes[containerId];
  assert.equal(isOverridden(node, 'mobile', 'gap'), true);
  assert.equal(isOverridden(node, 'tablet', 'gap'), false);
  assert.equal(isOverridden(node, 'desktop', 'gap'), false, 'desktop es la base, no una sobrescritura');
});

test('borrar una sobrescritura devuelve el valor heredado', () => {
  const { doc, containerId } = base();
  let d = setStyles(doc, containerId, 'desktop', { gap: '16px' });
  d = setStyles(d, containerId, 'mobile', { gap: '8px' });
  d = setStyles(d, containerId, 'mobile', { gap: null });
  assert.equal(resolveStyles(d.nodes[containerId], 'mobile').gap, '16px');
  assert.equal(d.nodes[containerId].styles.mobile, undefined, 'el breakpoint vacío no deja basura');
});

test('el prompt del editor reproduce contenido, jerarquía y estilos sin metadatos internos', () => {
  const { doc, makeId, containerId } = base();
  const heading = createNode('heading', makeId);
  heading.props = { ...heading.props, text: 'Producto editable', __editorLayoutMode: 'maximized' };
  heading.styles.mobile = { fontSize: '20px', left: 24, top: 40 };
  const next = (insertNode(doc, heading, containerId, 0) as { document: EditorDocument }).document;
  const prompt = buildEditorPrompt(next, 'Landing principal');
  assert.match(prompt, /Landing principal/);
  assert.match(prompt, /Producto editable/);
  assert.match(prompt, /Estilos mobile/);
  assert.match(prompt, /"left":24/);
  assert.doesNotMatch(prompt, /__editorLayoutMode/);
});

/* ------------------------------------------------------------- historial --- */

test('cada comando se puede deshacer y rehacer dejando el documento igual', () => {
  const { doc, makeId, containerId } = base();
  const heading = createNode('heading', makeId);

  const comandos: EditorCommand[] = [
    { kind: 'insert', node: heading, parentId: containerId, index: 0 },
    { kind: 'setProps', id: heading.id, patch: { text: 'Otro título' } },
    { kind: 'setStyles', id: heading.id, breakpoint: 'mobile', patch: { fontSize: '20px' } },
    { kind: 'rename', id: heading.id, name: 'Título del hero' },
    { kind: 'toggle', id: heading.id, flag: 'hidden' },
    { kind: 'duplicate', id: heading.id },
  ];

  let d = doc;
  const inversos: CommandInverse[] = [];
  for (const command of comandos) {
    const result = applyCommand(d, command, makeId);
    assert.ok(!('error' in result), `el comando ${command.kind} debería aplicarse`);
    d = (result as { document: EditorDocument }).document;
    inversos.push((result as { inverse: CommandInverse }).inverse);
  }
  const despues = JSON.stringify(d);

  // Deshacer todo debe devolver el documento inicial…
  let atras = d;
  const rehacer: CommandInverse[] = [];
  for (const inverse of [...inversos].reverse()) {
    const result = applyInverse(atras, inverse, makeId);
    assert.ok(!('error' in result));
    atras = (result as { document: EditorDocument }).document;
    rehacer.push((result as { inverse: CommandInverse }).inverse);
  }
  assert.equal(JSON.stringify(atras), JSON.stringify(doc), 'deshacer todo vuelve al punto de partida');

  // …y rehacer todo debe devolver el documento final.
  let adelante = atras;
  for (const inverse of [...rehacer].reverse()) {
    const result = applyInverse(adelante, inverse, makeId);
    adelante = (result as { document: EditorDocument }).document;
  }
  assert.equal(JSON.stringify(adelante), despues, 'rehacer todo vuelve al estado final');
});

test('deshacer un borrado repone el subárbol con sus mismos ids', () => {
  const { doc, makeId, containerId } = base();
  let d = doc;
  const heading = createNode('heading', makeId);
  d = (insertNode(d, heading, containerId, 0) as { document: EditorDocument }).document;

  const borrado = applyCommand(d, { kind: 'remove', id: containerId }, makeId);
  assert.ok(!('error' in borrado));
  const sin = (borrado as { document: EditorDocument }).document;
  assert.equal(sin.nodes[heading.id], undefined);

  const vuelto = applyInverse(sin, (borrado as { inverse: CommandInverse }).inverse, makeId);
  const doc2 = (vuelto as { document: EditorDocument }).document;
  assert.ok(doc2.nodes[heading.id], 'el hijo vuelve con su id original');
  assert.equal(doc2.nodes[heading.id].parentId, containerId);
});

test('el historial acota su tamaño y una acción nueva invalida lo rehacible', () => {
  let history: { past: CommandInverse[]; future: CommandInverse[] } = {
    past: [],
    future: [{ kind: 'remove', id: 'x' }],
  };
  history = pushHistory(history, { kind: 'remove', id: 'y' });
  assert.equal(history.future.length, 0, 'lo rehacible se descarta');

  let largo = emptyHistory;
  for (let i = 0; i < HISTORY_LIMIT + 25; i++) {
    largo = pushHistory(largo, { kind: 'remove', id: `n-${i}` });
  }
  assert.equal(largo.past.length, HISTORY_LIMIT, 'no crece sin límite');
  assert.equal(largo.past[0].kind, 'remove');
});

/* ----------------------------------------------------------------- store --- */

test('el store centraliza la escritura y expone deshacer/rehacer', () => {
  const store = createEditorStore(incrementalIds());
  const { document: doc } = store.getState();
  const section = createNode('section', store.nextId);

  const inserted = store.run({ kind: 'insert', node: section, parentId: doc.rootId, index: 0 });
  assert.equal(inserted.ok, true);
  assert.deepEqual(store.getState().selection, [section.id], 'lo insertado queda seleccionado');
  assert.equal(selectNodeCount(store.getState()), 1);
  assert.equal(store.getState().runtime.save, 'dirty', 'marca cambios sin guardar');

  assert.equal(store.undo(), true);
  assert.equal(selectNodeCount(store.getState()), 0);
  assert.equal(store.redo(), true);
  assert.equal(selectNodeCount(store.getState()), 1);
  assert.equal(store.undo(), true);
  assert.equal(store.undo(), false, 'sin nada que deshacer devuelve false');
});

test('un comando inválido no modifica el documento y deja el motivo', () => {
  const store = createEditorStore(incrementalIds());
  const text = createNode('text', store.nextId);
  const result = store.run({ kind: 'insert', node: text, parentId: store.getState().document.rootId, index: 0 });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'child-not-allowed');
  assert.equal(selectNodeCount(store.getState()), 0, 'el documento no cambia');
  assert.equal(store.getState().runtime.lastError, 'child-not-allowed');
});

test('soltar contenido en un canvas vacío crea una estructura válida automáticamente', () => {
  const store = createEditorStore(incrementalIds());
  const result = store.insertTypeOnCanvas('list');
  assert.equal(result.ok, true);
  assert.ok(result.id);

  const { document } = store.getState();
  const sectionId = document.nodes[document.rootId].children[0];
  const containerId = document.nodes[sectionId].children[0];
  assert.equal(document.nodes[sectionId].type, 'section');
  assert.equal(document.nodes[containerId].type, 'container');
  assert.equal(document.nodes[result.id!].type, 'list');
  assert.equal(document.nodes[result.id!].parentId, containerId);
});

test('los suscriptores solo se enteran cuando cambia su porción', () => {
  const store = createEditorStore(incrementalIds());
  let avisos = 0;
  const unsubscribe = store.subscribe(() => { avisos += 1; });
  store.setEditor({ zoom: 1.5 });
  store.setUi({ leftPanel: false });
  assert.equal(avisos, 2);
  unsubscribe();
  store.setEditor({ zoom: 1 });
  assert.equal(avisos, 2, 'tras desuscribirse no llegan avisos');
});

test('el zoom se recorta a los pasos admitidos y el breakpoint se valida', () => {
  const store = createEditorStore(incrementalIds());
  store.setEditor({ zoom: 9 });
  assert.equal(store.getState().editor.zoom, ZOOM_STEPS[ZOOM_STEPS.length - 1]);
  store.setEditor({ zoom: 0.01 });
  assert.equal(store.getState().editor.zoom, ZOOM_STEPS[0]);
  store.setEditor({ breakpoint: 'tablet' });
  assert.equal(store.getState().editor.breakpoint, 'tablet');
  store.setEditor({ breakpoint: 'reloj' as unknown as 'tablet' });
  assert.equal(store.getState().editor.breakpoint, 'tablet', 'un breakpoint inventado no se acepta');
});

/* ------------------------------------------------------------- migración --- */

test('el documento declara versión y la migración rechaza lo que no entiende', () => {
  const doc = createDocument(incrementalIds());
  assert.equal(doc.schemaVersion, SCHEMA_VERSION);
  assert.equal(migrateDocument({ ...doc, schemaVersion: SCHEMA_VERSION + 1 }), null, 'de una versión futura no se adivina');
  assert.equal(migrateDocument({}), null);
  assert.equal(migrateDocument({ nodes: {}, rootId: 'x' }), null, 'sin raíz válida no hay documento');

  const migrado = migrateDocument({ ...JSON.parse(JSON.stringify(doc)), schemaVersion: 0 });
  assert.ok(migrado);
  assert.equal(migrado!.schemaVersion, SCHEMA_VERSION);
});

test('hay exactamente cuatro breakpoints y el orden importa', () => {
  assert.deepEqual([...BREAKPOINTS], ['desktop', 'laptop', 'tablet', 'mobile']);
});
