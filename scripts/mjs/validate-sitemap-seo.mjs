import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const webpagesDir = path.join(repoRoot, 'public', 'webpages');
/**
 * El catálogo vive en `src/data`, no dentro de `public/webpages`.
 *
 * Esta ruta apuntaba a `public/webpages/web-pages.json`, un fichero que no
 * existe: el validador moría con ENOENT antes de comprobar nada, así que
 * llevaba tiempo dando falsa tranquilidad. `public/webpages` sigue siendo el
 * directorio con las carpetas de demo, que es lo que se cruza contra el
 * catálogo.
 */
const catalogPath = path.join(repoRoot, 'src', 'data', 'web-pages.json');
const sitemapPath = path.join(repoRoot, 'src', 'app', 'sitemap.ts');
const ignoreSlugs = new Set(['refactory-online']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function listFolders(dirPath) {
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && !ignoreSlugs.has(dirent.name))
    .map(dirent => dirent.name)
    .sort();
}

function unique(values) {
  return Array.from(new Set(values));
}

function normalizeDemoFolder(demoUrl) {
  const trimmed = String(demoUrl ?? '').trim();
  if (!trimmed) return '';
  const legacy = trimmed.match(/\/webpages\/([^/]+)(?:\/|$)/);
  if (legacy) return legacy[1];
  const direct = trimmed.match(/^\/?([^/?#]+)(?:\/index\.html)?(?:[?#].*)?$/);
  return direct ? direct[1] : '';
}

const catalog = readJson(catalogPath);
const entries = Array.isArray(catalog.webPages) ? catalog.webPages : [];
const catalogSlugs = unique(
  entries
    .map(entry => normalizeDemoFolder(entry?.demoUrl))
    .filter(slug => Boolean(slug) && !ignoreSlugs.has(slug))
);
const diskFolders = fs.existsSync(webpagesDir) ? listFolders(webpagesDir) : [];
const orphans = diskFolders.filter(folder => !catalogSlugs.includes(folder));
const missingFromDisk = catalogSlugs.filter(slug => !diskFolders.includes(slug));

const sitemapSource = fs.readFileSync(sitemapPath, 'utf8');
const includesWebpagesPaths = /\/webpages\/\$\{/.test(sitemapSource) || /\/webpages\//.test(sitemapSource);
const includesR2SitemapPaths = /listR2WebpageFolders/.test(sitemapSource);
const includesPricingRoute = sitemapSource.includes("'/pricing'");
const includesPricesRoute = sitemapSource.includes("'/prices'");
const includesLandingPages = sitemapSource.includes("'/landing-pages'");

const landingPageSitemapPaths = catalogSlugs.map(slug => `/landing-pages/${slug}`);

const report = {
  catalogPath: path.relative(repoRoot, catalogPath),
  webpagesDir: path.relative(repoRoot, webpagesDir),
  sitemapPath: path.relative(repoRoot, sitemapPath),
  catalogCount: catalogSlugs.length,
  diskCount: diskFolders.length,
  landingPageCount: landingPageSitemapPaths.length,
  missingFromDisk,
  orphans,
  sitemapChecks: {
    includesLandingPages,
    includesPricesRoute,
    includesPricingRoute,
    includesWebpagesPaths,
    includesR2SitemapPaths,
  },
};

/*
 * El informe se construía y nunca se imprimía: el validador podía fallar sin
 * decir qué había encontrado. Queda tras `SEO_REPORT=1` para no ensuciar la
 * salida normal de CI.
 */
if (process.env.SEO_REPORT === '1') console.log(JSON.stringify(report, null, 2));

const issues = [];
if (orphans.length) {
  issues.push(`folders on disk missing from catalog: ${orphans.join(', ')}`);
}
if (missingFromDisk.length) {
  issues.push(`catalog entries missing from disk: ${missingFromDisk.join(', ')}`);
}
if (!includesLandingPages) {
  issues.push('sitemap should include /landing-pages');
}
if (!includesPricesRoute) {
  issues.push('sitemap should include /prices');
}
if (includesPricingRoute) {
  issues.push('sitemap should not include /pricing');
}
if (includesWebpagesPaths) {
  issues.push('sitemap should not include raw /webpages URLs');
}
if (includesR2SitemapPaths) {
  issues.push('sitemap should not depend on R2 webpage folders');
}

if (issues.length) {
  console.error(['Sitemap SEO audit failed:', ...issues.map(issue => `- ${issue}`)].join('\n'));
  process.exitCode = 1;
}
