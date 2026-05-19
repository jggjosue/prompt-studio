#!/usr/bin/env node
/**
 * Genera public/webpages/refactory-online/manifest.json
 * a partir de web-pages.json y carpetas con index.html.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const webpagesDir = path.join(root, 'public/webpages');
const jsonPath = path.join(webpagesDir, 'web-pages.json');
const outPath = path.join(webpagesDir, 'refactory-online/manifest.json');

const COMPONENT_FILES = ['index.html', 'styles.css', 'script.js'];

function listComponents(slugDir) {
  return COMPONENT_FILES.filter((file) =>
    fs.existsSync(path.join(slugDir, file))
  );
}

function scanFolders() {
  const demos = {};
  if (!fs.existsSync(webpagesDir)) return demos;

  for (const name of fs.readdirSync(webpagesDir, { withFileTypes: true })) {
    if (!name.isDirectory() || name.name === 'refactory-online') continue;
    const dir = path.join(webpagesDir, name.name);
    if (!fs.existsSync(path.join(dir, 'index.html'))) continue;
    demos[name.name] = {
      components: listComponents(dir),
    };
  }
  return demos;
}

const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const scanned = scanFolders();

function demoFolderFromUrl(demoUrl) {
  if (!demoUrl || typeof demoUrl !== 'string') return null;
  const trimmed = demoUrl.trim();
  if (!trimmed) return null;
  const legacy = trimmed.match(/\/webpages\/([^/]+)(?:\/|$)/);
  if (legacy) return legacy[1];
  if (/^[a-z0-9][a-z0-9-]*$/i.test(trimmed) && !trimmed.includes('/')) {
    return trimmed;
  }
  return null;
}

for (const page of data.webPages || []) {
  const slug = demoFolderFromUrl(page.demoUrl);
  if (!slug) continue;
  const dir = path.join(webpagesDir, slug);
  scanned[slug] = {
    id: page.id,
    title: page.title,
    imageUrl: page.imageUrl,
    stack: page.stack,
    components: fs.existsSync(dir)
      ? listComponents(dir)
      : scanned[slug]?.components || ['index.html'],
  };
}

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  loaderUrl: '/webpages/refactory-online/loader.html',
  apiUrl: '/api/refactory-online',
  demos: scanned,
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`manifest: ${Object.keys(scanned).length} demos → ${outPath}`);
