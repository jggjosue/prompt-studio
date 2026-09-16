/**
 * Registra que seis metricas del snapshot quedaron gradables y el motivo de
 * cualquier pendiente, tras ejecutar los preflights.
 *
 *   node scripts/mjs/report-snapshot-gradability.mjs
 *
 * Escribe reports/snapshot/gradability.md (versionado? NO: se genera por
 * commit, el doc de referencia es docs/SNAPSHOT_GRADABILITY.md y la evidencia
 * se captura en el reporte de CI). La cadena completa la orquesta
 * `npm run snapshot:gate`.
 */
import { readFileSync, statSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const lcovPath = join(root, 'coverage', 'lcov.info');
const manifestPath = join(root, 'reports', 'snapshot', 'history.json');

function filesUnder(dir, predicate) {
  const abs = join(root, dir);
  if (!existsSync(abs)) return [];
  const out = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (predicate(path)) out.push(path);
    }
  };
  walk(abs);
  return out;
}

const errors = [];
const source = filesUnder('src', (p) => /\.(ts|tsx|js|jsx|mjs|cjs)$/.test(p));
const docs = filesUnder('docs', (p) => /\.(md|mdx)$/.test(p));

let lcovValid = false;
if (!existsSync(lcovPath) || statSync(lcovPath).size === 0) {
  errors.push('coverage/lcov.info ausente o vacio: ejecuta npm run test:coverage.');
} else {
  const lcov = readFileSync(lcovPath, 'utf8');
  lcovValid = ['SF:', 'LF:', 'LH:'].every((marker) => lcov.includes(marker));
  if (!lcovValid) errors.push('coverage/lcov.info no contiene registros SF:/LF:/LH:.');
}

let manifest = null;
if (!existsSync(manifestPath)) {
  errors.push('reports/snapshot/history.json ausente: ejecuta npm run snapshot:history.');
} else {
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    errors.push('reports/snapshot/history.json no es JSON valido.');
  }
}

const history = manifest?.history ?? { commitCount: 0, activeDays: 0, commitAuthors: 0 };
const shallow = manifest?.repository?.shallow ?? true;
const pulls = manifest?.pullRequests ?? { available: false };

function metric(name, state, evidence) {
  return { name, state, evidence };
}

const rows = [
  metric('Churn × complexity', source.length > 0 && history.commitCount > 0 && !shallow ? 'gradable' : 'no gradable',
    `${source.length} ficheros source · ${history.commitCount} commits reales · shallow=${shallow ? 'si' : 'no'}`),
  metric('Code complexity', source.length > 0 ? 'gradable' : 'no gradable',
    `${source.length} ficheros source legibles en el archivo`),
  metric('Documentation', docs.length > 0 ? 'gradable' : 'no gradable',
    `${docs.length} documentos en docs/`),
  metric('Commit density', history.commitCount > 0 && !shallow ? 'gradable' : 'no gradable',
    `${history.commitCount} commits · ${history.activeDays} dias activos · ${history.commitAuthors} autores`),
  metric('Pull request density', pulls.available ? 'gradable' : 'pendiente',
    pulls.available
      ? `${pulls.total} PRs reales (merged=${pulls.merged}, open=${pulls.open})`
      : `requiere GH_TOKEN/GITHUB_TOKEN en el empaquetado (${pulls.reason ?? 'sin motivo'})`),
  metric('Test coverage', lcovValid ? 'gradable' : 'no gradable',
    lcovValid ? 'coverage/lcov.info valido con registros SF:/LF:/LH:' : 'coverage/lcov.info no valido'),
];

const gradable = rows.filter((row) => row.state === 'gradable').length;
const pending = rows.filter((row) => row.state !== 'gradable');
const sha = manifest?.revision?.shortSha ?? 'unknown';

const lines = [
  '# Snapshot gradability report',
  '',
  `- Revision: \`${sha}\` · generado: ${new Date().toISOString()}`,
  `- Plan de referencia: [docs/SNAPSHOT_GRADABILITY.md](../docs/SNAPSHOT_GRADABILITY.md)`,
  '',
  '| Metrica | Estado | Evidencia |',
  '|---|---|---|',
  ...rows.map((row) => `| ${row.name} | ${row.state} | ${row.evidence} |`),
  '',
  `**${gradable}/6 gradables**${pending.length ? ' · pendientes: ' + pending.map((row) => row.name).join(', ') : ''}.`,
  ...(errors.length ? ['', ...errors.map((error) => `> ${error}`)] : []),
  ...(pending.length
    ? ['', 'Razones verbatim de los no gradables:', ...pending.map((row) => `- ${row.name}: ${row.evidence}`)]
    : []),
];

mkdirSync(join(root, 'reports', 'snapshot'), { recursive: true });
writeFileSync(join(root, 'reports', 'snapshot', 'gradability.md'), lines.join('\n') + '\n');

console.log(`Snapshot gradability: ${gradable}/6 gradables`);
for (const row of rows) console.log(`  ${row.state.padEnd(10)} ${row.name} — ${row.evidence}`);
if (errors.length > 0) {
  console.log('Pendientes:');
  for (const error of errors) console.log(`  - ${error}`);
}