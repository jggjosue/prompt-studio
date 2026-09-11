import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const webpagesDir = path.join(repoRoot, 'public', 'webpages');
const catalogPath = path.join(repoRoot, 'src', 'data', 'web-pages.json');
const sitemapPath = path.join(repoRoot, 'src', 'app', 'sitemap.ts');
const IGNORE_SLUGS = new Set(['refactory-online']);
const NEW_URL_LOOKBACK_DAYS = 14;
const DEFAULT_SAMPLE_SIZE = 10;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function unique(values) {
  return Array.from(new Set(values));
}

function normalizeSlug(value) {
  return String(value ?? '').trim();
}

function listWebpageFolders(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
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

function folderMtime(folderPath) {
  try {
    return fs.statSync(folderPath).mtimeMs;
  } catch {
    return 0;
  }
}

function buildLandingUrl(slug) {
  return `/landing-pages/${slug}`;
}

const catalog = readJson(catalogPath);
const entries = Array.isArray(catalog.webPages) ? catalog.webPages : [];

const bySlug = new Map();
for (const entry of entries) {
  const slug = normalizeSlug(entry?.demoUrl);
  if (!slug || IGNORE_SLUGS.has(slug) || bySlug.has(slug)) continue;
  bySlug.set(slug, entry);
}

const diskFolders = listWebpageFolders(webpagesDir);
const now = Date.now();

const recentFolders = diskFolders
  .map(slug => ({
    slug,
    mtimeMs: folderMtime(path.join(webpagesDir, slug)),
  }))
  .filter(item => item.mtimeMs > 0)
  .sort((a, b) => b.mtimeMs - a.mtimeMs);

const recentSlugs = recentFolders
  .filter(item => now - item.mtimeMs <= NEW_URL_LOOKBACK_DAYS * ONE_DAY_MS)
  .slice(0, DEFAULT_SAMPLE_SIZE)
  .map(item => item.slug);

const sampleSlugs = recentSlugs.length ? recentSlugs : recentFolders.slice(0, DEFAULT_SAMPLE_SIZE).map(item => item.slug);
const sampleUrls = unique(sampleSlugs.map(buildLandingUrl));

const sitemapSource = fs.readFileSync(sitemapPath, 'utf8');
const sitemapMentionsWebpages = /\/landing-pages\/\$\{/.test(sitemapSource) || sitemapSource.includes('/landing-pages');

const catalogCount = bySlug.size;
const diskCount = diskFolders.length;
const recentCount = recentSlugs.length;

const shouldResubmitSitemap = recentCount >= 3;
const issuesToReview = [
  'Duplicada',
  'Descubierta pero no indexada',
  'Rastreada actualmente no indexada',
];

const report = {
  catalogPath: path.relative(repoRoot, catalogPath),
  webpagesDir: path.relative(repoRoot, webpagesDir),
  sitemapPath: path.relative(repoRoot, sitemapPath),
  catalogCount,
  diskCount,
  recentWindowDays: NEW_URL_LOOKBACK_DAYS,
  recentCatalogUrls: sampleUrls,
  searchConsoleIssuesToReview: issuesToReview,
  shouldResubmitSitemap,
  sitemapMentionsLandingPages: sitemapMentionsWebpages,
  guidance: {
    inspectSampleUrlsAfterDeploy: sampleUrls.length,
    resubmitSitemapWhenManyNewPages: shouldResubmitSitemap,
  },
};

//console.log(JSON.stringify(report, null, 2));

const actions = [];

if (!sitemapMentionsWebpages) {
  actions.push('sitemap should include landing-pages URLs for indexed demos');
}
if (!sampleUrls.length) {
  actions.push('no recent demo URLs found to sample in Search Console');
}

if (actions.length) {
  console.error(['Search Console validation failed:', ...actions.map(action => `- ${action}`)].join('\n'));
  process.exitCode = 1;
}

