import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import {
  buildAuthorName,
  isValidRating,
  normalizeReviewComment,
  REVIEW_COMMENT_MAX,
  REVIEW_COMMENT_MIN,
  screenReviewText,
} from '../../src/lib/review-moderation.ts';

const source = (file: string) => readFile(new URL(`../../${file}`, import.meta.url), 'utf8');

test('una reseña normal se publica sin fricción', () => {
  const screening = screenReviewText('La usé para la landing de un cliente y me ahorró un día entero de trabajo. El código venía limpio.');
  assert.equal(screening.status, 'published');
  assert.deepEqual(screening.reasons, []);
});

test('una crítica dura también se publica', () => {
  // Moderar no es filtrar opiniones negativas: si se retienen, la media miente.
  const screening = screenReviewText('No me sirvió. El diseño no se parecía a la demo y tuve que rehacer medio maquetado.');
  assert.equal(screening.status, 'published', 'una reseña negativa legítima no puede retenerse');
});

test('el spam con enlaces y contacto se retiene, no se borra', () => {
  for (const text of [
    'Muy bueno, visita https://mi-tienda-barata.example para más plantillas',
    'Escríbeme a spam@example.com y te paso plantillas gratis',
    'Contacto por WhatsApp +34 600 123 456 para plantillas',
    'Buenísimo, entra en plantillas-gratis.top y descarga',
  ]) {
    const screening = screenReviewText(text);
    assert.equal(screening.status, 'pending', `debería retenerse: ${text}`);
    assert.ok(screening.reasons.length > 0, 'el moderador necesita saber por qué se retuvo');
  }
});

test('el relleno para alcanzar el mínimo se retiene', () => {
  assert.equal(screenReviewText('aaaaaaaaaaaaaaaaaaaaaaa').status, 'pending');
  assert.equal(screenReviewText('MUY BUENO ESTO ES EXCELENTE COMPRADLO YA SIN DUDARLO').status, 'pending');
  const repetitive = Array.from({ length: 25 }, () => 'bueno').join(' ');
  assert.equal(screenReviewText(repetitive).status, 'pending');
});

test('la puntuación solo admite enteros de 1 a 5', () => {
  for (const value of [1, 3, 5]) assert.equal(isValidRating(value), true, `${value} debería valer`);
  for (const value of [0, 6, -1, 4.5, '5', null, undefined, NaN]) {
    assert.equal(isValidRating(value), false, `${JSON.stringify(value)} no debería valer`);
  }
});

test('el comentario se normaliza y se recorta', () => {
  assert.equal(normalizeReviewComment('  hola   \n  mundo  '), 'hola mundo');
  assert.equal(normalizeReviewComment(123), '');
  assert.equal(normalizeReviewComment(null), '');
  assert.equal(normalizeReviewComment('x'.repeat(5000)).length, REVIEW_COMMENT_MAX);
  assert.ok(REVIEW_COMMENT_MIN > 0 && REVIEW_COMMENT_MIN < REVIEW_COMMENT_MAX);
});

test('el nombre público no expone el apellido ni el correo', () => {
  assert.equal(buildAuthorName('Ana', 'Gutiérrez'), 'Ana G.');
  assert.equal(buildAuthorName('Ana', null), 'Ana');
  // Sin nombre se usa un genérico: el identificador de cuenta es dato interno.
  assert.equal(buildAuthorName(null, null), 'Cliente verificado');
  assert.equal(buildAuthorName('', 'Gutiérrez'), 'Cliente verificado');
  for (const name of [buildAuthorName('Ana', 'Gutiérrez'), buildAuthorName(null, null)]) {
    assert.ok(!name.includes('@'), 'el nombre público nunca puede contener un correo');
  }
});

test('solo reseña quien tiene el producto, y el distintivo exige compra', async () => {
  const service = await source('src/lib/product-reviews.ts');
  // Un plan con descarga da acceso legítimo, pero no hay pago por este artículo:
  // afirmar «compra verificada» ahí sería falso.
  assert.ok(service.includes("reason: 'plan'"), 'el acceso por plan debe distinguirse de la compra');
  assert.ok(
    /if \(hasDownloadPlan\(subscription\)\) return \{ canReview: true, verifiedPurchase: false/.test(service),
    'el acceso por plan no puede marcar compra verificada'
  );
  assert.ok(
    service.includes("return { canReview: false, verifiedPurchase: false, reason: 'not-acquired' }"),
    'quien no tiene el producto no puede reseñarlo'
  );
});

test('la media solo cuenta reseñas publicadas', async () => {
  const service = await source('src/lib/product-reviews.ts');
  // Si lo retenido contara, un spammer movería la nota mientras espera revisión.
  assert.ok(service.includes("status: 'published' as const"), 'la consulta debe filtrar por publicadas');
  assert.ok(service.includes('$match: query'), 'la agregación debe usar el mismo filtro que el listado');
});

test('una reseña por usuario y producto', async () => {
  const model = await source('src/models/ProductReview.ts');
  assert.ok(
    model.includes('index({ productId: 1, userId: 1 }, { unique: true })'),
    'sin índice único, un doble envío duplicaría la reseña y falsearía la media'
  );
  assert.ok(/enum: \['published', 'pending', 'rejected'\]/.test(model), 'hace falta un estado intermedio para moderar');
  assert.ok(/rating: \{ type: Number, required: true, min: 1, max: 5 \}/.test(model), 'la puntuación debe acotarse también en base de datos');
});

test('la ruta pública exige compra y limita el ritmo', async () => {
  const route = await source('src/app/api/product-reviews/route.ts');
  assert.ok(route.includes('getReviewEligibility('), 'la ruta debe comprobar la adquisición');
  assert.ok(route.includes('status: 403'), 'quien no tiene el producto recibe 403');
  assert.ok(route.includes('rateLimit('), 'hace falta límite de peticiones');
  assert.ok(route.includes('screenReviewText(comment)'), 'el texto debe pasar por el cribado');
});

test('lo cacheable y lo personalizado viven en rutas distintas', async () => {
  const publicRoute = await source('src/app/api/product-reviews/route.ts');
  const meRoute = await source('src/app/api/product-reviews/me/route.ts');
  // Si la misma URL devolviera a veces datos del usuario, el primero en pedirla
  // sin sesión dejaría cacheada una versión sin formulario para los compradores.
  assert.ok(!publicRoute.includes('getOwnReview('), 'la ruta cacheable no puede devolver datos del usuario');
  // Aislar el cuerpo del GET: el POST sí usa la sesión, y es correcto.
  const getBody = publicRoute.slice(publicRoute.indexOf('export async function GET'), publicRoute.indexOf('export async function POST'));
  assert.ok(!getBody.includes('await auth()'), 'el GET público no debe mirar la sesión');
  assert.ok(meRoute.includes("cacheHeaders('private-no-store')"), 'la ruta personalizada nunca se cachea');
  assert.ok(meRoute.includes('await auth()') && meRoute.includes('status: 401'), 'la ruta personalizada exige sesión');
});

test('la cola de moderación es solo para administración', async () => {
  const route = await source('src/app/api/admin/product-reviews/route.ts');
  assert.ok(route.includes('requireAdmin()'), 'ambos métodos deben pasar por la comprobación de administrador');
  assert.equal((route.match(/const admin = await requireAdmin\(\);/g) ?? []).length, 2, 'GET y PATCH deben comprobarlo');
  assert.ok(route.includes("status: 403"), 'un usuario normal recibe 403');
  // Rechazar conserva la fila: una decisión de moderación puede revisarse.
  assert.ok(!route.includes('deleteOne') && !route.includes('deleteMany'), 'moderar no puede borrar reseñas');
});

test('las reseñas se pintan en cliente para no congelarse en el build', async () => {
  const component = await source('src/components/product-reviews.tsx');
  assert.ok(component.startsWith("'use client'"), 'debe ser componente de cliente');
  const page = await source('src/app/[locale]/landing-pages/[slug]/page.tsx');
  // La ficha es estática: si las reseñas se resolvieran en servidor, quedarían
  // congeladas hasta el siguiente despliegue.
  assert.ok(page.includes('export const dynamicParams = false'), 'la ficha sigue siendo estática');
  assert.ok(page.includes('<ProductReviews'), 'la ficha debe montar las reseñas');
});
