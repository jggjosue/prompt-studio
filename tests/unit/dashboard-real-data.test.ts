import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
const DASHBOARD = 'src/app/[locale]/dashboard/page.tsx';

test('el saldo de créditos del dashboard es real, no una cifra de maqueta', async () => {
  const page = await source(DASHBOARD);
  // Un usuario que lee «850 créditos» no tiene ningún motivo para recargar:
  // una cifra inventada aquí anula la venta de créditos entera.
  assert.ok(!/>850</.test(page), 'el saldo no puede estar cableado en la plantilla');
  assert.ok(page.includes('getCreditBalance('), 'el saldo debe leerse de la cuenta del usuario');
  assert.ok(page.includes('credits.balance'), 'la tarjeta debe pintar el saldo consultado');
});

test('el plan mostrado es el del usuario', async () => {
  const page = await source(DASHBOARD);
  assert.ok(!/font-bold">Pro</.test(page), '«Pro» no es un plan que exista en el sistema');
  assert.ok(page.includes('getServerSubscriptionStatus()'), 'el plan debe leerse de la suscripción real');
});

test('«Buy more credits» lleva a donde se compran créditos', async () => {
  const page = await source(DASHBOARD);
  // Antes apuntaba a /pricing, que el middleware redirige a /prices: la página
  // de suscripciones. El botón prometía créditos y aterrizaba en planes.
  assert.ok(page.includes('href="/dashboard/credits"'), 'debe enlazar a la página de recarga');
  assert.ok(!page.includes('href="/pricing"'), 'no puede enlazar a la página de planes redirigida');
});

test('/pricing sigue redirigida en el middleware', async () => {
  const proxy = await source('src/proxy.ts');
  // Verificado con la app corriendo: /pricing responde 308 hacia /prices.
  // Si esta redirección desapareciera, se renderizaría una página con botones
  // sin destino y un precio anual que no coincide con el que se cobra.
  assert.ok(
    /canonicalPath === '\/pricing'/.test(proxy),
    'la redirección de /pricing debe seguir en el middleware'
  );
  assert.ok(
    proxy.includes("permanentRedirect(req, '/prices')"),
    'debe redirigir a /prices con un 308 que preserve la query'
  );
  const middleware = await source('src/middleware.ts');
  assert.ok(middleware.includes("from './proxy'"), 'middleware.ts debe seguir reexportando proxy.ts o nada de esto se aplica');
});
