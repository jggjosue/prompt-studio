import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { detectLocale, localeFromCookieHeader } from '../../src/i18n/detect-locale.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
const headers = (init: Record<string, string>) => new Headers(init);

test('la cookie de idioma manda sobre cualquier otra señal', () => {
  // Si alguien eligió idioma con el selector, ni su navegador ni su IP deben contradecirle.
  assert.equal(
    detectLocale(headers({
      cookie: 'locale=en',
      'accept-language': 'es-ES,es;q=0.9',
      'x-vercel-ip-country': 'MX',
    })),
    'en'
  );
  assert.equal(
    detectLocale(headers({ cookie: 'locale=es', 'accept-language': 'en-US' })),
    'es'
  );
});

test('sin cookie, decide el idioma del navegador', () => {
  assert.equal(detectLocale(headers({ 'accept-language': 'es-MX,es;q=0.9' })), 'es');
  assert.equal(detectLocale(headers({ 'accept-language': 'en-GB,en;q=0.9' })), 'en');
});

test('sin cookie ni idioma reconocible, decide el país del edge', () => {
  for (const country of ['MX', 'AR', 'ES', 'CO']) {
    assert.equal(
      detectLocale(headers({ 'accept-language': 'fr-FR', 'x-vercel-ip-country': country })),
      'es',
      `${country} debería resolver a español`
    );
  }
  assert.equal(
    detectLocale(headers({ 'accept-language': 'fr-FR', 'x-vercel-ip-country': 'FR' })),
    'en'
  );
  // Respaldo cuando el edge de Vercel no expone el país.
  assert.equal(
    detectLocale(headers({ 'accept-language': 'fr-FR', 'x-edge-country': 'PE' })),
    'es'
  );
});

test('sin ninguna señal cae al idioma por defecto', () => {
  assert.equal(detectLocale(headers({})), 'en');
});

test('una cookie con valor inválido se ignora en vez de romper', () => {
  assert.equal(localeFromCookieHeader('locale=klingon'), null);
  assert.equal(localeFromCookieHeader(null), null);
  assert.equal(localeFromCookieHeader('otra=cosa; locale=es; mas=1'), 'es');
  // Un idioma inexistente no debe colarse: se sigue detectando por lo demás.
  assert.equal(
    detectLocale(headers({ cookie: 'locale=xx', 'accept-language': 'es' })),
    'es'
  );
});

test('el middleware reescribe sin exponer el idioma en la URL', async () => {
  const proxy = await source('src/proxy.ts');
  assert.ok(proxy.includes('NextResponse.rewrite'), 'debe reescribir, no redirigir');
  assert.ok(
    !/NextResponse\.redirect\(new URL\(`\/\$\{locale\}/.test(proxy),
    'una redirección cambiaría la URL pública y rompería el SEO existente'
  );
  assert.ok(proxy.includes('detectLocale(req.headers)'));
});

test('las rutas no localizables quedan fuera de la reescritura', async () => {
  const proxy = await source('src/proxy.ts');
  for (const skipped of ['/api/', '/__clerk', '/webpages/', '/robots.txt', '/sitemap.xml']) {
    assert.ok(proxy.includes(`'${skipped}'`), `falta excluir ${skipped}`);
  }
});

/** Quita comentarios para no confundir la documentación con el código real. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

test('request.ts ya no lee cookies ni headers durante el render', async () => {
  const code = stripComments(await source('src/i18n/request.ts'));
  // Esas dos llamadas eran el motivo de que las 121 rutas fueran dinámicas.
  assert.ok(!code.includes("from 'next/headers'"));
  assert.ok(!code.includes('cookies()'));
  assert.ok(!code.includes('headers()'));
  assert.ok(code.includes('requestLocale'));
});

test('el layout habilita el render estático y valida el idioma', async () => {
  const layout = await source('src/app/[locale]/layout.tsx');
  assert.ok(layout.includes('setRequestLocale(locale)'), 'sin esto la página vuelve a ser dinámica');
  assert.ok(layout.includes('generateStaticParams'));
  assert.ok(layout.includes('notFound()'), 'un idioma inexistente debe ser 404');
  assert.ok(layout.includes('lang={locale}'));
});

test('las rutas por usuario están marcadas como dinámicas', async () => {
  for (const route of [
    'src/app/[locale]/dashboard/layout.tsx',
    'src/app/[locale]/admin/affiliate-sales/page.tsx',
    'src/app/[locale]/my-components/page.tsx',
    'src/app/[locale]/checkout/mini/page.tsx',
  ]) {
    const value = await source(route);
    assert.ok(
      value.includes("export const dynamic = 'force-dynamic'"),
      `${route} podría prerenderizarse con datos de un usuario`
    );
  }
});
