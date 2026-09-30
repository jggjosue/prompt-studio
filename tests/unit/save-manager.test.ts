import assert from 'node:assert/strict';
import test from 'node:test';
import {
  PermanentSaveError,
  SaveManager,
  StaleSaveError,
  type SavePayload,
  type SaveResult,
} from '../../src/lib/editor/save-manager.ts';
import { createLandingSchema, type SiteSchema } from '../../src/lib/editor/page-schema.ts';

function schema(tag: string): SiteSchema {
  const site = createLandingSchema();
  site.site.name = tag;
  return site;
}

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function deferred() {
  let resolve!: (value: SaveResult) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<SaveResult>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

test('el debounce coalesce los cambios y guarda una sola vez, con el más reciente', async () => {
  const calls: SavePayload[] = [];
  const first = deferred();
  const manager = new SaveManager({
    debounceMs: 30,
    save: async payload => {
      calls.push(payload);
      return first.promise;
    },
  });

  manager.markDirty(schema('a'));
  manager.markDirty(schema('b'));
  manager.markDirty(schema('c'));

  await wait(10);
  assert.equal(calls.length, 0, 'el debounce aún no ha disparado');
  await wait(40);
  assert.equal(calls.length, 1, 'varios cambios = un guardado');
  assert.equal(calls[0].schema.site.name, 'c');

  first.resolve({ version: 1 });
  await wait(10);
  assert.equal(manager.getStatus(), 'clean');
  assert.equal(calls.length, 1);
});

test('un documento sin cambios no genera guardados', async () => {
  let saves = 0;
  const manager = new SaveManager({
    debounceMs: 10,
    save: async () => {
      saves += 1;
      return { version: 1 };
    },
  });

  await wait(40);
  assert.equal(saves, 0);
  assert.equal(manager.getStatus(), 'clean');
});

test('los cambios durante el guardado se coalescen sin peticiones paralelas', async () => {
  const calls: SavePayload[] = [];
  const pending: Array<ReturnType<typeof deferred>> = [];
  const manager = new SaveManager({
    debounceMs: 10,
    save: async payload => {
      calls.push(payload);
      const d = deferred();
      pending.push(d);
      return d.promise;
    },
  });

  manager.markDirty(schema('a'));
  await wait(15);
  assert.equal(calls.length, 1, 'el primer guardado está en vuelo');

  manager.markDirty(schema('b'));
  manager.markDirty(schema('c'));

  pending[0].resolve({ version: 1 });
  await wait(15);
  assert.equal(calls.length, 2, 'solo un guardado de seguimiento');
  assert.equal(calls[1].schema.site.name, 'c', 'se guarda lo más reciente');

  pending[1].resolve({ version: 2 });
  await wait(10);
  assert.equal(manager.getStatus(), 'clean');
  assert.equal(calls.length, 2);
});

test('un fallo transitorio marca error, reintenta con espera y vuelve a clean', async () => {
  const calls: SavePayload[] = [];
  let attempts = 0;
  const manager = new SaveManager({
    debounceMs: 10,
    retryMs: 20,
    save: async payload => {
      calls.push(payload);
      attempts += 1;
      if (attempts === 1) throw new Error('red caída');
      return { version: 1 };
    },
  });

  manager.markDirty(schema('a'));
  await wait(15);
  assert.equal(manager.getStatus(), 'error');

  await wait(50);
  assert.equal(manager.getStatus(), 'clean');
  assert.equal(attempts, 2);
  assert.equal(calls.length, 2);
});

test('un 409 (stale) marca error y no reintenta en bucle ni pierde el borrador', async () => {
  const calls: SavePayload[] = [];
  const manager = new SaveManager({
    debounceMs: 10,
    save: async payload => {
      calls.push(payload);
      throw new StaleSaveError();
    },
  });

  manager.markDirty(schema('a'));
  await wait(60);
  assert.equal(manager.getStatus(), 'error');
  assert.equal(manager.getFailure(), 'stale');
  assert.equal(calls.length, 1, 'no se reintenta solo un guardado obsoleto');
  assert.equal(manager.isDirty, true, 'el borrador sigue pendiente, no se pierde');
});

test('un fallo permanente marca error sin generar solicitudes duplicadas', async () => {
  let attempts = 0;
  const manager = new SaveManager({
    debounceMs: 10,
    retryMs: 10,
    save: async () => {
      attempts += 1;
      throw new PermanentSaveError('401');
    },
  });

  manager.markDirty(schema('requiere-login'));
  await wait(60);

  assert.equal(manager.getStatus(), 'error');
  assert.equal(manager.getFailure(), 'failed');
  assert.equal(manager.isDirty, true, 'el borrador permanece protegido en memoria');
  assert.equal(attempts, 1, 'un rechazo permanente no se reintenta en bucle');
});

test('el estado refleja saving, dirty y clean a lo largo del ciclo', async () => {
  const pending: Array<ReturnType<typeof deferred>> = [];
  const manager = new SaveManager({
    debounceMs: 10,
    save: async () => {
      const d = deferred();
      pending.push(d);
      return d.promise;
    },
  });

  manager.markDirty(schema('a'));
  await wait(15);
  assert.equal(manager.getStatus(), 'saving');

  manager.markDirty(schema('b'));
  assert.equal(manager.getStatus(), 'dirty');

  pending[0].resolve({ version: 1 });
  await wait(15);
  assert.equal(manager.getStatus(), 'saving', 'se agenda el seguimiento');

  pending[1].resolve({ version: 2 });
  await wait(10);
  assert.equal(manager.getStatus(), 'clean');
});
