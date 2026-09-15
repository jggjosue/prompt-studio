import fs from 'fs';
import path from 'path';

const repoRoot = process.cwd();

function read(filePath) {
  return fs.readFileSync(path.join(repoRoot, filePath), 'utf8');
}

function exists(filePath) {
  return fs.existsSync(path.join(repoRoot, filePath));
}

const issues = [];

const robotsSource = read('src/app/robots.ts');
if (!robotsSource.includes("allow: '/'")) {
  issues.push('src/app/robots.ts should allow the site root');
}
for (const disallowed of ['/api/*', '/dashboard/*', '/admin/*']) {
  if (!robotsSource.includes(disallowed)) {
    issues.push(`src/app/robots.ts should disallow ${disallowed}`);
  }
}
if (!robotsSource.includes("sitemap: `${SITE_URL}/sitemap.xml`")) {
  issues.push('src/app/robots.ts should point to sitemap.xml');
}

const proxySource = read('src/proxy.ts');
if (
  !proxySource.includes('rel="canonical"') ||
  !proxySource.includes('https://www.prompstudio.com/landing-pages/')
) {
  issues.push('src/proxy.ts should canonicalize /webpages/* HTML to /landing-pages/*');
}
if (!proxySource.includes("pathname.startsWith('/webpages/')")) {
  issues.push('src/proxy.ts should target /webpages/* for robots headers');
}

if (exists('public/robots.txt')) {
  issues.push('public/robots.txt exists and may compete with src/app/robots.ts');
}

const staticResourceSignals = [
  '_next',
  '/public/',
  '/assets/',
  '.css',
  '.js',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
];

const blockedSignals = staticResourceSignals.filter(signal => robotsSource.includes(signal));
if (blockedSignals.length) {
  issues.push(
    `src/app/robots.ts should not block static/resource paths, but found signals: ${blockedSignals.join(', ')}`
  );
}

const report = {
  checked: [
    'src/app/robots.ts',
    'src/proxy.ts',
    'public/robots.txt',
  ],
  issues,
  status: issues.length ? 'fail' : 'pass',
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
