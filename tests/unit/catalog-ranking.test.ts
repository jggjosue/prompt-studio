import assert from 'node:assert/strict';
import test from 'node:test';
import { catalogRankingScore, isCatalogContentKey, rankCatalogItems } from '../../src/lib/catalog-ranking.ts';
import { readFile } from 'node:fs/promises';

const metric = (contentKey: string, values: Partial<Parameters<typeof catalogRankingScore>[0]> = {}) => ({
  contentKey, views: 0, clicks: 0, likes: 0, rating: 0, ratingCount: 0, ...values,
});

test('prioriza calidad y engagement con muestras suficientes', () => {
  const weak = metric('image:weak', { views: 1000, clicks: 20, likes: 5, rating: 2, ratingCount: 30 });
  const strong = metric('image:strong', { views: 500, clicks: 100, likes: 80, rating: 4.8, ratingCount: 30 });
  assert.ok(catalogRankingScore(strong, 1000) > catalogRankingScore(weak, 1000));
});

test('una única interacción no domina por encima de evidencia consistente', () => {
  const oneVisit = metric('image:new', { views: 1, clicks: 1, likes: 1, rating: 5, ratingCount: 1 });
  const proven = metric('image:proven', { views: 300, clicks: 75, likes: 45, rating: 4.6, ratingCount: 25 });
  assert.ok(catalogRankingScore(proven, 300) > catalogRankingScore(oneVisit, 300));
});

test('conserva el orden editorial cuando no existen métricas', () => {
  const items = [{ contentKey: 'image:b', editorialIndex: 1 }, { contentKey: 'image:a', editorialIndex: 0 }];
  assert.deepEqual(rankCatalogItems(items, new Map()).map(item => item.contentKey), ['image:a', 'image:b']);
});

test('valida claves canónicas y rechaza rutas o parámetros', () => {
  assert.equal(isCatalogContentKey('web:aniwave-anime-streaming'), true);
  assert.equal(isCatalogContentKey('image:img-21'), true);
  assert.equal(isCatalogContentKey('web:../secret'), false);
  assert.equal(isCatalogContentKey('web:item?x=1'), false);
});

test('la API conserva identidades privadas y evita el patrón N+1', async () => {
  const source = await readFile(new URL('../../src/app/api/catalog-engagement/route.ts', import.meta.url), 'utf8');
  assert.match(source, /CatalogLike\.find\(\{ contentKey: \{ \$in: keys \}, userId \}\)/);
  assert.match(source, /ProductReview\.aggregate/);
  assert.doesNotMatch(source, /select\(['"]contentKey userId/);
  assert.doesNotMatch(source, /NextResponse\.json\([^)]*userId/);
});
