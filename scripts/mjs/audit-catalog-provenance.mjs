/**
 * Auditoría de procedencia del catálogo.
 *
 *   npm run catalog:provenance          → informe en consola
 *   npm run catalog:provenance -- --json → informe JSON para pipelines
 *
 * Responde a la única pregunta que importa antes de licenciar el catálogo como
 * dataset: de los N registros, ¿cuántos se pueden redistribuir hoy y qué
 * bloquea al resto?
 *
 * La clasificación por host vive en `src/lib/catalog-provenance.ts`. Este script
 * solo recorre las fuentes y agrega.
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const asJson = process.argv.includes('--json');

/**
 * El módulo de clasificación es TypeScript y este script corre en Node sin
 * transpilar, así que se importa el fuente y se evalúa la parte que se necesita.
 * Para no duplicar reglas, se reimplementa aquí solo la lectura de datos y se
 * delega la clasificación mediante import dinámico cuando el runtime lo soporta.
 */
async function loadClassifier() {
  try {
    const mod = await import('../src/lib/catalog-provenance.ts');
    return mod.classifyAsset;
  } catch {
    throw new Error(
      'No se pudo importar src/lib/catalog-provenance.ts.\n' +
      'Este script necesita Node >= 22.6 con --experimental-strip-types,\n' +
      'que es lo que ya usa `npm run test:unit`.'
    );
  }
}

const SOURCES = [
  ['images', 'src/data/prompts/placeholder-images.json', 'placeholderImages'],
  ['videos', 'src/data/prompts/placeholder-videos.json', 'placeholderVideos'],
  ['web-pages', 'src/data/web-pages.json', 'webPages'],
];

async function componentSources() {
  const dir = path.join(root, 'src/data/prompts');
  const files = await readdir(dir);
  return files
    .filter(f => /^web-.*-components\.json$/.test(f))
    .map(f => [f.replace('.json', ''), path.join('src/data/prompts', f), null]);
}

function extractItems(parsed, key) {
  if (key && parsed && typeof parsed === 'object' && Array.isArray(parsed[key])) return parsed[key];
  if (Array.isArray(parsed)) return parsed;
  if (parsed && typeof parsed === 'object') {
    const firstArray = Object.values(parsed).find(Array.isArray);
    if (firstArray) return firstArray;
  }
  return [];
}

const ASSET_FIELDS = ['imageUrl', 'videoUrl', 'previewUrl'];

async function main() {
  const classifyAsset = await loadClassifier();
  const sources = [...SOURCES, ...(await componentSources())];

  const byKind = new Map();
  const byLicense = new Map();
  const blockers = new Map(); // host → { count, reason, ejemplos }
  let total = 0;
  let licensable = 0;
  let withoutAsset = 0;
  const seenHashes = new Map();

  for (const [kind, file, key] of sources) {
    let parsed;
    try {
      parsed = JSON.parse(await readFile(path.join(root, file), 'utf8'));
    } catch {
      continue;
    }
    const items = extractItems(parsed, key);
    const stats = { total: 0, licensable: 0, withoutAsset: 0 };

    for (const item of items) {
      if (!item || typeof item !== 'object') continue;
      total++;
      stats.total++;

      // Deduplicación: dos registros con el mismo texto valen como uno solo
      // para un comprador de datos.
      const tags = Array.isArray(item.tags) ? item.tags.filter(t => typeof t === 'string') : [];
      const fingerprint = [item.id, item.title, item.description, item.imageHint, ...tags]
        .filter(Boolean)
        .join(' ');
      const hash = createHash('sha256').update(fingerprint).digest('hex').slice(0, 16);
      seenHashes.set(hash, (seenHashes.get(hash) ?? 0) + 1);

      const url = ASSET_FIELDS.map(f => item[f]).find(v => typeof v === 'string' && v.startsWith('http'));
      const asset = classifyAsset(url);

      if (!asset) {
        withoutAsset++;
        stats.withoutAsset++;
        // Sin activo externo, el registro es solo texto propio del catálogo.
        licensable++;
        stats.licensable++;
        byLicense.set('sin-activo', (byLicense.get('sin-activo') ?? 0) + 1);
        continue;
      }

      byLicense.set(asset.license, (byLicense.get(asset.license) ?? 0) + 1);
      if (asset.licensable) {
        licensable++;
        stats.licensable++;
      } else {
        const entry = blockers.get(asset.host) ?? { count: 0, reason: asset.reason, examples: [] };
        entry.count++;
        if (entry.examples.length < 3 && item.id) entry.examples.push(String(item.id));
        blockers.set(asset.host, entry);
      }
    }

    byKind.set(kind, stats);
  }

  const duplicates = [...seenHashes.values()].filter(n => n > 1).length;

  const report = {
    generatedAt: new Date().toISOString(),
    total,
    licensable,
    blocked: total - licensable,
    licensablePct: total ? Math.round((licensable / total) * 1000) / 10 : 0,
    withoutAsset,
    duplicateTextGroups: duplicates,
    byKind: Object.fromEntries(byKind),
    byLicense: Object.fromEntries(byLicense),
    blockers: Object.fromEntries(
      [...blockers.entries()].map(([host, v]) => [host, v])
    ),
  };

  if (asJson) {
    await mkdir(path.join(root, 'reports'), { recursive: true });
    const out = path.join(root, 'reports/catalog-provenance.json');
    await writeFile(out, JSON.stringify(report, null, 2) + '\n');
    console.log(`Informe escrito en ${path.relative(root, out)}`);
    return;
  }

  console.log('\n  PROCEDENCIA DEL CATÁLOGO');
  console.log('  ' + '─'.repeat(58));
  console.log(`  Registros totales          ${report.total}`);
  console.log(`  Licenciables hoy           ${report.licensable}  (${report.licensablePct}%)`);
  console.log(`  Bloqueados                 ${report.blocked}`);
  console.log(`  Sin activo externo         ${report.withoutAsset}  (solo texto propio)`);
  if (duplicates) {
    console.log(`  Grupos de texto duplicado  ${duplicates}  (deduplicar antes de exportar)`);
  }

  console.log('\n  Por tipo');
  for (const [kind, s] of byKind) {
    if (!s.total) continue;
    console.log(`    ${kind.padEnd(24)} ${String(s.licensable).padStart(4)}/${String(s.total).padEnd(5)} licenciables`);
  }

  if (blockers.size) {
    console.log('\n  Qué bloquea');
    for (const [host, v] of [...blockers.entries()].sort((a, b) => b[1].count - a[1].count)) {
      console.log(`\n    ${host}  —  ${v.count} registro(s)`);
      console.log(`      ${v.reason}`);
      if (v.examples.length) console.log(`      ejemplos: ${v.examples.join(', ')}`);
    }
  }

  console.log('\n  Nota: "licenciable" es una clasificación técnica por host de origen,');
  console.log('  no un dictamen legal. Los campos aiAssisted y consent siguen sin');
  console.log('  declarar y hacen falta antes de vender el dataset.\n');
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
