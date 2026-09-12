/*
 * Las páginas viven bajo `src/app/[locale]/…` desde que la detección de idioma
 * se movió al middleware. Estas rutas apuntaban al sitio antiguo, así que el
 * validador moría con ENOENT sin comprobar nada.
 */
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

const landingPageSource = read('src/app/[locale]/landing-pages/[slug]/page.tsx');
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


const pricesPageSource = read('src/app/[locale]/prices/page.tsx');
expect(
  pricesPageSource.includes("canonical: '/prices'"),
  '/prices should remain the canonical pricing URL',
  issues
);

const proxySource = read('src/proxy.ts');
/*
 * El proxy compara la ruta **sin prefijo de idioma** desde que el idioma se
 * detecta en el middleware: así `/es/pricing` llega a `/prices` en un solo
 * salto. Esta comprobación esperaba la forma anterior (`pathname === …`) y por
 * tanto habría fallado en cuanto el validador volviera a ejecutarse.
 */
expect(
  /canonicalPath === '\/pricing'/.test(proxySource) &&
    /permanentRedirect\(req, '\/prices'\)/.test(proxySource),
  'proxy should permanently redirect /pricing to /prices',
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
    'src/app/[locale]/landing-pages/[slug]/page.tsx',
    'src/app/[locale]/prices/page.tsx',
    'src/proxy.ts',
  ],
  issues,
};

/*
 * El informe se construía y nunca se imprimía: el validador podía fallar sin
 * decir qué había encontrado. Queda tras `SEO_REPORT=1` para no ensuciar la
 * salida normal de CI.
 */
if (process.env.SEO_REPORT === '1') console.log(JSON.stringify(report, null, 2));

if (issues.length) {
  console.error(`${issues.length} problema(s):`);
  for (const issue of issues) console.error(`- ${issue}`);
  process.exitCode = 1;
}
