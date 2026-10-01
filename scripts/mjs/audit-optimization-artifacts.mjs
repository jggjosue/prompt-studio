import { readdir, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const PUBLIC = path.join(ROOT, 'public');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

const files = await walk(PUBLIC);
let total = 0;
let compressed = 0;
let compressedCount = 0;
for (const file of files) {
  const size = (await stat(file)).size;
  total += size;
  if (file.endsWith('.br') || file.endsWith('.gz')) {
    compressed += size;
    compressedCount += 1;
  }
}

const mb = bytes => (bytes / 1024 / 1024).toFixed(2);
console.log(JSON.stringify({
  publicFiles: files.length,
  publicBytes: total,
  publicMiB: mb(total),
  generatedCompressionFiles: compressedCount,
  generatedCompressionBytes: compressed,
  generatedCompressionMiB: mb(compressed),
  deployablePublicBytesWithoutGeneratedCompression: total - compressed,
  deployablePublicMiBWithoutGeneratedCompression: mb(total - compressed),
}, null, 2));

if (process.env.CI && compressedCount > 0) {
  console.error('[optimization-artifacts] public/ contiene derivados .br/.gz; no deben formar parte del input de Vercel.');
  process.exitCode = 1;
}
