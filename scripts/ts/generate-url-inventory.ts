import fs from 'node:fs';
import path from 'node:path';

import sitemap from '../../src/app/sitemap';
import { promptModels } from '../../src/lib/models-list';

const PRODUCTION_ORIGIN = 'https://www.prompstudio.com';
const OUTPUT_FILE = 'URLS_ACTUALES.md';
const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

type RouteRecord = {
  pattern: string;
  source: string;
  methods?: string[];
};

function walkFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function routeSegment(segment: string): string | null {
  if (/^\(.+\)$/.test(segment)) return null;

  const optionalCatchAll = segment.match(/^\[\[\.\.\.(.+)\]\]$/);
  if (optionalCatchAll) return `:${optionalCatchAll[1]}*?`;

  const catchAll = segment.match(/^\[\.\.\.(.+)\]$/);
  if (catchAll) return `:${catchAll[1]}*`;

  const dynamic = segment.match(/^\[(.+)\]$/);
  if (dynamic) return `:${dynamic[1]}`;

  return segment;
}

function routePattern(filePath: string, appRoot: string): string {
  const relative = path.relative(appRoot, filePath).replace(/\\/g, '/');
  const withoutFile = relative.replace(/\/(?:page|route)\.(?:ts|tsx|js|jsx)$/, '');
  const segments = withoutFile
    .split('/')
    .filter(Boolean)
    .filter(segment => segment !== '[locale]')
    .map(routeSegment)
    .filter((segment): segment is string => Boolean(segment));

  return segments.length ? `/${segments.join('/')}` : '/';
}

function publicPath(pattern: string): string {
  return pattern
    .replace(/\/:([^/]+)\*\?$/, '')
    .replace(/\/$/, '') || '/';
}

function exportedMethods(filePath: string): string[] {
  const source = fs.readFileSync(filePath, 'utf8');
  return HTTP_METHODS.filter(method =>
    new RegExp(`export\\s+(?:async\\s+)?(?:function|const)\\s+${method}\\b`).test(source)
  );
}

function asProductionUrl(pathname: string): string {
  return `${PRODUCTION_ORIGIN}${pathname === '/' ? '/' : pathname}`;
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function markdownUrlList(paths: string[]): string {
  return paths.map(pathname => `- ${asProductionUrl(pathname)}`).join('\n');
}

function markdownPatternList(routes: RouteRecord[]): string {
  return routes
    .map(route => {
      const methodLabel = route.methods?.length ? ` — ${route.methods.join(', ')}` : '';
      return `- \`${route.pattern}\`${methodLabel} — \`${route.source}\``;
    })
    .join('\n');
}

function modelPath(model: string): string {
  const slug = model.toLowerCase().replace(/\s+/g, '-');
  return `/prompts/${encodeURIComponent(slug)}`;
}

async function main(): Promise<void> {
  const repoRoot = process.cwd();
  const appRoot = path.join(repoRoot, 'src', 'app');
  const allAppFiles = walkFiles(appRoot);

  const pageRoutes: RouteRecord[] = allAppFiles
    .filter(file => /\/page\.(?:ts|tsx|js|jsx)$/.test(file))
    .map(file => ({
      pattern: routePattern(file, appRoot),
      source: path.relative(repoRoot, file).replace(/\\/g, '/'),
    }))
    .sort((a, b) => a.pattern.localeCompare(b.pattern));

  const routeHandlers: RouteRecord[] = allAppFiles
    .filter(file => /\/route\.(?:ts|tsx|js|jsx)$/.test(file))
    .map(file => ({
      pattern: routePattern(file, appRoot),
      source: path.relative(repoRoot, file).replace(/\\/g, '/'),
      methods: exportedMethods(file),
    }))
    .sort((a, b) => a.pattern.localeCompare(b.pattern));

  const apiRoutes = routeHandlers.filter(route => route.pattern.startsWith('/api/'));
  const nonApiHandlers = routeHandlers.filter(route => !route.pattern.startsWith('/api/'));

  const staticPagePaths = uniqueSorted(
    pageRoutes
      .filter(route => !route.pattern.includes(':') || route.pattern.includes('*?'))
      .map(route => publicPath(route.pattern))
  );

  const sitemapEntries = await sitemap();
  const sitemapPaths = uniqueSorted(
    sitemapEntries.map(entry => new URL(entry.url).pathname || '/')
  );

  const landingPagePaths = sitemapPaths.filter(pathname =>
    /^\/landing-pages\/[^/]+$/.test(pathname)
  );
  const landingUtilityPaths = uniqueSorted(
    landingPagePaths.flatMap(pathname => [
      `${pathname}/preview`,
      `${pathname}/edit`,
    ])
  );
  const rawDemoPaths = uniqueSorted(
    landingPagePaths.map(pathname =>
      pathname.replace('/landing-pages/', '/webpages/').concat('/index.html')
    )
  );
  const modelPaths = uniqueSorted(promptModels.map(modelPath));

  const knownConcretePaths = uniqueSorted([
    ...staticPagePaths,
    ...sitemapPaths,
    ...landingUtilityPaths,
    ...rawDemoPaths,
    ...modelPaths,
  ]);

  const sitemapOnlyPaths = sitemapPaths.filter(pathname => !staticPagePaths.includes(pathname));
  const modelOnlyPaths = modelPaths.filter(pathname => !knownConcretePaths.includes(pathname) || !sitemapPaths.includes(pathname));

  const dynamicPageRoutes = pageRoutes.filter(route => route.pattern.includes(':'));
  const unresolvedDynamicPageRoutes = dynamicPageRoutes.filter(route =>
    route.pattern.startsWith('/review/') || route.pattern.includes('*')
  );

  const infrastructurePaths = [
    '/manifest.webmanifest',
    '/robots.txt',
    '/sitemap.xml',
    '/sw.js',
  ];

  const redirectAliases = [
    '`/pricing` → `/prices`',
    '`/gallery/:numericId` → `/gallery/img-:numericId`',
    '`/webpages/instagram-clone` → `/landing-pages`',
    '`/landing-pages/samsung-clone` → `/landing-pages`',
    '`/landing-pages/cozyloft-home-decor` → `/landing-pages`',
    '`/landing-pages/voltgear-tech-shop` → `/landing-pages/3d-tech-showroom-pro`',
    '`/landing-pages/motionlab-freelance-video` → `/landing-pages/3d-photography-portfolio-video-projections`',
    '`/landing-pages/magzin-job-html-css` → `/landing-pages/magzin-job-dark`',
  ];

  const sitemapGroups = [
    ['Páginas base del sitemap', sitemapPaths.filter(pathname => !/^\/(?:category|tags|landing-pages\/|gallery\/|gallery-videos\/)/.test(pathname))],
    ['Categorías programáticas', sitemapPaths.filter(pathname => pathname.startsWith('/category/'))],
    ['Etiquetas programáticas', sitemapPaths.filter(pathname => pathname.startsWith('/tags/'))],
    ['Landing pages canónicas', landingPagePaths],
    ['Galería de imágenes', sitemapPaths.filter(pathname => pathname.startsWith('/gallery/'))],
    ['Galería de videos', sitemapPaths.filter(pathname => pathname.startsWith('/gallery-videos/'))],
  ] as const;

  const generatedAt = new Date().toISOString();
  const lines: string[] = [
    '# Inventario actual de URLs',
    '',
    `Generado: ${generatedAt}`,
    '',
    `Dominio de referencia: ${PRODUCTION_ORIGIN}`,
    '',
    '## Resumen',
    '',
    '| Grupo | Cantidad |',
    '|---|---:|',
    `| URLs de páginas concretas conocidas | ${knownConcretePaths.length} |`,
    `| URLs canónicas incluidas en sitemap | ${sitemapPaths.length} |`,
    `| Demos HTML concretas no canónicas | ${rawDemoPaths.length} |`,
    `| Rutas de página declaradas en Next.js | ${pageRoutes.length} |`,
    `| Patrones de página dinámicos | ${dynamicPageRoutes.length} |`,
    `| Patrones API | ${apiRoutes.length} |`,
    `| Route handlers fuera de API | ${nonApiHandlers.length} |`,
    `| Endpoints de infraestructura | ${infrastructurePaths.length} |`,
    `| Alias y redirecciones documentadas | ${redirectAliases.length} |`,
    '',
    '> El total de páginas concretas elimina duplicados. Los patrones dinámicos y APIs se cuentan aparte porque pueden producir un número variable de URLs según IDs, tokens o datos de la base de datos.',
    '',
    '> Las URLs públicas no llevan `/en` ni `/es`: el middleware selecciona el idioma internamente y redirige cualquier prefijo de idioma a la URL canónica.',
    '',
    '## 1. Páginas estáticas de la aplicación',
    '',
    `Total: **${staticPagePaths.length}**`,
    '',
    markdownUrlList(staticPagePaths),
    '',
    '## 2. URLs canónicas del sitemap',
    '',
    `Total: **${sitemapPaths.length}**`,
    '',
  ];

  for (const [title, paths] of sitemapGroups) {
    lines.push(`### ${title} (${paths.length})`, '', markdownUrlList([...paths]), '');
  }

  lines.push(
    '## 3. Páginas de modelos de prompts',
    '',
    `Total: **${modelPaths.length}**`,
    '',
    markdownUrlList(modelPaths),
    '',
    '## 4. Previews y editores de landing pages',
    '',
    `Total: **${landingUtilityPaths.length}** (${landingPagePaths.length} previews + ${landingPagePaths.length} editores)`,
    '',
    markdownUrlList(landingUtilityPaths),
    '',
    '## 5. Demos HTML no canónicas',
    '',
    `Total: **${rawDemoPaths.length}**`,
    '',
    '> Estas URLs muestran los demos publicados. Su URL canónica correspondiente está bajo `/landing-pages/:slug`.',
    '',
    markdownUrlList(rawDemoPaths),
    '',
    '## 6. Patrones de páginas dinámicas',
    '',
    `Total: **${dynamicPageRoutes.length}**`,
    '',
    markdownPatternList(dynamicPageRoutes),
    '',
    '### Patrones cuyo total no se puede resolver sin datos externos',
    '',
    unresolvedDynamicPageRoutes.length
      ? markdownPatternList(unresolvedDynamicPageRoutes)
      : '- Ninguno',
    '',
    '## 7. Endpoints API',
    '',
    `Total: **${apiRoutes.length}** patrones`,
    '',
    markdownPatternList(apiRoutes),
    '',
    '## 8. Route handlers fuera de `/api`',
    '',
    `Total: **${nonApiHandlers.length}**`,
    '',
    nonApiHandlers.length ? markdownPatternList(nonApiHandlers) : '- Ninguno',
    '',
    '## 9. Endpoints de infraestructura',
    '',
    markdownUrlList(infrastructurePaths),
    '',
    '## 10. Alias y redirecciones',
    '',
    ...redirectAliases.map(alias => `- ${alias}`),
    '',
    '## Criterio del inventario',
    '',
    '- Se incluyen las páginas declaradas en `src/app`, las URLs generadas por `src/app/sitemap.ts`, los modelos de `src/lib/models-list.ts`, las variantes preview/edit y los demos HTML de cada landing page conocida.',
    '- Las rutas con IDs, tokens o slugs almacenados en MongoDB se muestran como patrones y no se inventan valores.',
    '- Los parámetros de consulta (`?tag=`, `?filter=`, referencias de afiliado, etc.) no se cuentan como URLs separadas.',
    '- Los assets individuales de `public/`, `_next/` y de los demos no se cuentan como páginas; sí se incluye el `index.html` de cada demo.',
    '- Las URLs del sitemap también pueden aparecer entre las páginas estáticas; el total de páginas concretas elimina esas repeticiones.',
    '',
    `<!-- sitemap-only:${sitemapOnlyPaths.length}; model-only:${modelOnlyPaths.length} -->`,
  );

  const outputPath = path.join(repoRoot, OUTPUT_FILE);
  fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Generated ${OUTPUT_FILE}`);
  console.log(`Known concrete page URLs: ${knownConcretePaths.length}`);
  console.log(`Sitemap URLs: ${sitemapPaths.length}`);
  console.log(`Page route patterns: ${pageRoutes.length}`);
  console.log(`API route patterns: ${apiRoutes.length}`);
}

void main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
