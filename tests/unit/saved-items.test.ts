import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('la colección impide guardar dos veces el mismo recurso', async () => {
  const model = await source('src/models/SavedItem.ts');
  assert.ok(
    model.includes("index({ userId: 1, itemKind: 1, itemId: 1 }, { unique: true })"),
    'sin índice único, un doble clic crearía filas duplicadas'
  );
  // `itemId` no es único entre tipos: existen `img-2` y `wp-2`.
  assert.ok(
    /itemKind: 1, itemId: 1/.test(model),
    'la clave debe incluir itemKind o se mezclarían recursos de tipos distintos'
  );
  assert.ok(
    model.includes("index({ userId: 1, createdAt: -1 })"),
    'el listado del perfil ordena por fecha; sin índice sería un escaneo'
  );
});

test('la API exige sesión en las tres operaciones', async () => {
  const route = await source('src/app/api/saved/route.ts');
  const handlers = route.split(/export async function /).slice(1);
  assert.equal(handlers.length, 3, 'se esperaban GET, POST y DELETE');
  for (const handler of handlers) {
    const name = handler.slice(0, handler.indexOf('('));
    assert.ok(handler.includes('await auth()'), `${name} no comprueba la sesión`);
    assert.ok(handler.includes('401'), `${name} no responde 401 sin sesión`);
  }
});

test('el borrado está acotado al propietario', async () => {
  const route = await source('src/app/api/saved/route.ts');
  // Sin `userId` en el filtro, cualquiera podría borrar el guardado de otro.
  assert.ok(route.includes('deleteOne({ userId, itemKind, itemId })'));
  assert.ok(!/deleteOne\(\{\s*itemKind/.test(route));
});

test('el guardado es idempotente y no confía en el cliente', async () => {
  const route = await source('src/app/api/saved/route.ts');
  assert.ok(route.includes('upsert: true'), 'debe ser un upsert contra el índice único');
  assert.ok(route.includes('isSavedItemKind(itemKind)'), 'el tipo se valida contra la lista');
  assert.ok(route.includes('isInternalHref(href)'), 'el href se valida antes de guardarse');
});

test('solo se admiten rutas internas como href', async () => {
  // El href guardado se pinta como enlace en el perfil: admitir un destino
  // externo o un `javascript:` dejaría una inyección almacenada en la cuenta.
  const isInternalHref = (href: string) => /^\/[^/\\]/.test(href) || href === '/';

  for (const valid of ['/', '/gallery/img-2', '/landing-pages/mi-demo']) {
    assert.equal(isInternalHref(valid), true, `${valid} debería admitirse`);
  }
  for (const invalid of [
    'https://atacante.com',
    '//atacante.com',
    'javascript:alert(1)',
    '/\\atacante.com',
    '',
  ]) {
    assert.equal(isInternalHref(invalid), false, `${invalid} NO debería admitirse`);
  }
});

test('las escrituras están limitadas por usuario', async () => {
  const route = await source('src/app/api/saved/route.ts');
  assert.ok(route.includes('`saved:${userId}`'), 'la cuota se cuenta por usuario, no por IP');
  assert.ok(route.includes('tooManyRequests(quota)'));
});

test('la respuesta nunca se cachea', async () => {
  const route = await source('src/app/api/saved/route.ts');
  assert.ok(route.includes("cacheHeaders('private-no-store')"));
});

/** Quita comentarios: la documentación menciona conceptos que no son código. */
function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

test('el guardado no copia el prompt de pago', async () => {
  // Se desnormalizan título, imagen y enlace; el prompt jamás: su acceso
  // depende de la suscripción o la compra, y se comprueba al abrir la ficha.
  const model = stripComments(await source('src/models/SavedItem.ts'));
  assert.ok(!/\bprompt\b/.test(model), 'el esquema no debe tener campo prompt');

  const route = stripComments(await source('src/app/api/saved/route.ts'));
  assert.ok(!/\bprompt\b/.test(route), 'la API no debe leer ni devolver prompt');
});

test('el botón no navega al pulsarlo', async () => {
  // Las tarjetas del catálogo son enlaces; sin esto, guardar abriría la ficha.
  const button = await source('src/components/save-item-button.tsx');
  assert.ok(button.includes('event.preventDefault()'));
  assert.ok(button.includes('event.stopPropagation()'));
  assert.ok(button.includes('aria-pressed'), 'el estado debe ser accesible');
});

test('el estado de guardado no genera una petición por tarjeta', async () => {
  // Una cuadrícula tiene 24 tarjetas. Si cada una consultara su propio estado
  // serían 24 peticiones; por eso el estado vive en el proveedor y el botón
  // solo lee de contexto.
  const button = await source('src/components/save-item-button.tsx');
  assert.ok(!button.includes('fetch('), 'el botón no debe hacer peticiones propias');
  assert.ok(button.includes('useSavedItems()'), 'el botón debe leer del proveedor');

  const provider = await source('src/components/saved-items-provider.tsx');
  // Una carga al montar, y una escritura al alternar. Ninguna por tarjeta.
  assert.equal((provider.match(/fetch\('\/api\/saved'/g) ?? []).length, 2);
  assert.ok(provider.includes('useEffect('), 'la carga inicial va en un efecto');
});
