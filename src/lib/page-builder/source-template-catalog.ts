import 'server-only';

import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { getRawWebPageByDemoSlug, getCatalogIdByDemoSlug } from '@/lib/web-pages';

export type SourceTemplateAsset = {
  path: string;
  kind: 'image' | 'video';
};

export type SourcePageTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  preview: string;
  tags: string[];
  assets: SourceTemplateAsset[];
  membership: string;
  catalogId: string | null;
};

type ProjectMetadata = {
  title?: { es?: string; en?: string };
  description?: {
    es?: { nombre?: string; prompt?: string; estilo?: string };
    en?: { name?: string; prompt?: string };
  };
  tags?: string[];
};

const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp']);
const VIDEO_EXTENSIONS = new Set(['.m4v', '.mov', '.mp4', '.webm']);

function categoryFor(slug: string, tags: string[]): string {
  const value = `${slug} ${tags.join(' ')}`.toLowerCase();
  if (/restaurant|food|pizza|steak|decor|shop|store|marketplace|ecommerce|pet supplies|fashion/.test(value)) return 'Ecommerce';
  if (/real.?estate|property|homes|architecture/.test(value)) return 'Real Estate';
  if (/event|concert|festival|convention|meetup|tickets/.test(value)) return 'Event';
  if (/course|education|lesson|school|learning|music/.test(value)) return 'Education';
  if (/agency|studio|creative/.test(value)) return 'Agencies';
  if (/portfolio|photograph|illustrator|freelance/.test(value)) return 'Portfolio';
  if (/saas|clone|workspace|productivity|platform|tool/.test(value)) return 'SaaS';
  return 'Personal';
}

function firstText(...values: Array<string | undefined>): string {
  return values.find(value => typeof value === 'string' && value.trim().length > 0)?.trim() ?? '';
}

function humanizeSlug(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function mediaAssets(folder: string, slug: string): Promise<SourceTemplateAsset[]> {
  const entries = await readdir(folder, { recursive: true, withFileTypes: true });
  return entries.flatMap(entry => {
    if (!entry.isFile()) return [];
    const extension = path.extname(entry.name).toLowerCase();
    const kind: SourceTemplateAsset['kind'] | null = IMAGE_EXTENSIONS.has(extension) ? 'image' : VIDEO_EXTENSIONS.has(extension) ? 'video' : null;
    if (!kind) return [];
    const parent = 'parentPath' in entry && typeof entry.parentPath === 'string' ? entry.parentPath : folder;
    const relative = path.relative(folder, path.join(parent, entry.name)).split(path.sep).join('/');
    return [{ path: `/webpages/${encodeURIComponent(slug)}/${relative.split('/').map(encodeURIComponent).join('/')}`, kind }];
  }).slice(0, 100);
}

/** Lee únicamente plantillas locales que cuentan con metadata e index renderizable. */
export async function loadSourcePageTemplates(): Promise<SourcePageTemplate[]> {
  const root = path.join(process.cwd(), 'public', 'webpages');
  const folders = await readdir(root, { withFileTypes: true });
  const templates = await Promise.all(folders.filter(entry => entry.isDirectory()).map(async entry => {
    const folder = path.join(root, entry.name);
    const metadataPath = path.join(folder, 'project.json');
    if (!await exists(metadataPath) || !await exists(path.join(folder, 'index.html'))) return null;
    try {
      const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as ProjectMetadata;
      const tags = Array.isArray(metadata.tags) ? metadata.tags.filter(tag => typeof tag === 'string').slice(0, 8) : [];
      const name = firstText(
        metadata.title?.es,
        metadata.description?.es?.nombre,
        metadata.title?.en,
        metadata.description?.en?.name,
        humanizeSlug(entry.name),
      );
      const description = firstText(metadata.description?.es?.prompt, metadata.description?.en?.prompt, metadata.description?.es?.estilo);
      const catalogPage = getRawWebPageByDemoSlug(entry.name);
      return {
        id: entry.name,
        name,
        category: categoryFor(entry.name, tags),
        description,
        image: `/images/webpages/${entry.name}.webp`,
        preview: entry.name,
        tags,
        assets: await mediaAssets(folder, entry.name),
        membership: catalogPage?.membership?.trim() || 'Premium',
        catalogId: getCatalogIdByDemoSlug(entry.name),
      } satisfies SourcePageTemplate;
    } catch {
      return null;
    }
  }));
  return templates.filter((template): template is SourcePageTemplate => Boolean(template)).sort((left, right) => left.name.localeCompare(right.name, 'es'));
}
