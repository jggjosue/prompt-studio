import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

/** Quita comentarios: la documentación explica el porqué, no es código. */
function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

test('las redirecciones permanentes conservan la query string', async () => {
  const proxy = stripComments(await source('src/proxy.ts'));
  // El referido de afiliado viaja en `?ref=` y en la primera visita no hay nada
  // en localStorage: una redirección que descarte la query borra la comisión.
  assert.ok(proxy.includes('function permanentRedirect('), 'debe existir el helper que preserva la query');
  assert.ok(
    proxy.includes('url.search = req.nextUrl.search'),
    'el helper debe copiar la query de la petición original'
  );
  // Solo deben quedar cuatro llamadas directas a redirect: la del prefijo de
  // idioma (que ya preserva la query), la del propio helper, y las dos
  // temporales de puertas internas, donde descartar la query es correcto.
  const calls = proxy.match(/NextResponse\.redirect\(/g) ?? [];
  assert.equal(calls.length, 4, `redirecciones directas esperadas: 4, encontradas ${calls.length}`);
  assert.ok(
    proxy.includes('new URL(`${stripped}${search}`, req.url), 308'),
    'la redirección del prefijo de idioma debe seguir preservando la query'
  );
});

test('el helper no pisa una query que traiga el destino', async () => {
  const proxy = stripComments(await source('src/proxy.ts'));
  assert.ok(proxy.includes('if (!url.search)'), 'un destino con query propia debe mantenerla');
});

test('/es/pricing llega a /prices en un solo salto', async () => {
  const proxy = stripComments(await source('src/proxy.ts'));
  // Antes: /es/pricing → 308 /pricing → 308 /prices. Dos saltos por cada
  // visitante que llegara con el prefijo de idioma.
  assert.ok(proxy.includes('function withoutLocalePrefix('), 'hace falta normalizar el prefijo de idioma');
  assert.ok(
    proxy.includes("canonicalPath === '/pricing'"),
    'la comparación debe hacerse sobre la ruta sin prefijo de idioma'
  );
});

test('ningún enlace interno apunta a la ruta redirigida', async () => {
  // Enlazar a /pricing funciona, pero cuesta un salto extra en una ruta de
  // conversión. El destino real es /prices.
  for (const file of [
    'src/components/web-page-premium-button.tsx',
    'src/app/[locale]/dashboard/page.tsx',
  ]) {
    const code = await source(file);
    assert.ok(!code.includes('href="/pricing"'), `${file} debe enlazar al destino final`);
  }
});
