import assert from 'node:assert/strict';
import test from 'node:test';
import { EditorHistory, makeCommand } from '../../src/lib/editor/editor-commands.ts';
import { createLandingSchema, type SiteSchema } from '../../src/lib/editor/page-schema.ts';

function schema(): SiteSchema {
  return structuredClone(createLandingSchema());
}

test('makeCommand: captura tipo, descripción y las instantáneas antes/después', () => {
  const before = schema();
  const after = schema();
  after.pages[0].name = 'Cambiado';
  const command = makeCommand('UPDATE_PAGE_SETTINGS', 'Renombrar página', before, after);

  assert.equal(command.type, 'UPDATE_PAGE_SETTINGS');
  assert.equal(command.description, 'Renombrar página');
  assert.equal(command.before, before);
  assert.equal(command.after, after);
});

test('EditorHistory: deshace y rehace en orden LIFO', () => {
  const history = new EditorHistory();
  const a = schema();
  const b = schema();
  const c = schema();
  history.push(makeCommand('UPDATE_PROPS', '1', a, b));
  history.push(makeCommand('UPDATE_PROPS', '2', b, c));
  assert.equal(history.canUndo, true);
  assert.equal(history.canRedo, false);

  const undo1 = history.undo();
  assert.equal(undo1?.after, c);
  assert.equal(history.canRedo, true);

  const undo2 = history.undo();
  assert.equal(undo2?.after, b);
  assert.equal(history.canUndo, false);

  const redo2 = history.redo();
  assert.equal(redo2?.after, b);
  const redo1 = history.redo();
  assert.equal(redo1?.after, c);
  assert.equal(history.canRedo, false);
});

test('EditorHistory: un comando nuevo descarta la rama de rehacer', () => {
  const history = new EditorHistory();
  const a = schema();
  const b = schema();
  const c = schema();
  history.push(makeCommand('UPDATE_PROPS', '1', a, b));
  history.push(makeCommand('UPDATE_PROPS', '2', b, c));
  history.undo();
  assert.equal(history.canRedo, true);

  const d = schema();
  history.push(makeCommand('UPDATE_PROPS', '3', b, d));
  assert.equal(history.canRedo, false);
  assert.equal(history.undoCount, 2);
});

test('EditorHistory: respeta el límite de comandos', () => {
  const history = new EditorHistory(2);
  let current = schema();
  for (let index = 0; index < 5; index += 1) {
    const next = schema();
    history.push(makeCommand('UPDATE_PROPS', String(index), current, next));
    current = next;
  }
  assert.equal(history.undoCount, 2);
});