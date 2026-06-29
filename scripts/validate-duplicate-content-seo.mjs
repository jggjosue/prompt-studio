import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const catalogPath = path.join(repoRoot, 'public', 'webpages', 'web-pages.json');

const STOPWORDS = new Set([
  'and', 'or', 'the', 'a', 'an', 'of', 'for', 'to', 'with', 'in', 'on', 'by', 'from',
  'de', 'la', 'el', 'y', 'o', 'para', 'con', 'en', 'por', 'del', 'al', 'las', 'los',
  'page', 'pages', 'landing', 'template', 'templates', 'prompt', 'prompts', 'demo',
  'demos', 'html', 'css', 'javascript', 'next', 'js', 'website', 'web', 'landing-page'
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickText(field) {
  if (typeof field === 'string') return field;
  if (!field || typeof field !== 'object') return '';
  return field.en || field.es || '';
}

function tokens(value) {
  return normalizeText(value)
    .split(' ')
    .filter(token => token && !STOPWORDS.has(token));
}

function jaccard(a, b) {
  const setA = new Set(a);
  const setB = new Set(b);
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = [...setA].filter(token => setB.has(token)).length;
  const union = new Set([...setA, ...setB]).size || 1;
  return intersection / union;
}

function ngrams(list, size = 2) {
  const out = [];
  for (let i = 0; i <= list.length - size; i += 1) {
    out.push(list.slice(i, i + size).join(' '));
  }
  return out;
}

const catalog = readJson(catalogPath);
const pages = Array.isArray(catalog.webPages) ? catalog.webPages : [];

const items = pages.map((page, index) => {
  const title = pickText(page.title);
  const description = pickText(page.description);
  const slug = String(page.demoUrl ?? '').trim();
  const keywordTokens = [
    ...tokens(title),
    ...tokens(description),
    ...page.tags.flatMap(tag => tokens(tag)),
    ...tokens(slug.replace(/-/g, ' ')),
  ];

  return {
    id: page.id ?? `row-${index + 1}`,
    slug,
    title,
    description,
    titleTokens: tokens(title),
    descriptionTokens: tokens(description),
    keywordTokens: Array.from(new Set(keywordTokens)),
    titleBigrams: ngrams(tokens(title), 2),
  };
});

function buildClusters(metric, threshold) {
  const clusters = [];
  const used = new Set();
  for (let i = 0; i < items.length; i += 1) {
    if (used.has(i)) continue;
    const base = items[i];
    const cluster = [base];
    for (let j = i + 1; j < items.length; j += 1) {
      if (used.has(j)) continue;
      const other = items[j];
      const score = metric(base, other);
      if (score >= threshold) {
        cluster.push(other);
        used.add(j);
      }
    }
    if (cluster.length > 1) {
      clusters.push(cluster);
    }
  }
  return clusters;
}

const titleClusters = buildClusters(
  (a, b) => Math.max(
    jaccard(a.titleTokens, b.titleTokens),
    jaccard(a.titleBigrams, b.titleBigrams)
  ),
  0.55
);

const descriptionClusters = buildClusters(
  (a, b) => jaccard(a.descriptionTokens, b.descriptionTokens),
  0.42
);

const semanticClusters = buildClusters(
  (a, b) => jaccard(a.keywordTokens, b.keywordTokens),
  0.5
);

const issues = [];

if (titleClusters.length) {
  issues.push(
    ...titleClusters.map(cluster =>
      `similar titles: ${cluster.map(item => `${item.title} [${item.slug}]`).join(' | ')}`
    )
  );
}

if (descriptionClusters.length) {
  issues.push(
    ...descriptionClusters.map(cluster =>
      `repeated descriptions: ${cluster.map(item => `${item.slug}`).join(' | ')}`
    )
  );
}

if (semanticClusters.length) {
  issues.push(
    ...semanticClusters.map(cluster =>
      `semantic competition: ${cluster
        .map(item => `${item.slug} (${item.keywordTokens.slice(0, 5).join(', ')})`)
        .join(' | ')}`
    )
  );
}

const report = {
  catalogPath: path.relative(repoRoot, catalogPath),
  totalPages: items.length,
  titleClusters: titleClusters.map(cluster => cluster.map(item => item.slug)),
  descriptionClusters: descriptionClusters.map(cluster => cluster.map(item => item.slug)),
  semanticClusters: semanticClusters.map(cluster => cluster.map(item => item.slug)),
  issues,
};

//console.log(JSON.stringify(report, null, 2));

if (issues.length) {
  process.exitCode = 1;
}
