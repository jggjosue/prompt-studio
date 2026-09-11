#!/usr/bin/env node
/**
 * Genera la imagen de vista previa que le falta a cada página web del catálogo.
 *
 *   node scripts/build-webpage-previews.mjs            # solo las que no tienen imagen
 *   node scripts/build-webpage-previews.mjs --slug=x   # una concreta
 *   node scripts/build-webpage-previews.mjs --force    # rehace también las existentes
 *
 * Abre el demo local (`public/webpages/<slug>/…index.html`) con el Chrome del
 * sistema mediante Playwright, captura el viewport y lo guarda como WebP en
 * `public/images/webpages/<slug>.webp`. Después escribe la ruta en
 * `src/data/web-pages.json`.
 *
 * No descarga navegadores: usa `channel: 'chrome'`. No accede a la red salvo lo
 * que la propia página pida.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright';

const CATALOG = 'src/data/web-pages.json';
const OUT_DIR = join('public', 'images', 'webpages');
const WIDTH = 1280;
const HEIGHT = 800;
const OUT_WIDTH = 960;
const QUALITY = 72;

const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith('--slug='))?.slice('--slug='.length);
const force = args.includes('--force');

/** Localiza el html de entrada del demo: index.html o webpages_<slug>_index.html. */
function findEntry(slug) {
  const dir = join('public', 'webpages', slug);
  if (!existsSync(dir)) return null;
  const html = readdirSync(dir).filter((f) => f.endsWith('.html'));
  if (!html.length) return null;
  const preferred =
    html.find((f) => f === 'index.html') ??
    html.find((f) => f.endsWith('_index.html')) ??
    html[0];
  return join(dir, preferred);
}

const catalog = JSON.parse(readFileSync(CATALOG, 'utf8'));
const pending = [];
const skipped = [];

for (const page of catalog.webPages) {
  const slug = (page.demoUrl ?? '').trim();
  if (only && slug !== only) continue;
  if (page.imageUrl && !force) continue;
  const entry = findEntry(slug);
  if (!entry) {
    skipped.push({ slug, motivo: existsSync(join('public', 'webpages', slug)) ? 'sin html' : 'sin directorio' });
    continue;
  }
  pending.push({ page, slug, entry });
}

if (!pending.length) {
  console.log('Nada que generar.');
  if (skipped.length) console.log('Sin demo local:', skipped);
  process.exit(0);
}

mkdirSync(OUT_DIR, { recursive: true });
console.log(`Generando ${pending.length} vistas previas con el Chrome del sistema…`);

const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
  reducedMotion: 'reduce', // captura estable: sin animaciones a medio camino
});

const done = [];
const failed = [];

for (const [index, { page: entryPage, slug, entry }] of pending.entries()) {
  const tab = await context.newPage();
  try {
    await tab.goto(pathToFileURL(resolve(entry)).href, { waitUntil: 'load', timeout: 30000 });
    await tab.waitForTimeout(1200); // deja asentar fuentes y lienzos 3D
    const png = await tab.screenshot({ type: 'png' });
    const out = join(OUT_DIR, `${slug}.webp`);
    await sharp(png).resize({ width: OUT_WIDTH }).webp({ quality: QUALITY }).toFile(out);
    entryPage.imageUrl = `/images/webpages/${slug}.webp`;
    done.push(slug);
    console.log(`  [${index + 1}/${pending.length}] ${slug}`);
  } catch (error) {
    failed.push({ slug, error: String(error).split('\n')[0] });
    console.log(`  [${index + 1}/${pending.length}] ${slug} — FALLO`);
  } finally {
    await tab.close();
  }
}

await context.close();
await browser.close();

if (done.length) {
  writeFileSync(CATALOG, JSON.stringify(catalog, null, 2) + '\n');
}

console.log(`\nGeneradas: ${done.length}`);
if (failed.length) console.log(`Fallidas: ${failed.length}`, failed);
if (skipped.length) console.log(`Sin demo local: ${skipped.length}`, skipped);
