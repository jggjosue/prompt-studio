/**
 * Verifica que los enlaces relativos de la documentación apunten a archivos
 * existentes dentro del repositorio.
 *
 *   npm run docs:check-links
 *
 * Motivación (DOC-016): Documentation Reach mide cuántas líneas de código están
 * referenciadas desde los documentos; un enlace a una ruta inexistente infla ese
 * ancla que estaría vacía sin aportar nada. Este script garantiza que todos los
 * enlaces relativos de los documentos de `docs/` resuelven a ficheros o
 * directorios reales.
 *
 * Qué NO comprueba:
 *  - Enlaces externos (`https://`, `mailto:`, `//…`) por diseño.
 *  - Anclas (`#sección`): solo se comprueba la existencia del fichero.
 *  - El contenido de bloques de código (```…```) y de spans de código (`…`),
 *    que se ignoran para no generar falsos positivos.
 *
 * Salida: lista de enlaces rotos con `archivo:línea` y código de salida 1 si hay
 * alguno; 0 en caso contrario.
 */
import { readFile } from 'node:fs/promises';
import { readdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docsDir = path.join(root, 'docs');

/** Sustituye cualquier carácter que no sea salto de línea por un espacio. */
function blanked(block) {
  return block.replace(/[^\n]/g, ' ');
}

/**
 * Recoge recursivamente todos los `.md` bajo `dir`.
 * @param {string} dir
 * @param {string[]} out
 * @returns {string[]}
 */
function listMarkdown(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listMarkdown(full, out);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) out.push(full);
  }
  return out;
}

/**
 * Devuelve el número de línea (1-indexed) en `original` de la posición `index`,
 * contando saltos de línea antes de esa posición.
 * @param {string} original
 * @param {number} index
 * @returns {number}
 */
function lineAt(original, index) {
  let line = 1;
  for (let i = 0; i < index && i < original.length; i++) {
    if (original.charCodeAt(i) === 10) line++;
  }
  return line;
}

/**
 * Regex de enlaces inline de Markdown: `[label](target)` y `[label](<target>)`.
 * La forma con `<>` permite `]` dentro de la ruta (p. ej. `[locale]`), por eso
 * tiene su propia alternativa: `[label](<ruta>...)` y `[label](ruta...)`.
 */
const LINK_RE = /\[([^\]]*)\]\(<([^>\n]+)>\)|\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** Prefijos de esquema que indican un destino externo o no dereferenciable. */
const EXTERNAL_RE = /^[a-z][a-z0-9+.-]*:|\/\//i;

/**
 * Comprueba todos los enlaces de un documento.
 * @param {string} file Ruta absoluta al `.md`.
 * @param {string[]} broken Acumulador de errores `archivo:línea: destino`.
 */
async function checkFile(file, broken) {
  const original = await readFile(file, 'utf8');
  const dir = path.dirname(file);
  const relFile = path.relative(root, file);
  const lines = original.split('\n');

  // Enmascara bloques de código y spans de código para no lanzar falsos
  // positivos, conservando la longitud y los saltos de línea originales.
  let inFence = false;
  const stripped = lines
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence;
        return blanked(line);
      }
      if (inFence) return blanked(line);
      return line.replace(/`[^`\n]*`/g, blanked);
    })
    .join('\n');

  LINK_RE.lastIndex = 0;
  for (const match of stripped.matchAll(LINK_RE)) {
    const target = (match[2] || match[4] || '').trim();
    if (!target || EXTERNAL_RE.test(target)) continue;

    const rel = target.split('#')[0];
    if (!rel) continue;

    const abs = path.resolve(dir, rel);
    if (path.relative(root, abs).split(path.sep)[0] === '..') {
      broken.push(`${relFile}:${lineAt(original, match.index)}: ${target} (fuera del repositorio)`);
      continue;
    }
    if (!existsSync(abs)) {
      broken.push(`${relFile}:${lineAt(original, match.index)}: ${target}`);
    }
  }
}

const files = listMarkdown(docsDir);
const broken = [];
for (const file of files) await checkFile(file, broken);

if (broken.length > 0) {
  for (const error of broken) console.error(`ROTO  ${error}`);
  console.error(`\n${broken.length} enlaces rotos en ${files.length} documentos.`);
  process.exit(1);
}
console.log(`${files.length} documentos revisados · 0 enlaces rotos ✓`);