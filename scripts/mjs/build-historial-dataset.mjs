#!/usr/bin/env node
/**
 * Genera el dataset derivado del historial en docs/historial/datos/.
 *
 *   node scripts/build-historial-dataset.mjs
 *
 * Salidas:
 *   commits.csv    una fila por commit, con volumen y clasificacion heuristica
 *   metricas.json  agregados (por mes, por hora, por autor, churn por fichero)
 *
 * Todo lo que escribe es derivado de `git`: borrar la carpeta y volver a
 * ejecutar debe dar el mismo resultado. Los ficheros curados a mano
 * (trazas.jsonl, fallos.csv) NO se tocan.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join('docs', 'historial', 'datos');
const SEP = '\x1f'; // separador de campo (unit separator)

const EMAIL_REDACTED = 'help@prompstudio.com';
const redactarCorreo = (correo) =>
  /@/.test(correo) ? EMAIL_REDACTED : correo;
const REC = '\x1e'; // separador de registro (record separator)

const git = (args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });

/** Clasificacion heuristica; documentada en datos/README.md. */
const PATRON_FALLO = /error|fix|corrig|soluciona|isn't starting/i;
const PATRON_INSTRUCCION = /_for element/;

function leerCommits() {
  const raw = git([
    'log',
    '--reverse',
    '--numstat',
    `--pretty=format:${REC}%H${SEP}%h${SEP}%ad${SEP}%aI${SEP}%an${SEP}%ae${SEP}%p${SEP}%s`,
    '--date=format:%Y-%m-%d %H:%M',
  ]);

  return raw
    .split(REC)
    .slice(1)
    .map((bloque) => {
      const [cabecera, ...lineas] = bloque.split('\n');
      const [sha, corto, fecha, iso, autor, correo, padres, asunto] =
        cabecera.split(SEP);

      let add = 0;
      let del = 0;
      let ficheros = 0;
      for (const l of lineas) {
        const m = l.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
        if (!m) continue;
        ficheros += 1;
        if (m[1] !== '-') add += Number(m[1]);
        if (m[2] !== '-') del += Number(m[2]);
      }

      return {
        sha,
        corto,
        fecha,
        iso,
        mes: fecha.slice(0, 7),
        hora: Number(fecha.slice(11, 13)),
        // dia de la semana en la hora local del autor (no la del lector)
        dia_semana: new Date(`${fecha.replace(' ', 'T')}:00Z`).getUTCDay(),
        autor,
        correo: redactarCorreo(correo),
        es_merge: padres.trim().split(' ').filter(Boolean).length > 1,
        asunto,
        asunto_largo: asunto.length,
        asunto_truncado: asunto.length >= 72,
        es_fallo: PATRON_FALLO.test(asunto),
        es_instruccion_natural: PATRON_INSTRUCCION.test(asunto),
        ficheros,
        lineas_add: add,
        lineas_del: del,
      };
    });
}

function csv(filas, columnas) {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  return (
    [columnas.join(','), ...filas.map((f) => columnas.map((c) => esc(f[c])).join(','))].join('\n') +
    '\n'
  );
}

function churn() {
  const nombres = git(['log', '--pretty=format:', '--name-only'])
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const cuenta = new Map();
  for (const n of nombres) cuenta.set(n, (cuenta.get(n) ?? 0) + 1);
  return [...cuenta.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([fichero, commits]) => ({ fichero, commits }));
}

function agrupar(filas, clave, reductor) {
  const m = new Map();
  for (const f of filas) {
    const k = clave(f);
    m.set(k, reductor(m.get(k), f));
  }
  return Object.fromEntries([...m.entries()].sort());
}

const commits = leerCommits();

mkdirSync(OUT, { recursive: true });

writeFileSync(
  join(OUT, 'commits.csv'),
  csv(commits, [
    'corto', 'sha', 'fecha', 'mes', 'hora', 'dia_semana', 'autor', 'correo',
    'es_merge', 'es_fallo', 'es_instruccion_natural', 'asunto_largo',
    'asunto_truncado', 'ficheros', 'lineas_add', 'lineas_del', 'asunto',
  ]),
);

const metricas = {
  generado: new Date().toISOString().slice(0, 10),
  fuente: 'git log del repositorio prompt-studio',
  totales: {
    commits: commits.length,
    primero: commits[0]?.fecha,
    ultimo: commits.at(-1)?.fecha,
    merges: commits.filter((c) => c.es_merge).length,
    commits_de_fallo: commits.filter((c) => c.es_fallo).length,
    commits_instruccion_natural: commits.filter((c) => c.es_instruccion_natural).length,
    asuntos_truncados: commits.filter((c) => c.asunto_truncado).length,
    asuntos_de_15_o_menos: commits.filter((c) => c.asunto_largo <= 15).length,
    asunto_largo_max: Math.max(...commits.map((c) => c.asunto_largo)),
    asunto_largo_mediana: [...commits.map((c) => c.asunto_largo)].sort((a, b) => a - b)[
      Math.floor(commits.length / 2)
    ],
    lineas_add: commits.reduce((s, c) => s + c.lineas_add, 0),
    lineas_del: commits.reduce((s, c) => s + c.lineas_del, 0),
  },
  por_mes: agrupar(commits, (c) => c.mes, (acc = { commits: 0, add: 0, del: 0 }, c) => ({
    commits: acc.commits + 1,
    add: acc.add + c.lineas_add,
    del: acc.del + c.lineas_del,
  })),
  por_hora: agrupar(commits, (c) => String(c.hora).padStart(2, '0'), (acc = 0) => acc + 1),
  por_dia_semana: agrupar(commits, (c) => c.dia_semana, (acc = 0) => acc + 1),
  por_autor: agrupar(commits, (c) => c.autor, (acc = { commits: 0, desde: null, hasta: null }, c) => ({
    commits: acc.commits + 1,
    desde: acc.desde ?? c.fecha.slice(0, 10),
    hasta: c.fecha.slice(0, 10),
  })),
  churn_top_50: churn(),
};

writeFileSync(join(OUT, 'metricas.json'), JSON.stringify(metricas, null, 2) + '\n');

console.log(
  `commits.csv: ${commits.length} filas\n` +
  `metricas.json: ${Object.keys(metricas.por_mes).length} meses, ` +
  `${metricas.churn_top_50.length} ficheros en el ranking de churn`,
);
