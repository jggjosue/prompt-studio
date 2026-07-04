import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function hasSafeEscape(source) {
  return source.includes('safeJsonLd(') || source.includes('\\u003c');
}

const checks = [
  {
    file: 'src/app/landing-pages/[slug]/page.tsx',
    expectations: ['@type', 'Product', 'Offer', 'BreadcrumbList'],
  },
  {
    file: 'src/app/gallery/[id]/page.tsx',
    expectations: ['@type', 'Product', 'Offer', 'BreadcrumbList'],
  },
  {
    file: 'src/app/gallery-videos/[id]/page.tsx',
    expectations: ['@type', 'Product', 'Offer', 'BreadcrumbList'],
  },
  {
    file: 'src/components/site-breadcrumbs.tsx',
    expectations: ['BreadcrumbList'],
  },
];

const issues = [];

for (const check of checks) {
  const source = read(check.file);
  for (const expected of check.expectations) {
    if (!source.includes(expected)) {
      issues.push(`${check.file} is missing ${expected}`);
    }
  }
  if (!hasSafeEscape(source)) {
    issues.push(`${check.file} should use safe JSON-LD escaping`);
  }
}

const landingSource = read('src/app/landing-pages/[slug]/page.tsx');
if (!landingSource.includes('price: seo.price')) {
  issues.push('landing-pages/[slug] should bind Offer.price to the normalized SEO price');
}
if (!landingSource.includes('description: schemaDescription(seo.description, seo.title)')) {
  issues.push('landing-pages/[slug] should normalize Product.description for merchant listings');
}
if (!landingSource.includes('shippingDetails: digitalDeliveryDetails()')) {
  issues.push('landing-pages/[slug] should describe free immediate digital delivery');
}
if (!landingSource.includes('hasMerchantReturnPolicy: digitalProductReturnPolicy(SITE_URL)')) {
  issues.push('landing-pages/[slug] should expose the digital product return policy');
}

const gallerySource = read('src/app/gallery/[id]/page.tsx');
if (!gallerySource.includes("price: '0.00'")) {
  issues.push('gallery/[id] should emit free Offer.price = 0.00');
}

const galleryVideoSource = read('src/app/gallery-videos/[id]/page.tsx');
if (!galleryVideoSource.includes("price: '0.00'")) {
  issues.push('gallery-videos/[id] should emit free Offer.price = 0.00');
}

const report = {
  checked: checks.map(check => check.file),
  issues,
};

//console.log(JSON.stringify(report, null, 2));

if (issues.length) {
  process.exitCode = 1;
}
