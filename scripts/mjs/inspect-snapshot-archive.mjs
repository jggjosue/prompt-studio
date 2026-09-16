/**
 * Inspecciona el archivo de snapshot: verifica que se puede extraer y que
 * contiene las rutas esperadas (source, docs, cobertura, historia y
 * workflows), tal como exige el paso de validacion del
 * docs/SNAPSHOT_GRADABILITY.md.
 *
 *   node scripts/mjs/inspect-snapshot-archive.mjs [archivo]
 *
 * Sin argumento usa el ultimo archivo dist/prompt-studio-snapshot-*.tar.gz.
 * Fallo (exit 1) si falta alguna ruta esperada o no hay entradas de source/docs.
 */
import { readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');

function latestArchive() {
  if (!existsSync(distDir)) return null;
  const candidates = readdirSync(distDir).filter((name) => /^prompt-studio-snapshot-.*\.tar\.gz$/.test(name));
  if (candidates.length === 0) return null;
  return join(distDir, candidates.sort().at(-1));
}

const archive = process.argv[2] || latestArchive();
if (!archive || !existsSync(archive)) {
  console.error('ERROR: no se encontro archivo de snapshot. Ejecuta primero npm run snapshot:gate.');
  process.exit(1);
}

const list = spawnSync('tar', ['-tzf', archive], { encoding: 'utf8' });
if (list.status !== 0) {
  console.error('ERROR: el archivo no se puede inspeccionar (tar -tzf fallo).');
  process.exit(1);
}

const entries = list.stdout.split('\n').filter(Boolean);
const source = entries.filter((entry) => /^(src|tests)\/.+\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry));
const docs = entries.filter((entry) => /^docs\/.+\.(md|mdx)$/.test(entry));
const workflows = entries.filter((entry) => /^\.github\/workflows\//.test(entry));
const has = (pattern) => entries.some((entry) => pattern.test(entry));

const failures = [];
if (source.length === 0) failures.push('no hay ficheros source/tests legibles en el archivo');
if (docs.length === 0) failures.push('no hay ficheros de documentacion en el archivo');
if (!has(/^coverage\/lcov\.info$/)) failures.push('falta coverage/lcov.info en el archivo');
if (!has(/^reports\/snapshot\/history\.json$/)) failures.push('falta reports/snapshot/history.json en el archivo');
if (!has(/^package\.json$/)) failures.push('falta package.json en el archivo');
if (workflows.length === 0) failures.push('no hay .github/workflows en el archivo');

if (failures.length > 0) {
  for (const failure of failures) console.error(`ERROR: ${failure}`);
  process.exit(1);
}

console.log(`Archive inspectable OK: ${entries.length} entradas`);
console.log(`  source/tests  ${source.length}`);
console.log(`  docs          ${docs.length}`);
console.log(`  workflows     ${workflows.length}`);
console.log(`  lcov, history.json, package.json  presentes`);