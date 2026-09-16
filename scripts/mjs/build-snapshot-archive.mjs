/**
 * Empaqueta el snapshot con la ruta de entrada corregida (source + docs +
 * coverage + historia).
 *
 *   node scripts/mjs/build-snapshot-archive.mjs
 *
 * El archivo final (dist/prompt-studio-snapshot-<sha>.tar.gz) contiene
 * exactamente lo que el evaluador necesita: el codigo real (`src/`, `tests/`),
 * la documentacion (`docs/`), el informe de cobertura (`coverage/lcov.info`),
 * el manifest de historia real (`reports/snapshot/history.json`) y los
 * workflows de GitHub. No incluye `node_modules` ni `.git`, y nunca sustituye
 * un analisis requerido por un artefacto opaco.
 *
 * Fallo (exit 1) si falta cualquiera de las entradas requeridas: no se empaqueta
 * un snapshot incompleto.
 */
import { existsSync, statSync, mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { headInfo, isShallow, remoteOrigin } from './snapshot-git.mjs';

const root = process.cwd();
const outDir = join(root, 'dist');

const REQUIRED = [
  'src',
  'docs',
  'tests',
  'package.json',
  'package-lock.json',
  'coverage/lcov.info',
  'reports/snapshot/history.json',
  '.github/workflows',
];

function requirePresent() {
  const missing = REQUIRED.filter((entry) => !existsSync(join(root, entry)));
  if (missing.length > 0) {
    for (const entry of missing) console.error(`ERROR: entrada requerida ausente: ${entry}`);
    process.exit(1);
  }
  const lcovSize = statSync(join(root, 'coverage', 'lcov.info')).size;
  if (lcovSize === 0) {
    console.error('ERROR: coverage/lcov.info esta vacio.');
    process.exit(1);
  }
}

function lastCommit() {
  return headInfo().shortSha;
}

function archivePath() {
  return join(outDir, `prompt-studio-snapshot-${lastCommit()}.tar.gz`);
}

requirePresent();

const remote = remoteOrigin();
const shallow = isShallow();

mkdirSync(outDir, { recursive: true });
const archive = archivePath();
const result = spawnSync('tar', ['-czf', archive, '-C', root, ...REQUIRED], { encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'tar failed');
  process.exit(1);
}

const size = statSync(archive).size;

console.log(`Archive OK: dist/prompt-studio-snapshot-${lastCommit()}.tar.gz (${(size / 1024 / 1024).toFixed(2)} MiB)`);
console.log(`  remote   ${remote ?? 'sin remote origin'}`);
console.log(`  shallow  ${shallow ? 'si (historia seccionada)' : 'no'}`);
console.log(`  inputs   ${REQUIRED.join(', ')}`);