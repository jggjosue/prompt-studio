import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const catalogPath = path.join(repoRoot, 'public', 'webpages', 'web-pages.json');
const landingPagePath = 'src/app/landing-pages/[slug]/page.tsx';
const landingHubPath = 'src/components/web-page-card.tsx';

const HEAVY_SCRIPT_PATTERNS = [
  'cdnjs.cloudflare.com/ajax/libs/three.js',
  'cdnjs.cloudflare.com/ajax/libs/gsap',
  'js.stripe.com/v3/buy-button.js',
  'cdn.tailwindcss.com',
  'unpkg.com/@studio-freight/lenis',
  'unpkg.com/lucide',
  'https://images.unsplash.com/',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/',
];

function read(filePath) {
  const normalized = path.isAbsolute(filePath) ? filePath : path.join(repoRoot, filePath);
  return fs.readFileSync(normalized, 'utf8');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pickLocalized(value) {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return value.en || value.es || '';
}

function wordCount(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean).length;
}

function countMatches(source, pattern) {
  const matches = source.match(pattern);
  return matches ? matches.length : 0;
}

const issues = [];

const landingSource = read(landingPagePath);
if (!landingSource.includes('safeJsonLd(')) {
  issues.push('landing detail page should use safeJsonLd for schema');
}
if (!landingSource.includes('<OptimizedImage')) {
  issues.push('landing detail page should use OptimizedImage for LCP control');
}
if (!landingSource.includes('priority')) {
  issues.push('landing detail page should prioritize the hero image');
}
if (!landingSource.includes('lazyAdaptive={false}')) {
  issues.push('landing detail page should disable adaptive lazy loading for the hero image');
}
if (!landingSource.includes('<img')) {
  // no-op: using next/image wrapper is okay
}

const hubSource = read(landingHubPath);
if (!hubSource.includes('lazyAdaptive')) {
  issues.push('landing cards should use adaptive lazy loading for catalog images');
}
if (!hubSource.includes('priority={animationIndex < 2}') && !hubSource.includes('priority={index < 2}')) {
  issues.push('landing cards should only prioritize the first visible items');
}

const catalog = readJson(catalogPath);
const entries = Array.isArray(catalog.webPages) ? catalog.webPages : [];
for (const entry of entries) {
  const title = pickLocalized(entry.title);
  const description = pickLocalized(entry.description);
  const slug = String(entry.demoUrl ?? '').trim();
  const imageUrl = String(entry.imageUrl ?? '').trim();
  const normalizedImage = imageUrl.toLowerCase();
  const descriptionWords = wordCount(description);

  if (!slug) {
    issues.push(`catalog entry "${title}" is missing demoUrl`);
  }

  if (descriptionWords > 60 && normalizedImage.includes('unsplash')) {
    issues.push(`catalog entry "${slug}" uses remote unsplash imagery that may hurt LCP`);
  }

  const isLanding = true;
  if (isLanding && !imageUrl) {
    issues.push(`catalog entry "${slug}" should define a preview image`);
  }
}

const publicWebpagesDir = path.join(repoRoot, 'public', 'webpages');
const folders = fs.existsSync(publicWebpagesDir)
  ? fs.readdirSync(publicWebpagesDir, { withFileTypes: true }).filter(d => d.isDirectory())
  : [];

const heavyScriptFindings = [];
for (const folder of folders) {
  const folderPath = path.join(publicWebpagesDir, folder.name);
  const indexPath = path.join(folderPath, 'index.html');
  if (!fs.existsSync(indexPath)) continue;
  const source = fs.readFileSync(indexPath, 'utf8');
  const hasHeavyScript = HEAVY_SCRIPT_PATTERNS.some(pattern => source.includes(pattern));
  const scripts = countMatches(source, /<script\b/gi);
  const images = countMatches(source, /<img\b/gi);
  const videos = countMatches(source, /<video\b/gi);

  if (hasHeavyScript) {
    heavyScriptFindings.push({
      slug: folder.name,
      scripts,
      images,
      videos,
      heavyScripts: HEAVY_SCRIPT_PATTERNS.filter(pattern => source.includes(pattern)),
    });
  }
}

if (heavyScriptFindings.length) {
  issues.push(
    ...heavyScriptFindings.map(finding =>
      `heavy scripts in ${finding.slug}: ${finding.heavyScripts.join(', ')}`
    )
  );
}

const report = {
  checked: [
    'src/app/landing-pages/[slug]/page.tsx',
    'src/app/landing-pages/landing-pages-client.tsx',
    'public/webpages/web-pages.json',
    'public/webpages/*/index.html',
  ],
  landingCount: entries.length,
  heavyScriptFindings,
  issues,
};

//console.log(JSON.stringify(report, null, 2));

if (issues.length) {
  process.exitCode = 1;
}
