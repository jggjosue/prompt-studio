/**
 * Acceso a la historia real de Git para los comandos de snapshot.
 *
 * Todo lo que aqui se lee procede de registros Git reales del repositorio
 * (commit history a traves de `git log`/`git rev-list`, remotes y ramas). No se
 * sintetiza ni se inventa ningun dato: estos valores alimentan exactamente la
 * informacion que el evaluador necesita para medir commit/PR density.
 */
import { execFileSync } from 'node:child_process';

/** Ejecuta un subcomando de git y devuelve su salida recortada. */
export function git(args, cwd = process.cwd()) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

/** El historial del clon es incompleto (clone/checkout shallow). */
export function isShallow(cwd = process.cwd()) {
  try {
    return git(['rev-parse', '--is-shallow-repository'], cwd) === 'true';
  } catch {
    return true;
  }
}

/** URL del remote `origin`, o null si no existe. */
export function remoteOrigin(cwd = process.cwd()) {
  try {
    const url = git(['remote', 'get-url', 'origin'], cwd);
    return url || null;
  } catch {
    return null;
  }
}

/** `owner/name` a partir de la URL del remote, o null si no se puede derivar. */
export function repoSlug(remote) {
  if (!remote) return null;
  const match = remote.match(/(?:github\.com[\/:]|git@github\.com:)([^\/]+\/[^\/]+?)(?:\.git)?$/);
  return match ? match[1].replace(/\.git$/, '') : null;
}

/** Informacion del commit apuntado por HEAD. */
export function headInfo(cwd = process.cwd()) {
  return {
    sha: git(['rev-parse', 'HEAD'], cwd),
    shortSha: git(['rev-parse', '--short', 'HEAD'], cwd),
    ref: git(['rev-parse', '--abbrev-ref', 'HEAD'], cwd),
    committerDate: git(['log', '-1', '--format=%cI', 'HEAD'], cwd),
    subject: git(['log', '-1', '--format=%s', 'HEAD'], cwd),
  };
}

/**
 * Estadisticas reales del historial alcanzable desde HEAD.
 * @returns {{commitCount: number, activeDays: number, commitAuthors: number,
 *   firstCommitDate: string|null, latestCommitDate: string|null,
 *   commitsPerWeekday: Record<string, number>}}
 */
export function commitStats(cwd = process.cwd()) {
  const log = git(['log', '--format=%aI|%ae', 'HEAD'], cwd);
  const records = log === '' ? [] : log.split('\n').map((line) => {
    const [date, email] = line.split('|');
    return { date, email };
  });

  const commitsPerWeekday = { sun: 0, mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0 };
  const activeDays = new Set();
  const authors = new Set();
  let oldest = null;
  let newest = null;

  for (const record of records) {
    const day = new Date(record.date);
    if (Number.isNaN(day.getTime())) continue;
    const weekday = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][day.getUTCDay()];
    commitsPerWeekday[weekday] += 1;
    activeDays.add(record.date.slice(0, 10));
    authors.add(record.email);
    if (!oldest || day < oldest) oldest = day;
    if (!newest || day > newest) newest = day;
  }

  return {
    commitCount: records.length,
    activeDays: activeDays.size,
    commitAuthors: authors.size,
    firstCommitDate: oldest ? oldest.toISOString() : null,
    latestCommitDate: newest ? newest.toISOString() : null,
    commitsPerWeekday,
  };
}