#!/usr/bin/env node
/**
 * Medición local de Documentación Reach (DOC-019 · issue #51).
 *
 * Calcula qué parte del código fuente en alcance está apuntada por la
 * documentación, con los mismos campos que pide el backlog: documentedFiles,
 * totalFiles, documentedLines, totalSourceLines y porcentaje.
 *
 * Método:
 *  - Denominador: ficheros de código bajo `src/` (sin `src/data/`) y de la raíz,
 *    excluyendo los patrones de `.swmignore` (tests, scripts, catálogos, etc.).
 *  - Numerador: ficheros del denominador a los que apunta al menos un documento
 *    del corpus explicativo (enlace relativo Markdown o token `path` con
 *    extensión de código). Los directorios no cuentan; un fichero cuenta entero.
 *  - CODEBASE_MAP.md es un inventario generado: se reporta aparte como
 *    `reachInclInventory` para no confundir índice masivo con cobertura
 *    explicativa (criterio DOC-001).
 *
 * Swimm sigue siendo la métrica de referencia; este script es el proxy local y
 * reproducible para observar antes/después entre PRs.
 *
 * Uso:   node scripts/mjs/measure-documentation-reach.mjs [--json]
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const posix = (p) => p.split('\\').join('/');

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.mjs', '.cjs', '.jsx', '.mts', '.cts',
]);

const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', 'coverage', 'test-results',
  'playwright-report', '.specstory', '.vscode', '.claude',
  'public', 'messages', '.vercel', 'reports', 'replace-buttons.js',
]);

const CORPUS_CORE = [
  'README.md',
  'CONTRIBUTING.md',
  'docs/SWIMM.md',
  'docs/ARCHITECTURE.md',
  'docs/AI_ARCHITECTURE.md',
  'docs/API_ACCESS.md',
  'docs/CODEBASE_MAP.md',
  'docs/DATABASE.md',
  'docs/DEPLOYMENT.md',
  'docs/SECURITY.md',
  'docs/TESTING.md',
];

const CORPUS_DIRS = ['docs/audits', 'docs/playbooks'];

const INVENTORY_DOC = 'docs/CODEBASE_MAP.md';

const HIGH_IMPACT_DOC = 'docs/audits/HIGH_IMPACT_SOURCE_PRIORITIES.md';

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseSwmignore() {
  const raw = readFileSync(join(ROOT, '.swmignore'), 'utf8');
  return raw
    .split('\n')
    .map((line) => line.replace(/\s*#.*$/, '').trim())
    .filter(Boolean);
}

const SWMIGNORE = parseSwmignore();

function isSwimmIgnored(relPath) {
  for (const pattern of SWMIGNORE) {
    const pat = pattern.replace(/\/+$/, '');
    if (relPath === pat || relPath.startsWith(pat + '/')) return true;
    if (pat.includes('*')) {
      const regex = new RegExp(
        `^${pat.split('*').map(escapeRegExp).join('[^/]*')}$`,
      );
      if (regex.test(relPath)) return true;
    }
  }
  return false;
}

function walkFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walkFiles(abs, out);
    } else if (entry.isFile()) {
      out.push(abs);
    }
  }
  return out;
}

function isRootCodeFile(relPath) {
  return !relPath.includes('/') && CODE_EXTENSIONS.has(extname(relPath));
}

function extname(relPath) {
  const base = relPath.split('/').pop();
  const dot = base.lastIndexOf('.');
  return dot > 0 ? base.slice(dot) : '';
}

function discoverSourceFiles() {
  const files = [];
  for (const abs of walkFiles(ROOT)) {
    const relPath = posix(relative(ROOT, abs));
    const extension = extname(relPath);
    if (!CODE_EXTENSIONS.has(extension)) continue;
    const inScope =
      (relPath.startsWith('src/') || isRootCodeFile(relPath)) &&
      !isSwimmIgnored(relPath);
    if (inScope) files.push(relPath);
  }
  files.sort();
  return files;
}

function countLines(text) {
  return text.length === 0 ? 0 : text.split('\n').length;
}

function isExistingFile(abs) {
  try {
    return statSync(abs).isFile();
  } catch {
    return false;
  }
}

function resolveReference(baseDir, rawTarget) {
  let target = rawTarget
    .replace(/^<|>$/g, '')
    .split('#')[0]
    .split('?')[0]
    .trim();
  if (!target || target.startsWith('/') || /^[a-z]+:/i.test(target)) {
    return null;
  }
  for (const base of [baseDir, ROOT]) {
    const abs = resolve(base, target);
    const relPath = posix(relative(ROOT, abs));
    if (relPath.startsWith('..')) continue;
    if (isExistingFile(abs)) return relPath;
  }
  return null;
}

function extractReferences(docRelPath, text) {
  const baseDir = dirname(join(ROOT, docRelPath));
  const found = new Set();
  for (const match of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    const resolved = resolveReference(baseDir, match[1]);
    if (resolved) found.add(resolved);
  }
  for (const match of text.matchAll(/`([^`]+)`/g)) {
    const token = match[1];
    if (
      token.startsWith('src/') ||
      token.startsWith('scripts/') ||
      !token.includes('/')
    ) {
      const resolved = resolveReference(baseDir, token);
      if (resolved) found.add(resolved);
    }
  }
  return [...found].sort();
}

function listMarkdownFiles(dirRel) {
  const absDir = join(ROOT, dirRel);
  return readdirSync(absDir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => `${dirRel}/${name}`)
    .sort();
}

function buildCorpus() {
  const docs = [...CORPUS_CORE];
  for (const dir of CORPUS_DIRS) docs.push(...listMarkdownFiles(dir));
  return [...new Set(docs)].filter((doc) => isExistingFile(join(ROOT, doc)));
}

function main() {
  const jsonMode = process.argv.includes('--json');
  const sourceFiles = discoverSourceFiles();
  const corpus = buildCorpus();

  const lineCounts = new Map();
  for (const rel of sourceFiles) {
    lineCounts.set(rel, countLines(readFileSync(join(ROOT, rel), 'utf8')));
  }
  const totalFiles = sourceFiles.length;
  const totalSourceLines = [...lineCounts.values()].reduce((a, b) => a + b, 0);

  const byDoc = new Map();
  const documentedBy = new Map();
  for (const doc of corpus) {
    const refs = extractReferences(doc, readFileSync(join(ROOT, doc), 'utf8'));
    const inScope = refs.filter((rel) => lineCounts.has(rel));
    byDoc.set(doc, inScope);
    for (const rel of inScope) {
      if (!documentedBy.has(rel)) documentedBy.set(rel, []);
      documentedBy.get(rel).push(doc);
    }
  }

  const explanatoryCorpus = corpus.filter((doc) => doc !== INVENTORY_DOC);
  const explanatoryDocumented = new Set();
  for (const doc of explanatoryCorpus) {
    for (const rel of byDoc.get(doc)) explanatoryDocumented.add(rel);
  }

  const inventoryDocumented = new Set(byDoc.get(INVENTORY_DOC) ?? []);
  const allDocumented = new Set([
    ...explanatoryDocumented,
    ...inventoryDocumented,
  ]);
  const onlyInventory = [...inventoryDocumented].filter(
    (rel) => !explanatoryDocumented.has(rel),
  );

  const sumLines = (rels) =>
    [...rels].reduce((acc, rel) => acc + (lineCounts.get(rel) ?? 0), 0);

  const documentedFiles = explanatoryDocumented.size;
  const documentedLines = sumLines(explanatoryDocumented);
  const reachPercent =
    totalSourceLines === 0 ? 0 : (documentedLines / totalSourceLines) * 100;
  const reachInclInventoryLines = sumLines(allDocumented);
  const reachInclInventoryPercent =
    totalSourceLines === 0
      ? 0
      : (reachInclInventoryLines / totalSourceLines) * 100;
  const tier =
    reachPercent >= 60 ? 'A' : reachPercent >= 40 ? 'B' : reachPercent >= 20 ? 'C' : 'D';

  let highImpact = [];
  const highImpactDoc = corpus.find((doc) => doc === HIGH_IMPACT_DOC);
  if (highImpactDoc && byDoc.has(highImpactDoc)) {
    const withoutSelf = new Set();
    for (const doc of explanatoryCorpus) {
      if (doc === HIGH_IMPACT_DOC) continue;
      for (const rel of byDoc.get(doc)) withoutSelf.add(rel);
    }
    highImpact = byDoc
      .get(HIGH_IMPACT_DOC)
      .filter((rel) => !withoutSelf.has(rel));
  }

  const report = {
    repository: 'jggjosue/prompt-studio',
    date: new Date().toISOString().slice(0, 10),
    scope: {
      note: 'src/**/*.{ts,tsx,js,mjs,jsx,cjs,mts,cts} sin src/data/, ficheros de código de la raíz, y .swmignore aplicado',
      totalFiles,
      totalSourceLines,
    },
    corpus: {
      count: corpus.length,
      documents: corpus,
      excludesInventory: INVENTORY_DOC,
    },
    baseline: {
      files: 3,
      totalFiles: 575,
      percent: 0,
      sourceLines: 75995,
      note: 'baseline histórico de Swimm',
    },
    documentedFiles,
    totalFiles,
    documentedLines,
    totalSourceLines,
    percentage: Number(reachPercent.toFixed(2)),
    tier,
    reachInclInventory: {
      files: allDocumented.size,
      lines: reachInclInventoryLines,
      percentage: Number(reachInclInventoryPercent.toFixed(2)),
    },
    inventoryOnly: {
      files: onlyInventory.length,
      lines: sumLines(onlyInventory),
    },
    uncoveredHighImpact: highImpact,
    perDocument: byDoc, // unused in JSON output to keep it compact
  };

  const perDocumentSummary = [...byDoc.entries()]
    .map(([doc, refs]) => ({
      document: doc,
      files: refs.length,
      lines: sumLines(refs),
    }))
    .sort((a, b) => b.lines - a.lines);

  if (jsonMode) {
    const { perDocument, ...json } = report;
    json.perDocument = perDocumentSummary;
    console.log(JSON.stringify(json, null, 2));
    return;
  }

  console.log('Documentación Reach — prompt-studio');
  console.log(`Corpus: ${corpus.length} documentos (${explanatoryCorpus.length} explicativos + inventario)`);
  console.log(`Baseline histórico Swimm: 3 de 575 archivos · 0% · 75.995 líneas\n`);
  console.log('documentedFiles       =', documentedFiles);
  console.log('totalFiles            =', totalFiles);
  console.log('documentedLines       =', documentedLines);
  console.log('totalSourceLines      =', totalSourceLines);
  console.log('porcentaje            =', `${reachPercent.toFixed(2)}%`);
  console.log('tier                  =', tier);
  console.log('');
  console.log('con CODEBASE_MAP      =', `${reachInclInventoryPercent.toFixed(2)}% (${allDocumented.size} archivos; ${onlyInventory.length} solo del inventario)`);
  console.log('');
  console.log('Módulos de alto impacto (DOC-003) aún sin cobertura explicativa:', highImpact.length);
  for (const rel of highImpact.slice(0, 20)) console.log('  -', rel);
  if (highImpact.length > 20) console.log(`  … y ${highImpact.length - 20} más`);
  console.log('');
  console.log('Por documento (líneas apuntadas):');
  for (const { document, files, lines } of perDocumentSummary) {
    console.log(`  ${lines.toString().padStart(7)}  ${files.toString().padStart(3)}  ${document}`);
  }
  console.log('');
  console.log('Swimm sigue siendo la métrica de referencia; este script es el proxy local.');
}

main();