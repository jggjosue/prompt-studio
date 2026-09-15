import assert from 'node:assert/strict';
import test from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalog = JSON.parse(readFileSync(path.join(root, 'src/data/web-pages.json'), 'utf8')) as {
  webPages: Array<{ demoUrl?: string }>;
};

test('cada demo local del catálogo tiene un index.html publicable', () => {
  const missing = catalog.webPages
    .map(page => String(page.demoUrl ?? '').trim())
    .filter(value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
    .filter(slug => !existsSync(path.join(root, 'public/webpages', slug, 'index.html')));

  assert.deepEqual([...new Set(missing)], []);
});

test('el normalizador forma parte del prebuild', () => {
  const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8')) as {
    scripts: Record<string, string>;
  };
  assert.match(packageJson.scripts.prebuild, /webpages:normalize/);
});

test('ArenaLive muestra una compra visible cuando llega un precio válido', () => {
  const page = readFileSync(
    path.join(root, 'public/webpages/arenalive-sports-events/index.html'),
    'utf8'
  );
  const purchaseScript = readFileSync(
    path.join(root, 'public/webpages/demo-purchase-button.js'),
    'utf8'
  );

  assert.match(page, /src="\/webpages\/demo-purchase-button\.js"/);
  assert.match(purchaseScript, /a\.get\("price"\)/);
  assert.match(purchaseScript, /Comprar \$"\+n\+" USD/);
  assert.match(purchaseScript, /a\.get\("checkout"\)/);
});
