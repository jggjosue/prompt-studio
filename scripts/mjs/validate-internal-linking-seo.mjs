import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();
const catalogPath = path.join(repoRoot, 'src', 'data', 'web-pages.json');

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const issues = [];

const headerSource = read('src/components/layout/header-client.tsx');
for (const route of ['/landing-pages', '/prices', '/affiliate-program']) {
  if (!headerSource.includes(route)) {
    issues.push(`header should link to ${route}`);
  }
}

const footerSource = read('src/components/layout/footer.tsx');
if (!footerSource.includes('getFooterLinkGroups')) {
  issues.push('footer should consume the internal link graph');
}

const linkGraphSource = read('src/lib/internal-link-graph.ts');
for (const route of ['/landing-pages', '/web-tags', '/prices', '/affiliate-program']) {
  if (!linkGraphSource.includes(route)) {
    issues.push(`internal link graph should include ${route}`);
  }
}

const landingPagesSource = read('src/app/[locale]/landing-pages/landing-pages-client.tsx');
if (!landingPagesSource.includes('RelatedInternalLinks')) {
  issues.push('landing-pages hub should include related internal links');
}
if (!landingPagesSource.includes('WebPageCard')) {
  issues.push('landing-pages hub should render web page cards');
}

const cardSource = read('src/components/web-page-card.tsx');
if (!cardSource.includes('/landing-pages/${encodeURIComponent(page.demoUrl)}')) {
  issues.push('web page cards should expose a canonical landing-pages link');
}
const relatedTemplatesSource = read('src/components/related-templates.tsx');
if (!relatedTemplatesSource.includes('/landing-pages/${encodeURIComponent(template.slug)}')) {
  issues.push('related templates should link to canonical landing pages');
}

const catalog = readJson(catalogPath);
const landingSlugs = (Array.isArray(catalog.webPages) ? catalog.webPages : [])
  .map(entry => String(entry?.demoUrl ?? '').trim())
  .filter(Boolean);

if (landingSlugs.length === 0) {
  issues.push('catalog should expose landing slugs for internal linking');
}

const report = {
  checked: [
    'src/components/layout/header-client.tsx',
    'src/components/layout/footer.tsx',
    'src/app/[locale]/landing-pages/landing-pages-client.tsx',
    'src/components/web-page-card.tsx',
    'src/components/related-templates.tsx',
    'src/data/web-pages.json',
  ],
  landingCount: landingSlugs.length,
  issues,
};

/*
 * El informe se construía y nunca se imprimía: el validador podía fallar sin
 * decir qué había encontrado. Queda tras `SEO_REPORT=1` para no ensuciar la
 * salida normal de CI.
 */
if (process.env.SEO_REPORT === '1') console.log(JSON.stringify(report, null, 2));

if (issues.length) {
  console.error(issues.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Enlazado interno válido: ${landingSlugs.length} landing pages revisadas.`);
}
