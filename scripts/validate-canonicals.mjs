import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function expect(condition, message, issues) {
  if (!condition) issues.push(message);
}

function countMatches(source, pattern) {
  const matches = source.match(pattern);
  return matches ? matches.length : 0;
}

const issues = [];

const landingPageSource = read('src/app/landing-pages/[slug]/page.tsx');
expect(
  landingPageSource.includes('function landingPageCanonical(slug: string): string'),
  'landing-pages/[slug] should define a single self-canonical helper',
  issues
);
expect(
  countMatches(landingPageSource, /alternates:\s*\{\s*canonical,\s*/g) >= 1,
  'landing-pages/[slug] metadata should set canonical to the landing page URL',
  issues
);
expect(
  landingPageSource.includes('if (!seo)') &&
    landingPageSource.includes('robots: {\n        index: false,\n        follow: false,\n      },'),
  'landing-pages/[slug] should mark the not-found branch as noindex, follow',
  issues
);

const pricingLayoutSource = read('src/app/pricing/layout.tsx');
expect(
  pricingLayoutSource.includes("canonical: '/prices'"),
  '/pricing should canonicalize to /prices',
  issues
);
expect(
  !pricingLayoutSource.includes('index: false'),
  '/pricing should rely on its permanent redirect instead of emitting noindex',
  issues
);

const pricesPageSource = read('src/app/prices/page.tsx');
expect(
  pricesPageSource.includes("canonical: '/prices'"),
  '/prices should remain the canonical pricing URL',
  issues
);

const proxySource = read('src/proxy.ts');
expect(
  proxySource.includes("pathname === '/pricing' || pathname.startsWith('/pricing/')"),
  'proxy should redirect /pricing to /prices',
  issues
);
expect(
  proxySource.includes('rel="canonical"') &&
    proxySource.includes('https://www.prompstudio.com/landing-pages/'),
  'proxy should canonicalize raw /webpages content to its landing page',
  issues
);

const report = {
  checked: [
    'src/app/landing-pages/[slug]/page.tsx',
    'src/app/pricing/layout.tsx',
    'src/app/prices/page.tsx',
    'src/proxy.ts',
  ],
  issues,
};

//console.log(JSON.stringify(report, null, 2));

if (issues.length) {
  process.exitCode = 1;
}
