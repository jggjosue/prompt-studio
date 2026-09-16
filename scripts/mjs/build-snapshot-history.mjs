/**
 * Genera el manifest de historia real del repositorio para el snapshot.
 *
 *   npm run snapshot:history
 *
 * El evaluador mide commit/PR density a traves de la conexion GitHub del
 * repositorio (historia real del remote), no a traves de un formato propio.
 * Este script no inventa ningun formato: exporta a `reports/snapshot/history.json`
 * exactamente los datos que esa conexion puede leer, obtenidos de registros
 * reales:
 *
 *   - Revision e identidad: remote `origin`, HEAD actual, rama y fecha.
 *   - Historia de commits: conteo total, autores, dias activos y distribucion
 *     por dia de la semana, leidos de `git rev-list`/`git log`.
 *   - Pull requests (opcional): si `GH_TOKEN` o `GITHUB_TOKEN` estan presentes,
 *     totales reales de PRs abiertos/cerrados/mergeados via GitHub API.
 *
 * Nunca se sintetizan commits ni PRs. Si no hay token, la seccion de pull
 * requests queda con `available: false` y el motivo, y el validador lo trata
 * como informativo, no como historia inventada.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { git, isShallow, remoteOrigin, headInfo, commitStats, repoSlug } from './snapshot-git.mjs';

const root = process.cwd();
const outDir = join(root, 'reports', 'snapshot');
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '';
const expected = process.env.GITHUB_REPOSITORY || null;

function parseArgs(argv) {
  const args = { expectedRevision: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--since' && argv[i + 1]) {
      args.expectedRevision = argv[i + 1];
      i++;
    }
  }
  return args;
}

/** Recupera los PRs reales del repositorio via GitHub API (conexion GitHub). */
async function fetchPullRequests(owner, repo) {
  const pulls = [];
  const headers = {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  for (let page = 1; page <= 20; page++) {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}`;
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}: ${response.statusText}`);
    }
    const pageItems = await response.json();
    if (!Array.isArray(pageItems) || pageItems.length === 0) break;
    for (const pull of pageItems) {
      pulls.push({
        number: pull.number,
        state: pull.state,
        merged: Boolean(pull.merged_at),
        author: pull.user?.login ?? 'unknown',
      });
    }
    if (pageItems.length < 100) break;
  }

  const merged = pulls.filter((pull) => pull.merged).length;
  const open = pulls.filter((pull) => pull.state === 'open').length;
  return {
    available: true,
    total: pulls.length,
    merged,
    open,
    closed: pulls.length - open,
    creators: new Set(pulls.map((pull) => pull.author)).size,
  };
}

const { expectedRevision } = parseArgs(process.argv);
const remote = remoteOrigin();
const slug = expected !== null ? expected : repoSlug(remote);
const head = headInfo();
const history = commitStats();

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  repository: {
    remote,
    slug,
    shallow: isShallow(),
  },
  revision: {
    sha: head.sha,
    shortSha: head.shortSha,
    ref: head.ref,
    committerDate: head.committerDate,
    subject: head.subject,
  },
  history,
  pullRequests: null,
};

if (expectedRevision) {
  manifest.expectedRevision = expectedRevision;
  manifest.revisionVerified = manifest.revision.sha === expectedRevision;
}

if (token && slug) {
  const [owner, repo] = slug.split('/');
  try {
    manifest.pullRequests = await fetchPullRequests(owner, repo);
  } catch (error) {
    manifest.pullRequests = { available: false, reason: error.message };
  }
} else {
  manifest.pullRequests = {
    available: false,
    reason: token ? 'no se pudo derivar el repositorio del remote origin' : 'GH_TOKEN/GITHUB_TOKEN no presente',
  };
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'history.json'), `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Snapshot history manifest OK (${slug ?? 'slug desconocido'})`);
console.log(`  revision  ${head.shortSha}${head.ref !== 'HEAD' ? ` (${head.ref})` : ''} ${head.subject || ''}`);
console.log(`  commits   ${history.commitCount} · ${history.activeDays} dias activos · ${history.commitAuthors} autores`);
console.log(`  PRs       ${manifest.pullRequests.available ? (manifest.pullRequests.total + ' reales' + (token ? '' : '')) : manifest.pullRequests.reason}`);
console.log(`  output    reports/snapshot/history.json`);