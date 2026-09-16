/**
 * Valida que el snapshot conserva la identidad y la historia real del
 * repositorio que el evaluador necesita para medir commit/PR density.
 *
 *   npm run snapshot:verify-history
 *
 * Reglas (fallo = exit 1):
 *   1. Existe remote `origin` (identidad del repositorio no seccionada).
 *   2. El historial no es shallow salvo que `SNAPSHOT_ALLOW_SHALLOW=1`.
 *   3. Hay commits reales alcanzables desde HEAD (commit density medible).
 *   4. Si `EXPECTED_REPOSITORY` esta definido, el remote debe corresponder a
 *      ese repositorio (owner/name).
 *   5. Si `EXPECTED_REVISION` esta definido, HEAD debe coincidir con esa
 *      revision (el snapshot se asocia a la revision correcta).
 *
 * La recuperacion de pull requests es informativa: si hay token se comprueba
 * que la GitHub API responde PRs reales; si no, se avisa sin fallar.
 */
import { git, isShallow, remoteOrigin, headInfo, commitStats, repoSlug } from './snapshot-git.mjs';

const cwd = process.cwd();
const expectedRepository = process.env.EXPECTED_REPOSITORY || null;
const expectedRevision = process.env.EXPECTED_REVISION || null;
const allowShallow = process.env.SNAPSHOT_ALLOW_SHALLOW === '1';
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';

const failures = [];
const warnings = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

const remote = remoteOrigin();
check(remote !== null, 'No existe remote `origin`: no hay identidad de repositorio que el evaluador pueda verificar.');

const slug = repoSlug(remote);
check(slug !== null, 'El remote `origin` no corresponde a una URL GitHub: el evaluador no podra asociar el snapshot a un repositorio real.');
if (expectedRepository && remote) {
  check(slug === expectedRepository, `El remote ${slug} no coincide con EXPECTED_REPOSITORY=${expectedRepository}.`);
}

const head = headInfo();
if (expectedRevision) {
  check(head.sha === expectedRevision, `HEAD ${head.sha} no coincide con EXPECTED_REVISION=${expectedRevision}.`);
}

const shallow = isShallow();
check(shallow !== true || allowShallow,
  'El historial es shallow: commit density no seria medible desde el snapshot sin seccionar mas historia (SNAPSHOT_ALLOW_SHALLOW=1 para permitir).');

const history = commitStats();
check(history.commitCount > 0, 'No hay commits reales alcanzables desde HEAD: commit density no puede medirse.');

if (token && slug) {
  const [owner, repo] = slug.split('/');
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}` },
  }).catch(() => null);
  if (!response || !response.ok) {
    warnings.push(`GitHub API no respondio (${response?.status ?? 'sin conexion'}); PR density quedara sin verificar en esta ejecucion.`);
  }
} else {
  warnings.push(token
    ? 'Sin token no se puede confirmar la lectura de PRs; la seccion PR densidad es informativa.'
    : 'GH_TOKEN/GITHUB_TOKEN ausente: la verificacion de PR density es informativa.');
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`ERROR: ${failure}`);
  process.exit(1);
}

for (const warning of warnings) console.log(`AVISO: ${warning}`);
console.log(`Snapshot history OK: ${slug ?? 'sin slug'}@${head.shortSha} · ${history.commitCount} commits · shallow=${shallow ? 'si' : 'no'}`);
if (expectedRepository || expectedRevision) {
  console.log(`  verificacion contra ${expectedRepository ?? '-'} @ ${expectedRevision ?? 'HEAD'}`);
}