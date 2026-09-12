import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const webpagesDir = path.join(repoRoot, 'public', 'webpages');
const catalogPath = path.join(repoRoot, 'src', 'data', 'web-pages.json');
const IGNORE_SLUGS = new Set(['refactory-online']);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeSlug(value) {
  return String(value ?? '').trim();
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
    .filter(dirent => fs.existsSync(path.join(dirPath, dirent.name, 'index.html')))
    .map(dirent => dirent.name)
    .sort();
}

function unique(values) {
  return Array.from(new Set(values));
}

const catalog = readJson(catalogPath);
const entries = Array.isArray(catalog.webPages) ? catalog.webPages : [];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function normalizeList(value) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item ?? '').trim()).filter(Boolean);
}

const catalogSlugs = unique(
  entries
    .map(entry => normalizeSlug(entry?.demoUrl))
    .filter(slug => Boolean(slug) && !IGNORE_SLUGS.has(slug))
);

const diskSlugs = fs.existsSync(webpagesDir) ? listWebpageFolders(webpagesDir) : [];
const diskSet = new Set(diskSlugs);
const catalogSet = new Set(catalogSlugs);

const missingFromCatalog = diskSlugs.filter(slug => !catalogSet.has(slug));
const missingFromDisk = catalogSlugs.filter(slug => !diskSet.has(slug));

const duplicateCatalogSlugs = entries
  .map(entry => normalizeSlug(entry?.demoUrl))
  .filter(Boolean)
  .filter((slug, index, arr) => arr.indexOf(slug) !== index);

const malformedCatalogSlugs = unique(
  entries
    .map(entry => normalizeSlug(entry?.demoUrl))
    .filter(slug => Boolean(slug) && !IGNORE_SLUGS.has(slug) && !isValidSlug(slug))
);

const emptyTitleEntries = entries
  .filter(entry => {
    const title = entry?.title;
    if (!title || typeof title !== 'object') return true;
    return !isNonEmptyString(title.en) || !isNonEmptyString(title.es);
  })
  .map(entry => normalizeSlug(entry?.demoUrl) || '[missing-demoUrl]');

const emptyDescriptionEntries = entries
  .filter(entry => {
    const description = entry?.description;
    if (!description || typeof description !== 'object') return true;
    return !isNonEmptyString(description.en) || !isNonEmptyString(description.es);
  })
  .map(entry => normalizeSlug(entry?.demoUrl) || '[missing-demoUrl]');

const invalidMembershipEntries = entries
  .filter(entry => !['Premium', 'Free'].includes(String(entry?.membership ?? '').trim()))
  .map(entry => normalizeSlug(entry?.demoUrl) || '[missing-demoUrl]');

const invalidPriceEntries = entries
  .filter(entry => {
    const price = String(entry?.price ?? '').trim();
    return !/^\d+(?:\.\d{2})$/.test(price);
  })
  .map(entry => normalizeSlug(entry?.demoUrl) || '[missing-demoUrl]');

const missingTagsEntries = entries
  .filter(entry => normalizeList(entry?.tags).length === 0)
  .map(entry => normalizeSlug(entry?.demoUrl) || '[missing-demoUrl]');

const invalidTagEntries = entries
  .filter(entry => {
    const tags = normalizeList(entry?.tags);
    return tags.length > 0 && tags.some(tag => tag !== tag.trim() || !tag.length);
  })
  .map(entry => normalizeSlug(entry?.demoUrl) || '[missing-demoUrl]');

const report = {
  catalogPath: path.relative(repoRoot, catalogPath),
  webpagesDir: path.relative(repoRoot, webpagesDir),
  catalogCount: catalogSlugs.length,
  diskCount: diskSlugs.length,
  missingFromCatalog,
  missingFromDisk,
  duplicateCatalogSlugs: unique(duplicateCatalogSlugs),
  malformedCatalogSlugs,
  emptyTitleEntries: unique(emptyTitleEntries),
  emptyDescriptionEntries: unique(emptyDescriptionEntries),
  missingTagsEntries: unique(missingTagsEntries),
  invalidTagEntries: unique(invalidTagEntries),
  invalidMembershipEntries: unique(invalidMembershipEntries),
  invalidPriceEntries: unique(invalidPriceEntries),
};

/*
 * El informe se construía y nunca se imprimía: el validador podía fallar sin
 * decir qué había encontrado. Queda tras `SEO_REPORT=1` para no ensuciar la
 * salida normal de CI.
 */
if (process.env.SEO_REPORT === '1') console.log(JSON.stringify(report, null, 2));

const issues = [];
if (missingFromCatalog.length) {
  issues.push(`new folders without catalog entry: ${missingFromCatalog.join(', ')}`);
}
if (missingFromDisk.length) {
  issues.push(`catalog entries missing from disk: ${missingFromDisk.join(', ')}`);
}
if (duplicateCatalogSlugs.length) {
  issues.push(`duplicate demoUrl entries in catalog: ${unique(duplicateCatalogSlugs).join(', ')}`);
}
if (malformedCatalogSlugs.length) {
  issues.push(`malformed demoUrl slugs: ${malformedCatalogSlugs.join(', ')}`);
}
if (emptyTitleEntries.length) {
  issues.push(`entries with empty title fields: ${unique(emptyTitleEntries).join(', ')}`);
}
if (emptyDescriptionEntries.length) {
  issues.push(`entries with empty description fields: ${unique(emptyDescriptionEntries).join(', ')}`);
}
if (missingTagsEntries.length) {
  issues.push(`entries without tags: ${unique(missingTagsEntries).join(', ')}`);
}
if (invalidTagEntries.length) {
  issues.push(`entries with invalid tags: ${unique(invalidTagEntries).join(', ')}`);
}
if (invalidMembershipEntries.length) {
  issues.push(`entries with invalid membership values: ${unique(invalidMembershipEntries).join(', ')}`);
}
if (invalidPriceEntries.length) {
  issues.push(`entries with invalid price values: ${unique(invalidPriceEntries).join(', ')}`);
}

if (issues.length) {
  console.error(['Catalog coverage audit failed:', ...issues.map(issue => `- ${issue}`)].join('\n'));
  process.exitCode = 1;
}
