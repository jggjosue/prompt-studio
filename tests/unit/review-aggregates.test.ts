import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('sin reseñas no se emite ninguna valoración', async () => {
  const { getReviewAggregate, buildAggregateRatingSchema } = await import('../../src/lib/review-aggregates.ts');
  // Marcar una valoración inexistente es spam estructurado y puede costar el
  // dominio entero. Es la regla que no se puede romper nunca.
  assert.equal(getReviewAggregate('producto-que-no-existe'), null);
  assert.equal(buildAggregateRatingSchema('producto-que-no-existe'), null);
});

test('se rechazan agregados corruptos en lugar de marcarlos', async () => {
  const lib = await source('src/lib/review-aggregates.ts');
  // Un fichero mal generado no puede traducirse en marcado inválido.
  assert.ok(lib.includes('ratingCount < 1'), 'un recuento de cero no vale');
  assert.ok(
    lib.includes('ratingValue < 1 || ratingValue > 5'),
    'una nota fuera de 1..5 debe descartarse'
  );
  assert.ok(lib.includes('Number.isFinite'), 'hay que protegerse de NaN e Infinity');
});

test('el fichero de agregados existe y tiene la forma esperada', async () => {
  const raw = JSON.parse(await source('src/data/review-aggregates.json')) as {
    generatedAt: string | null;
    products: Record<string, { ratingValue: number; ratingCount: number }>;
  };
  assert.ok('products' in raw, 'falta la clave products');
  assert.equal(typeof raw.products, 'object');
  for (const [id, entry] of Object.entries(raw.products)) {
    assert.ok(entry.ratingCount >= 1, `${id} no puede tener cero reseñas`);
    assert.ok(entry.ratingValue >= 1 && entry.ratingValue <= 5, `${id} tiene una nota imposible`);
  }
});

test('el generador solo cuenta reseñas publicadas', async () => {
  const script = await source('scripts/mjs/build-review-aggregates.mjs');
  // Lo retenido por moderación no puede mover la nota pública: un spammer
  // subiría la media mientras espera revisión.
  assert.ok(script.includes("$match: { status: 'published' }"), 'debe filtrar por publicadas');
  // Una sola consulta agrupada: 830 fichas no pueden consultar una cada una.
  assert.ok(script.includes('$group'), 'debe agrupar en la base, no por página');
});

test('el build no depende de la base de datos', async () => {
  const script = await source('scripts/mjs/build-review-aggregates.mjs');
  // Sin esto, un build en CI sin acceso a Mongo tumbaría las 830 páginas.
  assert.ok(script.includes('Fichero vacío') || script.includes('fichero vacío'), 'debe degradar a fichero vacío');
  assert.equal(
    (script.match(/products: \{\} \}/g) ?? []).length >= 2,
    true,
    'los caminos de fallo deben escribir un fichero válido y vacío'
  );
});

test('la nota marcada también se renderiza en el HTML', async () => {
  const page = await source('src/app/[locale]/landing-pages/[slug]/page.tsx');
  const component = await source('src/components/product-reviews.tsx');
  // Google exige que la valoración del marcado sea visible en la página. Si el
  // resumen solo apareciera tras hidratar, el marcado prometería algo que el
  // rastreador puede no ver.
  assert.ok(page.includes('initialSummary='), 'la ficha debe pasar el resumen calculado en servidor');
  assert.ok(component.includes('initialSummary'), 'el componente debe aceptarlo como estado inicial');
  assert.ok(page.includes('...(aggregateRating ? { aggregateRating } : {})'), 'el marcado debe ser condicional');
});

test('el generador corre antes de cada build', async () => {
  const pkg = JSON.parse(await source('package.json')) as { scripts: Record<string, string> };
  assert.match(pkg.scripts.prebuild, /reviews:aggregates/, 'prebuild debe regenerar los agregados');
  assert.ok(pkg.scripts['reviews:aggregates'], 'debe existir la orden suelta para regenerarlos');
});
