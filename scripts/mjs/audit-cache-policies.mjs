import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const digest = value => createHash('sha256').update(value).digest('hex').slice(0, 16);
const sensitiveRoutes = [
  'src/app/api/stripe/demo-buy-button/route.ts',
  'src/app/api/subscription/status/route.ts',
  'src/app/api/subscription/invoice/route.ts',
  'src/app/api/subscription/portal/route.ts',
  'src/app/api/web-page-checkout/route.ts',
  'src/app/api/component-checkout/route.ts',
  'src/app/api/purchases/[purchaseId]/download-token/route.ts',
  'src/app/api/purchases/download/route.ts',
  'src/app/api/catalog/components/[id]/route.ts',
  'src/app/api/catalog/web-pages/[id]/route.ts',
  'src/app/api/ai/jobs/route.ts',
  'src/app/api/ai/jobs/[id]/route.ts',
  'src/app/api/ai/jobs/[id]/retry/route.ts',
  'src/app/api/ai/jobs/[id]/progress/route.ts',
  'src/app/api/ai/jobs/process/route.ts',
  'src/app/api/observability/events/route.ts',
  'src/app/api/admin/observability/route.ts',
];

for (const route of sensitiveRoutes) {
  const source = await readFile(path.join(root, route), 'utf8');
  if (!source.includes("cacheHeaders('private-no-store')")) {
    failures.push(`${route}: falta private-no-store`);
  }
  if (/Cache-Control[^\n]*public/.test(source)) {
    failures.push(`${route}: contiene caché pública`);
  }
}

for (const kind of ['images', 'videos', 'web-pages']) {
  for (const locale of ['es', 'en']) {
    const directory = path.join(root, 'public', 'catalog', kind, locale);
    const manifest = JSON.parse(await readFile(path.join(directory, 'manifest.json'), 'utf8'));
    if (!/^[a-f0-9]{16}$/.test(manifest.version ?? '')) {
      failures.push(`${kind}/${locale}: versión inválida`);
    }
    if (!Array.isArray(manifest.files) || manifest.files.length !== manifest.pages) {
      failures.push(`${kind}/${locale}: índice de archivos incompleto`);
      continue;
    }
    const existing = new Set(await readdir(directory));
    for (const entry of manifest.files) {
      if (!existing.has(entry.file) || !entry.file.includes(entry.hash)) {
        failures.push(`${kind}/${locale}: fragmento ausente o sin hash (${entry.file})`);
        continue;
      }
      const contents = await readFile(path.join(directory, entry.file), 'utf8');
      if (digest(contents) !== entry.hash) {
        failures.push(`${kind}/${locale}: hash no coincide (${entry.file})`);
      }
    }
  }
}

const componentDirectory = path.join(root, 'public/catalog/components');
const componentManifest = JSON.parse(await readFile(path.join(componentDirectory, 'manifest.json'), 'utf8'));
if (!/^[a-f0-9]{16}$/.test(componentManifest.version ?? '') || componentManifest.products <= 0) {
  failures.push('components: manifiesto inválido');
}
for (const entry of componentManifest.files ?? []) {
  const contents = await readFile(path.join(componentDirectory, entry.file), 'utf8');
  if (digest(contents) !== entry.hash) failures.push(`components: hash no coincide (${entry.file})`);
  const catalog = JSON.parse(contents);
  for (const component of catalog.components ?? []) {
    if (!component.detailEndpoint || (component.membership !== 'Free' && (component.prompt?.en?.length > 241 || component.prompt?.es?.length > 241))) {
      failures.push(`components: producto Premium expuesto o sin detalle (${component.id})`);
    }
  }
}

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(target));
    else if (/\.(?:ts|tsx)$/.test(entry.name)) files.push(target);
  }
  return files;
}
const allowedRawConsumers = new Set([
  path.join(root, 'src/lib/component-products.ts'),
  path.join(root, 'src/app/api/component-library/export/route.ts'),
]);
for (const file of await sourceFiles(path.join(root, 'src'))) {
  if (allowedRawConsumers.has(file)) continue;
  const source = await readFile(file, 'utf8');
  if (/public\/prompts\/web-(?:login|header|text|form|button|card|navigation|sidebar)-components\.json/.test(source)) {
    failures.push(`components: importación completa fuera del servidor (${path.relative(root, file)})`);
  }
}

if (failures.length) {
  console.error(`Cache audit failed:\n- ${failures.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log('Cache audit passed: public, private and no-store policies are consistent.');
}
