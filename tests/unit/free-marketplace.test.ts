import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const repo = join(process.cwd(), 'src');

const read = (rel: string) =>
  readFileSync(join(repo, rel), 'utf8').replace(/\s+/g, ' ');

test('el gate de correo no decide con localStorage sino con el servidor', () => {
  const gate = read('components/free-email-gate.tsx');
  assert.ok(!gate.includes('localStorage'), 'no debe leer/escribir localStorage');
  assert.ok(gate.includes('/api/new-users/status'), 'pregunta al servidor si ya registró');
  assert.ok(gate.includes('setHasSavedEmail'), 'guarda el estado del servidor');
});

test('el gate solo concede acceso si el servidor confirmó el guardado', () => {
  const gate = read('components/free-email-gate.tsx');
  assert.ok(gate.includes('if (!res.ok)'), 'aborta cuando el guardado falla');
  assert.ok(gate.includes('setHasSavedEmail(true)'), 'confirma el acceso tras el OK');
});

test('el registro persiste en la BD y emite cookie httpOnly, no un marcador local', () => {
  const route = read('app/api/new-users/route.ts');
  assert.ok(route.includes('crypto.randomUUID()'), 'genera el token opaco del visitante');
  assert.ok(route.includes('visitorToken'), 'persiste el token en la BD');
  assert.ok(route.includes('freeAccessCookieOptions'), 'emite cookie con opciones guardadas');
});

test('el status pregunta contra la BD (cookie o correo de Clerk)', () => {
  const lib = read('lib/free-access.ts');
  assert.ok(lib.includes('NewUser.findOne'), 'busca el registro en la base');
  assert.ok(lib.includes('request.cookies.get'), 'lee la cookie del navegador');
  assert.ok(lib.includes('clerkClient'), 'verifica también con la sesión de Clerk');
});

test('el marketplace admite productos gratuitos con gate de correo', () => {
  const model = read('models/MarketplaceListing.ts');
  assert.ok(model.includes('min:0'), 'permite precio cero');
  const creator = read('app/api/creator/listings/route.ts');
  assert.ok(creator.includes('priceCents<0'), 'valida precio desde cero');
});

test('la descarga de un producto gratuito exige el registro, sin compra', () => {
  const route = read('app/api/marketplace/[id]/download/route.ts');
  assert.ok(route.includes('listing.priceCents === 0'), 'distingue el producto gratuito');
  assert.ok(route.includes('freeAccessGranted'), 'pide el registro de correo verificado');
  assert.ok(route.includes('purchaserUserId'), 'conserva el camino de pago');
  assert.ok(/status\s*:\s*'paid'/.test(route), 'conserva la verificación de compra');
});

test('ver el prompt de un producto gratuito también pasa por el registro', () => {
  const route = read('app/api/marketplace/[id]/prompt/route.ts');
  assert.ok(route.includes('freeAccessGranted'), 'gobierna el acceso a ver el prompt');
  assert.ok(route.includes('Registra tu correo'), 'informa del motivo al rechazar');
});

test('en el escaparate, gratis muestra Ver prompt y Descargar en vez de compra', () => {
  const client = read('app/[locale]/marketplace/marketplace-client.tsx');
  assert.ok(client.includes('MarketplaceFreeActions'), 'usa las acciones gratuitas');
  assert.ok(client.includes('priceCents===0'), 'elige el componente por el precio');
  assert.ok(client.includes("'Gratis'"), 'etiqueta el precio cero como Gratis');
});