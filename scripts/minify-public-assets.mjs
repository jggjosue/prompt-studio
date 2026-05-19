/**
 * Minifica JS/CSS en public/ (esbuild + cssnano).
 * El bundle de Next ya minifica app/* en producción; esto cubre assets estáticos sueltos.
 */
import * as esbuild from 'esbuild';
import { readdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import postcss from 'postcss';
import cssnano from 'cssnano';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
/** Solo assets propios del loader; los demos HTML/CSS en public/webpages/* no se tocan. */
const MINIFY_ROOTS = [
  path.join(ROOT, 'public', 'webpages', 'refactory-online'),
];

const JS_EXT = new Set(['.js', '.mjs']);
const CSS_EXT = new Set(['.css']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

function shouldMinifyJs(filePath) {
  const base = path.basename(filePath);
  if (base.endsWith('.min.js') || base.endsWith('.min.mjs')) return false;
  return JS_EXT.has(path.extname(filePath).toLowerCase());
}

function shouldMinifyCss(filePath) {
  const base = path.basename(filePath);
  if (base.endsWith('.min.css')) return false;
  return CSS_EXT.has(path.extname(filePath).toLowerCase());
}

async function minifyJs(filePath) {
  const source = await readFile(filePath, 'utf8');
  if (source.length < 80) return null;

  const result = await esbuild.transform(source, {
    loader: 'js',
    minify: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    legalComments: 'none',
    target: 'es2020',
  });

  if (result.code.length >= source.length) return null;

  await writeFile(filePath, result.code, 'utf8');
  return { before: source.length, after: result.code.length };
}

async function minifyCss(filePath) {
  const source = await readFile(filePath, 'utf8');
  if (source.length < 80) return null;

  const result = await postcss([cssnano({ preset: 'default' })]).process(source, {
    from: filePath,
    to: filePath,
  });

  if (result.css.length >= source.length) return null;

  await writeFile(filePath, result.css, 'utf8');
  return { before: source.length, after: result.css.length };
}

async function main() {
  const all = [];
  for (const root of MINIFY_ROOTS) {
    try {
      await stat(root);
      all.push(...(await walk(root)));
    } catch {
      console.warn(`[minify-public] Omitido (no existe): ${path.relative(ROOT, root)}`);
    }
  }

  if (all.length === 0) {
    console.warn('[minify-public] Nada que minificar.');
    return;
  }
  const jsFiles = all.filter(shouldMinifyJs);
  const cssFiles = all.filter(shouldMinifyCss);

  let jsCount = 0;
  let cssCount = 0;

  for (const file of jsFiles) {
    const r = await minifyJs(file);
    if (r) {
      jsCount += 1;
      const pct = ((1 - r.after / r.before) * 100).toFixed(1);
      console.log(
        `[minify-public] JS ${path.relative(ROOT, file)}: ${r.before} → ${r.after} B (-${pct}%)`
      );
    }
  }

  for (const file of cssFiles) {
    const r = await minifyCss(file);
    if (r) {
      cssCount += 1;
      const pct = ((1 - r.after / r.before) * 100).toFixed(1);
      console.log(
        `[minify-public] CSS ${path.relative(ROOT, file)}: ${r.before} → ${r.after} B (-${pct}%)`
      );
    }
  }

  if (jsCount === 0 && cssCount === 0) {
    console.log('[minify-public] Sin archivos JS/CSS que reducir en public/.');
  } else {
    console.log(`[minify-public] Listo: ${jsCount} JS, ${cssCount} CSS.`);
  }
}

main().catch(err => {
  console.error('[minify-public] Error:', err);
  process.exit(1);
});
