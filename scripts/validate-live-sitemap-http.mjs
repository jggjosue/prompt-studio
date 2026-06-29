import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const webpagesDir = path.join(repoRoot, 'public', 'webpages');
const catalogPath = path.join(webpagesDir, 'web-pages.json');
const DEFAULT_SITE_URL = 'https://www.prompstudio.com';
const IGNORE_SLUGS = new Set(['refactory-online']);
const TIMEOUT_MS = 15000;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeSlug(value) {
  return String(value ?? '').trim();
}

function unique(values) {
  return Array.from(new Set(values));
}

function normalizeSiteUrl(value) {
  return String(value ?? '').trim().replace(/\/$/, '') || DEFAULT_SITE_URL;
}

function slugPath(prefix, slug) {
  const encodedSlug = slug.split('/').map(encodeURIComponent).join('/');
  return `${prefix}/${encodedSlug}`;
}

async function requestStatus(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new Error('timeout')), TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method,
      redirect: 'manual',
      signal: controller.signal,
    });
    const location = response.headers.get('location');
    return {
      ok: response.ok,
      status: response.status,
      finalUrl: response.url,
      location,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error?.message ?? String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
const catalog = readJson(catalogPath);
const entries = Array.isArray(catalog.webPages) ? catalog.webPages : [];

const landingSlugs = unique(
  entries
    .map(entry => normalizeSlug(entry?.demoUrl))
    .filter(slug => Boolean(slug) && !IGNORE_SLUGS.has(slug))
);

const staticPaths = [
  '/',
  '/prompts',
  '/image-prompts',
  '/video-prompts',
  '/landing-pages',
  '/image-tags',
  '/video-tags',
  '/web-tags',
  '/prices',
  '/affiliate-program',
];

const urls = unique([
  ...staticPaths,
  ...landingSlugs.map(slug => slugPath('/landing-pages', slug)),
]).map(route => `${siteUrl}${route}`);

const results = [];
const failures = [];

for (const url of urls) {
  const head = await requestStatus(url, 'HEAD');
  let result = { url, method: 'HEAD', ...head };

  if (!head.ok && [405, 403].includes(head.status)) {
    const get = await requestStatus(url, 'GET');
    result = { url, method: 'GET', ...get, fallbackFrom: 'HEAD' };
  }

  results.push(result);
  if (!result.ok || result.status !== 200) {
    failures.push(result);
  }
}

const report = {
  siteUrl,
  catalogPath: path.relative(repoRoot, catalogPath),
  checkedUrls: results.length,
  failures: failures.map(item => ({
    url: item.url,
    method: item.method,
    status: item.status,
    error: item.error,
    fallbackFrom: item.fallbackFrom,
    location: item.location,
    finalUrl: item.finalUrl,
  })),
  redirects: results
    .filter(item => item.status >= 300 && item.status < 400)
    .map(item => ({
      url: item.url,
      method: item.method,
      status: item.status,
      location: item.location,
    })),
};

//console.log(JSON.stringify(report, null, 2));

if (failures.length) {
  console.error(
    [
      'Live sitemap HTTP validation failed:',
      ...failures.map(
        item =>
          `- ${item.method} ${item.url} -> ${item.status || 'ERR'}${item.location ? ` [${item.location}]` : ''}${item.error ? ` (${item.error})` : ''}`
      ),
    ].join('\n')
  );
  process.exitCode = 1;
}
