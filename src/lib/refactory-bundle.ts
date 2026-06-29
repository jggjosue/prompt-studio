import fs from 'fs';
import path from 'path';
import {
  getDemoProjectKind,
  isRefactoryPreviewable,
} from '@/lib/demo-project-type';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import { cacheGetOrSet } from '@/lib/server-cache';
import {
  getR2ObjectText,
  isR2S3Configured,
  validateR2ProjectFolder,
} from '@/lib/r2-storage';
import { getRawWebPageByDemoSlug } from '@/lib/web-pages';

const HTML_FILES = ['index.html', 'styles.css', 'script.js'] as const;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/i;

export type DemoBundle = {
  slug: string;
  html: string;
  css: string | null;
  js: string | null;
  components: string[];
  source: 'local' | 'r2';
  r2Prefix?: string;
  projectKind: 'html' | 'react' | 'next';
};

function resolveFolderName(folderOrDemoUrl: string, slug: string): string | null {
  return normalizeDemoFolder(folderOrDemoUrl) ?? (SLUG_RE.test(slug) ? slug : null);
}

export function readLocalDemoBundle(
  folder: string,
  projectKind = getDemoProjectKind([])
): DemoBundle | null {
  // Relax SLUG_RE check for title-based folders which might have spaces
  if (folder === 'refactory-online') {
    return null;
  }

  const basePath = process.cwd();
  const publicDir = 'public';
  const webpagesDir = 'webpages';
  const dir = path.join(basePath, publicDir, webpagesDir, folder);
  if (!fs.existsSync(dir)) {
    return null;
  }

  const components: string[] = [];
  let html = '';
  let css: string | null = null;
  let js: string | null = null;

  if (projectKind === 'html') {
    const indexPath = path.join(dir, 'index.html');
    if (!fs.existsSync(indexPath)) return null;

    for (const file of HTML_FILES) {
      const filePath = path.join(dir, file);
      if (!fs.existsSync(filePath)) continue;
      components.push(file);
      const content = fs.readFileSync(filePath, 'utf8');
      if (file === 'index.html') html = content;
      if (file === 'styles.css') css = content;
      if (file === 'script.js') js = content;
    }
  } else {
    const mainFiles = [
      'package.json',
      'app/page.tsx',
      'app/page.jsx',
      'src/App.tsx',
      'pages/index.tsx',
      'README.md',
    ];
    let hasEntry = false;
    for (const file of mainFiles) {
      const filePath = path.join(dir, file);
      if (!fs.existsSync(filePath)) continue;
      hasEntry = true;
      components.push(file);
      const content = fs.readFileSync(filePath, 'utf8');
      if (!html) html = content;
      else if (!js && file.match(/\.(tsx?|jsx?)$/)) js = content;
      else if (!css && file.match(/\.json$/)) css = content;
    }
    if (!hasEntry) return null;
  }

  return {
    slug: folder,
    html,
    css,
    js,
    components,
    source: 'local',
    projectKind,
  };
}

/** Solo proyectos HTML: index.html + CSS/JS desde R2. */
export async function readR2DemoBundle(
  folder: string,
  stack: string[] = []
): Promise<DemoBundle | null> {
  if (!SLUG_RE.test(folder) || folder === 'refactory-online' || !isR2S3Configured()) {
    return null;
  }

  const projectKind = getDemoProjectKind(stack);
  if (!isRefactoryPreviewable(projectKind)) {
    return null;
  }

  const validation = await validateR2ProjectFolder(folder, stack);
  if (!validation.valid || !validation.prefix) {
    return null;
  }

  const prefix = validation.prefix;
  const html = await getR2ObjectText(`${prefix}index.html`);
  if (!html) return null;

  const components: string[] = ['index.html'];
  const css = await getR2ObjectText(`${prefix}styles.css`);
  const js = await getR2ObjectText(`${prefix}script.js`);
  if (css) components.push('styles.css');
  if (js) components.push('script.js');

  return {
    slug: folder,
    html,
    css,
    js,
    components,
    source: 'r2',
    r2Prefix: prefix,
    projectKind: 'html',
  };
}

export async function resolveDemoBundle(
  slug: string,
  demoUrl?: string,
  stack: string[] = []
): Promise<DemoBundle | null> {
  const folder = resolveFolderName(demoUrl ?? slug, slug);
  if (!folder) return null;

  const projectKind = getDemoProjectKind(stack);

  const cacheKey = `${folder}:${projectKind}:${stack.join(',')}`;

  return cacheGetOrSet(
    'demo-bundle',
    cacheKey,
    async () => {
      let local = readLocalDemoBundle(folder, projectKind);
      if (local) return local;

      // Fallback: search by demoUrl
      const page = getRawWebPageByDemoSlug(slug);
      if (page && page.demoUrl) {
        local = readLocalDemoBundle(page.demoUrl, projectKind);
        if (local) return local;
      }

      // Ya no buscamos en R2 (por petición del usuario)
      return null;

      return null;
    },
    { ttlMs: 30 * 60 * 1000 }
  );
}

/** Comprueba si la carpeta existe en R2 con las reglas del stack (sin cargar contenido). */
export async function isDemoProjectAvailable(
  folder: string,
  stack: string[] = []
): Promise<boolean> {
  const projectKind = getDemoProjectKind(stack);

  if (readLocalDemoBundle(folder, projectKind)) {
    return true;
  }

  // Fallback: search by demoUrl
  const page = getRawWebPageByDemoSlug(folder); // folder is typically slug/demoUrl here
  if (page && page.demoUrl) {
    if (readLocalDemoBundle(page.demoUrl, projectKind)) return true;
  }

  return false;
}
