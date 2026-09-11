import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');
const TOOLS = ['code-auditor', 'smart-search', 'prompt-optimizer', 'ask'] as const;

test('las herramientas gratuitas están en el sitemap', async () => {
  const sitemap = await source('src/app/sitemap.ts');
  // Verificado con la app en marcha: las cuatro responden 200 y ninguna estaba
  // listada. Si Google no sabe que la página existe, nada más importa.
  for (const tool of TOOLS) {
    assert.ok(sitemap.includes(`'/${tool}'`), `/${tool} debe estar en el sitemap`);
  }
});

test('cada herramienta declara su propia metadata y canónica', async () => {
  for (const tool of TOOLS) {
    const page = await source(`src/app/[locale]/${tool}/page.tsx`);
    assert.ok(/title:/.test(page), `/${tool} necesita título propio`);
    assert.ok(/description:/.test(page), `/${tool} necesita descripción`);
    // Sin canónica, la página compite consigo misma si llega con parámetros.
    // El espacio tras los dos puntos varía: algunos ficheros están minificados.
    assert.ok(
      new RegExp(`canonical:\\s*'/${tool}'`).test(page),
      `/${tool} necesita canónica propia`
    );
  }
});

test('/ask ya no hereda el título de la portada', async () => {
  const page = await source('src/app/[locale]/ask/page.tsx');
  // Antes no declaraba metadata: heredaba el título del layout raíz y competía
  // con la portada por la misma cadena de búsqueda.
  assert.ok(page.includes('export const metadata'), '/ask debe declarar metadata');
  const home = await source('src/app/[locale]/layout.tsx');
  const askTitle = page.match(/title:\s*'([^']+)'/)?.[1];
  const homeTitle = home.match(/title:\s*'([^']+)'/)?.[1];
  assert.ok(askTitle, 'no se pudo leer el título de /ask');
  assert.notEqual(askTitle, homeTitle, 'el título de /ask no puede ser el de la portada');
});

test('las tres herramientas encaminan al catálogo', async () => {
  // Una herramienta que atrae tráfico y no enlaza al producto está
  // desperdiciada: `code-auditor` no tenía ni un enlace al catálogo.
  for (const tool of ['code-auditor', 'smart-search', 'prompt-optimizer']) {
    const page = await source(`src/app/[locale]/${tool}/page.tsx`);
    assert.ok(page.includes('FreeToolCta'), `/${tool} debe encaminar al catálogo`);
  }
});

test('el CTA va detrás de la herramienta, no delante', async () => {
  for (const tool of ['code-auditor', 'smart-search', 'prompt-optimizer']) {
    const page = await source(`src/app/[locale]/${tool}/page.tsx`);
    const clientAt = page.search(/<[A-Z][A-Za-z]*Client/);
    const ctaAt = page.indexOf('<FreeToolCta');
    assert.ok(clientAt > -1 && ctaAt > -1, `no se localizan los componentes en /${tool}`);
    // Un muro delante destruiría lo que hace que estas páginas atraigan enlaces.
    assert.ok(clientAt < ctaAt, `en /${tool} el CTA debe ir después de la herramienta`);
  }
});

test('el CTA no bloquea el uso de la herramienta', async () => {
  const cta = await source('src/components/free-tool-cta.tsx');
  assert.ok(!cta.includes('FreeEmailGate'), 'el CTA no puede exigir correo para usar la herramienta');
  assert.ok(!cta.includes('Dialog'), 'no debe abrir ningún modal');
  assert.ok(cta.includes("href={destination}") || cta.includes('/prompts'), 'debe enlazar al catálogo');
});

test('los textos del CTA existen en los dos idiomas', async () => {
  for (const locale of ['es', 'en']) {
    const messages = JSON.parse(await source(`messages/${locale}.json`)) as { freeTools?: Record<string, string> };
    for (const key of ['ctaTitle', 'ctaDescription', 'ctaPrimary', 'ctaSecondary']) {
      assert.ok(messages.freeTools?.[key], `falta freeTools.${key} en ${locale}`);
    }
  }
});
