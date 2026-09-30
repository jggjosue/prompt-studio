import assert from 'node:assert/strict';
import test from 'node:test';
import {
  bindUnloadSave,
  canUseKeepalive,
  payloadBytes,
  KEEPALIVE_MAX_BYTES,
} from '../../src/lib/editor/save-manager.ts';

type Listener = (event: { preventDefault?: () => void }) => void;

/** Contenedor de listeners, sin `document` anidado. */
function fakeEventHost(visibilityState = 'visible') {
  const listeners = new Map<string, Set<Listener>>();
  return {
    visibilityState,
    addEventListener(type: string, listener: Listener) {
      const set = listeners.get(type) ?? new Set<Listener>();
      set.add(listener);
      listeners.set(type, set);
    },
    removeEventListener(type: string, listener: Listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type: string) {
      let prevented = false;
      const event = { preventDefault: () => { prevented = true; } };
      for (const listener of listeners.get(type) ?? []) listener(event);
      return { prevented };
    },
    count: (type: string) => listeners.get(type)?.size ?? 0,
  };
}

/** `window` con su `document`; la visibilidad es la misma para los dos. */
function fakeHost() {
  const win = fakeEventHost();
  const doc = fakeEventHost();
  Object.defineProperty(doc, 'visibilityState', { get: () => win.visibilityState });
  return Object.assign(win, { document: doc });
}

/* ------------------------------------------------------ keepalive por tamaño --- */

test('keepalive: un cuerpo pequeño lo admite', () => {
  assert.equal(canUseKeepalive('{"schema":{}}'), true);
});

test('keepalive: el tope se mide en bytes, no en caracteres', () => {
  // 'ó' son 2 bytes en UTF-8 pero 1 carácter: con length el cuerpo parecería
  // la mitad de grande y el navegador rechazaría la petición.
  const body = 'ó'.repeat(KEEPALIVE_MAX_BYTES);
  assert.equal(body.length, KEEPALIVE_MAX_BYTES);
  assert.equal(payloadBytes(body), KEEPALIVE_MAX_BYTES * 2);
  assert.equal(canUseKeepalive(body), false);
});

test('keepalive: un emoji de 4 bytes no se cuenta como uno', () => {
  assert.equal('😀'.length, 2); // par surrogado
  assert.equal(payloadBytes('😀'), 4);
  assert.equal(canUseKeepalive('x'.repeat(KEEPALIVE_MAX_BYTES - 2) + '😀'), false);
});

test('keepalive: el cuerpo justo en el límite entra y uno más ya no', () => {
  assert.equal(canUseKeepalive('x'.repeat(KEEPALIVE_MAX_BYTES)), true);
  assert.equal(canUseKeepalive('x'.repeat(KEEPALIVE_MAX_BYTES + 1)), false);
});

/* --------------------------------------------------------- ciclo de salida --- */

test('salida: pagehide fuerza el guardado', () => {
  const host = fakeHost();
  let flushed = 0;
  bindUnloadSave(host, { flush: () => { flushed += 1; }, isDirty: () => true });

  host.dispatch('pagehide');
  assert.equal(flushed, 1);
});

test('salida: cambiar a segundo plano también fuerza el guardado', () => {
  const host = fakeHost();
  let flushed = 0;
  bindUnloadSave(host, { flush: () => { flushed += 1; }, isDirty: () => true });

  // Visible → visible no debe guardar.
  host.document.dispatch('visibilitychange');
  assert.equal(flushed, 0);

  host.visibilityState = 'hidden';
  host.document.dispatch('visibilitychange');
  assert.equal(flushed, 1);
});

test('salida: el aviso solo se dispara si queda algo sin guardar', () => {
  const host = fakeHost();
  bindUnloadSave(host, { flush: () => {}, isDirty: () => true });
  assert.equal(host.dispatch('beforeunload').prevented, true, 'con cambios debe avisar');

  const clean = fakeHost();
  bindUnloadSave(clean, { flush: () => {}, isDirty: () => false });
  assert.equal(clean.dispatch('beforeunload').prevented, false, 'sin cambios no molesta');
});

test('salida: pagehide guarda aunque no haya cambios pendientes', () => {
  // `flush` es idempotente: si no hay nada pendiente no hace nada. Lo que
  // importa es que el evento llegue, no que el estado sea dirty.
  const host = fakeHost();
  let flushed = 0;
  bindUnloadSave(host, { flush: () => { flushed += 1; }, isDirty: () => false });
  host.dispatch('pagehide');
  assert.equal(flushed, 1);
});

test('salida: la limpieza quita los tres listeners', () => {
  const host = fakeHost();
  let flushed = 0;
  const unbind = bindUnloadSave(host, { flush: () => { flushed += 1; }, isDirty: () => true });
  assert.equal(host.count('pagehide'), 1);
  assert.equal(host.count('beforeunload'), 1);
  assert.equal(host.document.count('visibilitychange'), 1);

  unbind();

  assert.equal(host.count('pagehide'), 0);
  assert.equal(host.count('beforeunload'), 0);
  assert.equal(host.document.count('visibilitychange'), 0);

  // Tras limpiar, nada responde ya en ese host.
  host.dispatch('pagehide');
  host.document.dispatch('visibilitychange');
  assert.equal(flushed, 0);
  assert.equal(host.dispatch('beforeunload').prevented, false);
});

test('salida: funciona sin `document` disponible', () => {
  // Un host sin `document` no debe romperse al enlazar.
  const bare = {
    addEventListener() {},
    removeEventListener() {},
    document: undefined,
  };
  assert.doesNotThrow(() => bindUnloadSave(bare, { flush: () => {}, isDirty: () => false }));
});
