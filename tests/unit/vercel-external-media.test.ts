import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

async function findMp4Files(directory: string): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await findMp4Files(absolute));
    else if (entry.name.toLowerCase().endsWith('.mp4')) found.push(absolute);
  }
  return found;
}

test('demo videos are externalized and recorded with immutable evidence', async () => {
  const manifest = JSON.parse(await readFile(path.join(root, 'config/vercel-external-media.json'), 'utf8'));
  assert.equal(manifest.provider, 'cloudflare-r2');
  assert.equal(manifest.objects.length, 9);
  assert.equal(manifest.objects.reduce((sum: number, item: { bytes: number }) => sum + item.bytes, 0), 31_754_742);
  for (const object of manifest.objects) {
    assert.match(object.path, /^webpages\/.+\.mp4$/);
    assert.match(object.sha256, /^[a-f0-9]{64}$/);
    assert.equal(existsSync(path.join(root, 'public', object.path)), false);
  }
  assert.deepEqual(await findMp4Files(path.join(root, 'public/webpages')), []);
});

test('legacy URLs redirect and the asset route signs direct R2 downloads', async () => {
  const [config, route, storage] = await Promise.all([
    readFile(path.join(root, 'next.config.ts'), 'utf8'),
    readFile(path.join(root, 'src/app/api/webpages/assets/[...path]/route.ts'), 'utf8'),
    readFile(path.join(root, 'src/lib/r2-storage.ts'), 'utf8'),
  ]);
  assert.match(config, /source: '\/webpages\/:path\*\.mp4'/);
  assert.match(config, /destination: '\/api\/webpages\/assets\/:path\*\.mp4'/);
  assert.match(route, /NextResponse\.redirect\(directUrl/);
  assert.match(route, /'Cache-Control': 'private, no-store'/);
  assert.match(storage, /getSignedUrl/);
});
