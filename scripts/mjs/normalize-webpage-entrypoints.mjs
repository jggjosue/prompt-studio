#!/usr/bin/env node

import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'src/data/web-pages.json');
const webpagesRoot = path.join(root, 'public/webpages');

// Catalog entries whose original demo was not imported. Keep their public URL
// working by forwarding it to the closest existing demo instead of returning 404.
const DEMO_ALIASES = {
  'editorial-minimal': 'magzin-job-light',
  'cyberpunk-neon': 'cipher-cyberpunk-neon',
  cats: 'pawpark-pet-supplies',
};

const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
const slugs = [...new Set(
  (catalog.webPages ?? [])
    .map(page => String(page.demoUrl ?? '').trim())
    .filter(value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value))
)];

const unresolved = [];
let normalized = 0;
let aliases = 0;

for (const slug of slugs) {
  const directory = path.join(webpagesRoot, slug);
  const entrypoint = path.join(directory, 'index.html');
  if (existsSync(entrypoint)) continue;

  const importedEntrypoint = path.join(directory, `webpages_${slug}_index.html`);
  if (existsSync(importedEntrypoint)) {
    await copyFile(importedEntrypoint, entrypoint);
    normalized += 1;
    continue;
  }

  const alias = DEMO_ALIASES[slug];
  if (alias && existsSync(path.join(webpagesRoot, alias, 'index.html'))) {
    await mkdir(directory, { recursive: true });
    const destination = `/webpages/${encodeURIComponent(alias)}/index.html`;
    await writeFile(
      entrypoint,
      `<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0;url=${destination}"><title>Opening preview…</title></head><body><script>location.replace(${JSON.stringify(destination)}+location.search+location.hash)</script><a href="${destination}">Open preview</a></body></html>\n`,
      'utf8'
    );
    aliases += 1;
    continue;
  }

  unresolved.push(slug);
}

if (unresolved.length) {
  throw new Error(`Webpage demos without an index.html or configured alias: ${unresolved.join(', ')}`);
}

console.log(`[webpage-entrypoints] ${normalized} normalized, ${aliases} aliases, ${slugs.length} catalog slugs verified.`);
