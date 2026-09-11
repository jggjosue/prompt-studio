import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  createDocument,
  createNode,
  incrementalIds,
  insertNode,
  type EditorDocument,
} from '../../src/lib/editor/document.ts';
import {
  CLIPBOARD_FORMAT,
  copySubtree,
  parseClipboard,
  pasteSubtree,
  serializeClipboard,
} from '../../src/lib/editor/clipboard.ts';
import { autoScrollDelta, readEditorDrag, resolveDropPosition } from '../../src/lib/editor/drag.ts';
import { eventSignature, isTypingTarget, matchShortcut, SHORTCUTS, shortcutLabel } from '../../src/lib/editor/shortcuts.ts';
import { DEFAULT_TOKENS, formatLength, parseLength, resolveToken } from '../../src/lib/editor/tokens.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

function tree() {
  const makeId = incrementalIds();
  let doc = createDocument(makeId);
  const section = createNode('section', makeId);
  doc = (insertNode(doc, section, doc.rootId, 0) as { document: EditorDocument }).document;
  const container = createNode('container', makeId);
  doc = (insertNode(doc, container, section.id, 0) as { document: EditorDocument }).document;
  const heading = createNode('heading', makeId);
  doc = (insertNode(doc, heading, container.id, 0) as { document: EditorDocument }).document;
  return { doc, makeId, sectionId: section.id, containerId: container.id, headingId: heading.id };
}

/* --------------------------------------------------------- portapapeles --- */

test('copiar y pegar preserva estilos y props con ids nuevos', () => {
  const { doc, makeId, containerId, headingId, sectionId } = tree();
  const conTexto = {
    ...doc,
    nodes: {
      ...doc.nodes,
      [headingId]: {
        ...doc.nodes[headingId],
        props: { text: 'Hola', level: 1 },
        styles: { desktop: { color: 'red' }, mobile: { fontSize: '18px' } },
      },
    },
  };

  const payload = copySubtree(conTexto, containerId);
  assert.ok(payload, 'debe poder copiarse');
  assert.equal(payload!.format, CLIPBOARD_FORMAT);
  assert.equal(payload!.nodes.length, 2, 'contenedor y título');

  const pegado = pasteSubtree(conTexto, payload!, sectionId, 1, makeId);
  assert.ok(!('error' in pegado));
  const { document: after, rootId: newRoot } = pegado as { document: EditorDocument; rootId: string };
  assert.equal(after.nodes[sectionId].children.length, 2, 'la copia se añade');
  assert.notEqual(newRoot, containerId, 'ids nuevos');

  const copiaTitulo = after.nodes[after.nodes[newRoot].children[0]];
  assert.equal(copiaTitulo.props.text, 'Hola', 'las props se preservan');
  assert.deepEqual(copiaTitulo.styles.mobile, { fontSize: '18px' }, 'los estilos por breakpoint también');
  assert.notEqual(copiaTitulo.id, headingId);
});

test('pegar dos veces no produce ids repetidos', () => {
  const { doc, makeId, containerId, sectionId } = tree();
  const payload = copySubtree(doc, containerId)!;
  const first = pasteSubtree(doc, payload, sectionId, 1, makeId) as { document: EditorDocument };
  const second = pasteSubtree(first.document, payload, sectionId, 2, makeId) as { document: EditorDocument };
  const ids = Object.keys(second.document.nodes);
  assert.equal(new Set(ids).size, ids.length, 'no hay colisiones de id');
});

test('pegar respeta las reglas del destino', () => {
  const { doc, makeId, containerId } = tree();
  // Una columna solo va dentro de una fila o un grid.
  const column = createNode('column', makeId);
  const payload = { format: CLIPBOARD_FORMAT as typeof CLIPBOARD_FORMAT, rootId: column.id, nodes: [column] };
  const result = pasteSubtree(doc, payload, containerId, 0, makeId);
  assert.deepEqual(result, { error: 'parent-not-allowed' });
});

test('el portapapeles rechaza texto que no sea nuestro', () => {
  assert.equal(parseClipboard('hola'), null);
  assert.equal(parseClipboard('{"format":"otra-cosa"}'), null);
  assert.equal(parseClipboard(JSON.stringify({ format: CLIPBOARD_FORMAT, rootId: 'x', nodes: [] })), null, 'la raíz debe estar entre los nodos');
  const { doc, containerId } = tree();
  const valido = serializeClipboard(copySubtree(doc, containerId)!);
  assert.ok(parseClipboard(valido), 'un subárbol propio sí se acepta');
});

/* ---------------------------------------------------------------- drag --- */

test('la posición de soltado depende del tercio y de si acepta hijos', () => {
  const rect = { top: 0, height: 100 };
  assert.equal(resolveDropPosition(rect, 10, true), 'before');
  assert.equal(resolveDropPosition(rect, 50, true), 'inside');
  assert.equal(resolveDropPosition(rect, 90, true), 'after');
  // En una hoja no hay «dentro»: el centro se reparte entre antes y después.
  assert.equal(resolveDropPosition(rect, 40, false), 'before');
  assert.equal(resolveDropPosition(rect, 60, false), 'after');
});

test('el autoscroll solo actúa cerca de los bordes', () => {
  const rect = { top: 100, bottom: 700 };
  assert.ok(autoScrollDelta(rect, 120) < 0, 'arriba: sube');
  assert.ok(autoScrollDelta(rect, 680) > 0, 'abajo: baja');
  assert.equal(autoScrollDelta(rect, 400), 0, 'en el centro no se mueve');
});

test('un arrastre ajeno no se interpreta como componente', () => {
  const fake = (data: Record<string, string>) =>
    ({ dataTransfer: { getData: (k: string) => data[k] ?? '' } }) as unknown as React.DragEvent;
  assert.equal(readEditorDrag(fake({ 'text/plain': 'texto de otra app' })), null);
  assert.equal(readEditorDrag(fake({ 'text/plain': '{"source":"inventado"}' })), null);
  assert.deepEqual(
    readEditorDrag(fake({ 'application/x-prompt-studio-editor': '{"source":"palette","type":"button"}' })),
    { source: 'palette', type: 'button' }
  );
});

/* ------------------------------------------------------------- atajos --- */

test('los atajos se resuelven con la firma del evento', () => {
  assert.equal(matchShortcut({ key: 'z', metaKey: true }), 'undo');
  assert.equal(matchShortcut({ key: 'z', metaKey: true, shiftKey: true }), 'redo');
  assert.equal(matchShortcut({ key: 'd', ctrlKey: true }), 'duplicate');
  assert.equal(matchShortcut({ key: 'Delete' }), 'delete');
  assert.equal(matchShortcut({ key: 'ArrowUp', shiftKey: true }), 'nudgeUpFast');
  assert.equal(matchShortcut({ key: 'q', metaKey: true }), null, 'lo no mapeado no se captura');
  assert.equal(eventSignature({ key: 'K', metaKey: true }), 'mod+k', 'la tecla se normaliza a minúscula');
});

test('escribiendo en un campo solo pasan los atajos permitidos', () => {
  const input = { tagName: 'INPUT' };
  assert.equal(matchShortcut({ key: 'd', metaKey: true, target: input }), null, 'no debe duplicar mientras se escribe');
  assert.equal(matchShortcut({ key: 'Delete', target: input }), null, 'no debe borrar el nodo al borrar texto');
  assert.equal(matchShortcut({ key: 'Escape', target: input }), 'deselect', 'Escape sí, está marcado');
  assert.equal(isTypingTarget({ isContentEditable: true }), true, 'la edición inline también cuenta');
  assert.equal(isTypingTarget({ tagName: 'DIV' }), false);
});

test('cada atajo tiene etiqueta legible y no hay firmas duplicadas', () => {
  const signatures = SHORTCUTS.flatMap(s => s.keys);
  assert.equal(new Set(signatures).size, signatures.length, 'dos acciones no pueden compartir atajo');
  assert.equal(shortcutLabel('undo', true), '⌘z');
  assert.equal(shortcutLabel('undo', false), 'Ctrl+z');
});

/* ------------------------------------------------- tokens y unidades --- */

test('los tokens se resuelven y lo que no es token se deja igual', () => {
  assert.equal(resolveToken('token:color.primary', DEFAULT_TOKENS), '#8b5cf6');
  assert.equal(resolveToken('token:no.existe', DEFAULT_TOKENS), 'token:no.existe');
  assert.equal(resolveToken('#fff', DEFAULT_TOKENS), '#fff');
});

test('las unidades se parsean y se reconstruyen', () => {
  assert.deepEqual(parseLength('24px'), { value: 24, unit: 'px' });
  assert.deepEqual(parseLength('50%'), { value: 50, unit: '%' });
  assert.deepEqual(parseLength('1.5rem'), { value: 1.5, unit: 'rem' });
  assert.deepEqual(parseLength('auto'), { value: 0, unit: 'auto' });
  assert.deepEqual(parseLength(12), { value: 12, unit: 'px' });
  assert.equal(parseLength('token:spacing.md'), null, 'un token no es una longitud');
  assert.equal(formatLength({ value: 8, unit: 'vh' }), '8vh');
  assert.equal(formatLength({ value: 0, unit: 'auto' }), 'auto');
});

/* ----------------------------------------------- contratos de la interfaz --- */

test('el editor no depende solo del arrastre: las capas traen botones', async () => {
  const layers = await source('src/components/editor/layers-panel.tsx');
  for (const accion of ['Ocultar', 'Bloquear']) {
    assert.ok(layers.includes(accion), `el panel de capas debe ofrecer «${accion}» con botón`);
  }
  assert.match(layers, /aria-expanded/, 'el árbol debe anunciar su estado');
  const palette = await source('src/components/editor/components-panel.tsx');
  assert.match(palette, /onClick=\{\(\) => insert\(definition\.type\)\}/, 'la paleta debe insertar al pulsar, no solo al arrastrar');
});

test('la API del editor exige cuenta y plan en los tres verbos', async () => {
  const route = await source('src/app/api/editor/projects/route.ts');
  assert.match(route, /async function guard\(\)/, 'una sola puerta para los tres verbos');
  assert.match(route, /status: 401/, 'sin sesión');
  assert.match(route, /hasComponentBuilderPlan\(status\)/, 'y con plan');
  assert.match(route, /status: 403/);
  for (const verbo of ['GET', 'PUT', 'DELETE']) {
    assert.match(route, new RegExp(`export async function ${verbo}[\\s\\S]{0,200}await guard\\(\\)`), `${verbo} debe pasar por la puerta`);
  }
  assert.match(route, /userId: gate\.userId/, 'las consultas filtran por usuario');
  assert.match(route, /maxNodes/, 'el documento entrante se acota');
});

test('el autoguardado va con debounce y no miente sobre su estado', async () => {
  const hook = await source('src/hooks/use-editor-autosave.ts');
  assert.match(hook, /DEBOUNCE_MS = \d+/, 'debe agrupar los cambios');
  assert.match(hook, /keepalive: true/, 'al cerrar la pestaña debe salir');
  assert.match(hook, /save: 'saving'/);
  assert.match(hook, /save: 'error'/, 'un fallo no puede mostrarse como guardado');
});

test('el editor se carga de forma perezosa desde el constructor', async () => {
  const client = await source('src/app/[locale]/component-builder/component-builder-client.tsx');
  assert.match(client, /dynamic\(\s*\(\) => import\('@\/components\/editor\/editor-workspace'\)/, 'no debe pesar en los otros modos');
  assert.match(client, /mode === "editor"/, 'debe existir el tercer modo');
  assert.match(client, /"template" \| "compose" \| "editor"/);
});
