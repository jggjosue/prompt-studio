import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const webpagesDir = path.join(repoRoot, 'public', 'webpages');
/**
 * El catálogo vive en `src/data/web-pages.json`. Antes estaba en
 * `public/webpages/web-pages.json`, pero se movió al sacar el producto de pago
 * de `public/`: el fichero era descargable con los prompts dentro. Este script
 * seguía leyendo la ruta vieja, así que fallaba con ENOENT y **abortaba toda la
 * cadena `seo:validate-all`** antes de ejecutar los demás validadores.
 */
const catalogPath = path.join(repoRoot, 'src', 'data', 'web-pages.json');
const IGNORE_SLUGS = new Set(['refactory-online']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listWebpageFolders(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(
      dirent =>
        dirent.isDirectory() &&
        !dirent.name.startsWith('.') &&
        !IGNORE_SLUGS.has(dirent.name)
    )
    .map(dirent => dirent.name)
    .sort();
}

function unique(values) {
  return Array.from(new Set(values));
}

const catalog = readJson(catalogPath);
const entries = Array.isArray(catalog.webPages) ? catalog.webPages : [];
const catalogSlugs = unique(
  entries
    .map(entry => entry?.demoUrl?.trim())
    .filter(slug => Boolean(slug) && !IGNORE_SLUGS.has(slug))
  );

const diskFolders = fs.existsSync(webpagesDir) ? listWebpageFolders(webpagesDir) : [];
const diskSet = new Set(diskFolders);
const catalogSet = new Set(catalogSlugs);

const missingFromCatalog = diskFolders.filter(folder => !catalogSet.has(folder));
const missingFromDisk = catalogSlugs.filter(slug => !diskSet.has(slug));

const report = {
  catalogPath: path.relative(repoRoot, catalogPath),
  webpagesDir: path.relative(repoRoot, webpagesDir),
  catalogCount: catalogSlugs.length,
  diskCount: diskFolders.length,
  missingFromCatalog,
  missingFromDisk,
};

//console.log(JSON.stringify(report, null, 2));

if (missingFromCatalog.length || missingFromDisk.length) {
  console.error(
    [
      'SEO audit failed:',
      missingFromCatalog.length
        ? `- folders on disk missing from catalog: ${missingFromCatalog.join(', ')}`
        : null,
      missingFromDisk.length
        ? `- catalog entries missing from disk: ${missingFromDisk.join(', ')}`
        : null,
    ]
      .filter(Boolean)
      .join('\n')
  );
  process.exitCode = 1;
}
