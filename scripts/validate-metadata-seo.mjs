import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const catalogPath = path.join(repoRoot, 'public', 'webpages', 'web-pages.json');

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function unique(values) {
  return Array.from(new Set(values));
}

function normalizeText(value) {
  return String(value ?? '').replace(/\s+/g, ' ').trim();
}

function extractStringLiteral(source, key) {
  const patterns = [
    new RegExp(`${key}\\s*:\\s*'([^']+)'`, 'm'),
    new RegExp(`${key}\\s*:\\s*"([^"]+)"`, 'm'),
  ];
  for (const pattern of patterns) {
    const match = source.match(pattern);
    if (match) return normalizeText(match[1]);
  }
  return '';
}

function inspectFile(filePath) {
  const source = read(filePath);
  const hasMetadata = source.includes('export const metadata') || source.includes('generateMetadata(');
  const hasOpenGraph = source.includes('openGraph:');
  const hasTwitter = source.includes('twitter:');
  const hasKeywords = source.includes('keywords:');
  const isMarketingPage =
    filePath.startsWith('src/app/landing-pages/') ||
    filePath === 'src/app/prices/page.tsx' ||
    filePath === 'src/app/landing-pages/page.tsx' ||
    filePath === 'src/app/affiliate-program/page.tsx';

  const title = extractStringLiteral(source, 'title');
  const description = extractStringLiteral(source, 'description');
  const dynamicTitle = source.includes('const title =') || source.includes('title = t(');
  const dynamicDescription =
    source.includes('const description =') || source.includes('description = t(');

  return {
    filePath,
    hasMetadata,
    hasOpenGraph,
    hasTwitter,
    hasKeywords,
    title,
    description,
    dynamicTitle,
    dynamicDescription,
    isMarketingPage,
  };
}

const pages = [
  'src/app/landing-pages/[slug]/page.tsx',
  'src/app/landing-pages/page.tsx',
  'src/app/prices/page.tsx',
  'src/app/pricing/layout.tsx',
  'src/app/affiliate-program/page.tsx',
];

const landingCatalog = readJson(catalogPath).webPages ?? [];
const landingTitles = landingCatalog
  .map(entry => normalizeText(entry?.title?.en ?? entry?.title?.es ?? ''))
  .filter(Boolean);
const landingDescriptions = landingCatalog
  .map(entry => normalizeText(entry?.description?.en ?? entry?.description?.es ?? ''))
  .filter(Boolean);

const duplicateLandingTitles = landingTitles.filter(
  (title, index, arr) => arr.indexOf(title) !== index
);
const duplicateLandingDescriptions = landingDescriptions.filter(
  (description, index, arr) => arr.indexOf(description) !== index
);

const issues = [];

if (duplicateLandingTitles.length) {
  issues.push(
    `landing pages have duplicate titles: ${unique(duplicateLandingTitles).join(', ')}`
  );
}
if (duplicateLandingDescriptions.length) {
  issues.push(
    `landing pages have duplicate descriptions: ${unique(duplicateLandingDescriptions).join(', ')}`
  );
}

const inspected = pages
  .filter(filePath => fs.existsSync(path.join(repoRoot, filePath)))
  .map(inspectFile);

for (const page of inspected) {
  if (!page.hasMetadata) {
    issues.push(`${page.filePath} should export metadata or generateMetadata`);
  }
  if (!page.title && !page.dynamicTitle) {
    issues.push(`${page.filePath} is missing a detectable title`);
  } else if (page.title && page.title.length < 8) {
    issues.push(`${page.filePath} title is too short to be descriptive`);
  }
  if (!page.description && !page.dynamicDescription) {
    issues.push(`${page.filePath} is missing a detectable description`);
  } else if (page.description && page.description.length < 40) {
    issues.push(`${page.filePath} description is too short to be descriptive`);
  }
  if (page.isMarketingPage && !page.hasOpenGraph) {
    issues.push(`${page.filePath} should define openGraph metadata`);
  }
  if (page.isMarketingPage && !page.hasTwitter) {
    issues.push(`${page.filePath} should define twitter metadata`);
  }
  if (page.hasKeywords && page.isMarketingPage && (!page.hasOpenGraph || !page.hasTwitter)) {
    issues.push(`${page.filePath} uses keywords but is missing social metadata`);
  }
}

const report = {
  catalogPath: path.relative(repoRoot, catalogPath),
  landingPageCount: landingCatalog.length,
  inspected: inspected.map(page => ({
    file: page.filePath,
    title: page.title,
    description: page.description,
    dynamicTitle: page.dynamicTitle,
    dynamicDescription: page.dynamicDescription,
    hasOpenGraph: page.hasOpenGraph,
    hasTwitter: page.hasTwitter,
    hasKeywords: page.hasKeywords,
  })),
  issues,
};

//console.log(JSON.stringify(report, null, 2));

if (issues.length) {
  process.exitCode = 1;
}
