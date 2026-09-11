import assert from 'node:assert/strict';
import test from 'node:test';
import {
  FEED_PAGE_SIZE,
  HOME_FEED_LIMITS,
  INITIAL_FEED_ITEMS,
  initialFeedItemCount,
  interleaveFeedGroups,
  nextFeedItemCount,
} from '../../src/lib/progressive-feed.ts';

test('intercala tipos sin perder elementos ni alterar el orden de cada grupo', () => {
  assert.deepEqual(
    interleaveFeedGroups([
      ['image-1', 'image-2', 'image-3'],
      ['video-1'],
      ['web-1', 'web-2'],
    ]),
    ['image-1', 'video-1', 'web-1', 'image-2', 'web-2', 'image-3']
  );
});

test('el feed inicial queda acotado aunque el catálogo sea grande', () => {
  assert.equal(initialFeedItemCount(1_000), INITIAL_FEED_ITEMS);
  assert.equal(initialFeedItemCount(5), 5);
  assert.equal(initialFeedItemCount(-1), 0);
});

test('el cliente mantiene el límite inicial en el mismo módulo para soportar HMR', async () => {
  const { readFile } = await import('node:fs/promises');
  const source = await readFile(
    new URL('../../src/app/[locale]/discover/discover-client.tsx', import.meta.url),
    'utf8'
  );

  assert.match(source, /const INITIAL_FEED_ITEMS = 16;/);
  assert.match(source, /useState\(\(\) =>\s*Math\.min\(/);
});

test('cada avance agrega un lote y nunca supera el total', () => {
  assert.equal(
    nextFeedItemCount(INITIAL_FEED_ITEMS, 100),
    INITIAL_FEED_ITEMS + FEED_PAGE_SIZE
  );
  assert.equal(nextFeedItemCount(28, 31), 31);
  assert.equal(nextFeedItemCount(31, 31), 31);
});

test('la home mantiene un catálogo curado y acotado', () => {
  assert.equal(Object.values(HOME_FEED_LIMITS).reduce((sum, count) => sum + count, 0), 80);
  assert.ok(Object.values(HOME_FEED_LIMITS).every(count => count >= INITIAL_FEED_ITEMS / 2));
});
