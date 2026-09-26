import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const targets = [
  'public',
  'public/webpages',
  'public/catalog',
  '.next',
  '.next/server',
  '.next/server/app',
];

async function walk(relative) {
  const absolute = path.join(root, relative);
  let info;
  try { info = await stat(absolute); } catch { return { bytes: 0, files: 0, largest: [] }; }
  if (info.isFile()) return { bytes: info.size, files: 1, largest: [[relative, info.size]] };
  const result = { bytes: 0, files: 0, largest: [] };
  for (const entry of await readdir(absolute, { withFileTypes: true })) {
    const child = await walk(path.join(relative, entry.name));
    result.bytes += child.bytes;
    result.files += child.files;
    result.largest.push(...child.largest);
  }
  result.largest.sort((a,b) => b[1] - a[1]);
  result.largest = result.largest.slice(0, 20);
  return result;
}

const mb = b => (b / 1024 / 1024).toFixed(2);
console.log('Vercel storage audit (local build artifacts; not Vercel billing totals)');
for (const target of targets) {
  const r = await walk(target);
  console.log(`\n${target}: ${mb(r.bytes)} MB, ${r.files} files`);
  for (const [file, bytes] of r.largest.slice(0, 10)) console.log(`  ${mb(bytes)} MB  ${file}`);
}
console.log('\nReview next.config.ts outputFileTracingIncludes separately: broad public/** globs can be copied into multiple function bundles.');
