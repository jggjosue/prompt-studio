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
  if (!SLUG_RE.test(folder) || folder === 'refactory-online') {
    return null;
  }

  if (!isRefactoryPreviewable(projectKind)) {
    return null;
  }

  const dir = path.join(process.cwd(), 'public/webpages', folder);
  const indexPath = path.join(dir, 'index.html');
  if (!fs.existsSync(indexPath)) {
    return null;
  }

  const components: string[] = [];
  let html = '';
  let css: string | null = null;
  let js: string | null = null;

  for (const file of HTML_FILES) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) continue;
    components.push(file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (file === 'index.html') html = content;
    if (file === 'styles.css') css = content;
    if (file === 'script.js') js = content;
  }

  return {
    slug: folder,
    html,
    css,
    js,
    components,
    source: 'local',
    projectKind: 'html',
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

  if (!isRefactoryPreviewable(projectKind)) {
    return null;
  }

  const cacheKey = `${folder}:${projectKind}:${stack.join(',')}`;

  return cacheGetOrSet(
    'demo-bundle',
    cacheKey,
    async () => {
      const local = readLocalDemoBundle(folder, projectKind);
      if (local) return local;
      return readR2DemoBundle(folder, stack);
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

  if (!isR2S3Configured()) {
    return false;
  }

  const validation = await validateR2ProjectFolder(folder, stack);
  return validation.valid;
}
