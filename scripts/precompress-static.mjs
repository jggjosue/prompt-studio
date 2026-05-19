/**
 * Genera variantes .br y .gz de assets estáticos (Brotli y Gzip).
 * Útil para hosting propio; en Vercel la red también comprime al vuelo.
 */
import { brotliCompressSync, constants, gzipSync } from 'zlib';
import { readdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const COMPRESSIBLE = new Set([
  '.html',
  '.htm',
  '.css',
  '.js',
  '.json',
  '.svg',
  '.xml',
  '.txt',
  '.webmanifest',
  '.map',
]);

const MIN_BYTES = 1024;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

function shouldCompress(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.br' || ext === '.gz') return false;
  return COMPRESSIBLE.has(ext);
}

async function compressFile(filePath) {
  const buf = await readFile(filePath);
  if (buf.length < MIN_BYTES) return null;

  const br = brotliCompressSync(buf, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 6 },
  });
  const gz = gzipSync(buf, { level: 6 });

  await writeFile(`${filePath}.br`, br);
  await writeFile(`${filePath}.gz`, gz);

  const ratioBr = ((1 - br.length / buf.length) * 100).toFixed(1);
  const ratioGz = ((1 - gz.length / buf.length) * 100).toFixed(1);

  return {
    file: path.relative(ROOT, filePath),
    original: buf.length,
    brotli: br.length,
    gzip: gz.length,
    ratioBr,
    ratioGz,
  };
}

async function main() {
  try {
    await stat(PUBLIC_DIR);
  } catch {
    console.warn('[precompress] public/ no encontrado, omitiendo.');
    return;
  }

  const all = await walk(PUBLIC_DIR);
  const targets = all.filter(shouldCompress);
  const results = [];

  for (const file of targets) {
    const r = await compressFile(file);
    if (r) results.push(r);
  }

  if (results.length === 0) {
    console.log('[precompress] Nada que comprimir (archivos < 1KB o sin extensiones válidas).');
    return;
  }

  console.log(`[precompress] ${results.length} archivo(s) en public/:`);
  for (const r of results) {
    console.log(
      `  ${r.file}: ${r.original} B → br ${r.brotli} B (-${r.ratioBr}%), gzip ${r.gzip} B (-${r.ratioGz}%)`
    );
  }
}

main().catch(err => {
  console.error('[precompress] Error:', err);
  process.exit(1);
});
