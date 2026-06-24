import type { MetadataRoute } from 'next';
import { getSitemapPriority } from '@/lib/internal-link-graph';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { PROMPT_EDIT_ENABLED } from '@/lib/prompt-edit';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import {
  getIndexableTagPages,
  getProgrammaticCategories,
} from '@/lib/seo/programmatic-seo';
import { getRawWebPages } from '@/lib/web-pages';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.prompstudio.com'
).replace(/\/$/, '');

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry['changeFrequency']>;

function absoluteUrl(path: `/${string}`): string {
  return `${SITE_URL}${path}`;
}

function sitemapEntry(
  path: `/${string}`,
  changeFrequency: ChangeFrequency,
  lastModified: Date
): SitemapEntry {
  return {
    url: absoluteUrl(path),
    lastModified,
    changeFrequency,
    priority: getSitemapPriority(path),
  };
}

function uniquePaths(paths: Array<`/${string}`>): Array<`/${string}`> {
  return Array.from(new Set(paths));
}

function slugPath(prefix: `/${string}`, slug: string): `/${string}` {
  const encodedSlug = slug.split('/').map(encodeURIComponent).join('/');
  return `${prefix}/${encodedSlug}` as `/${string}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPaths: Array<`/${string}`> = [
    '/',
    '/prompts',
    '/image-prompts',
    '/video-prompts',
    '/landing-pages',
    '/image-tags',
    '/video-tags',
    '/web-tags',
    '/prices',
    ...(PROMPT_EDIT_ENABLED ? (['/prompt/edit'] as const) : []),
  ];

  const landingPagePaths = getRawWebPages()
    .map(page => normalizeDemoFolder(page.demoUrl ?? ''))
    .filter((slug): slug is string => Boolean(slug))
    .map(slug => slugPath('/landing-pages', slug));

  const galleryImagePaths = PlaceHolderImages.map(item =>
    slugPath('/gallery', item.id)
  );

  const galleryVideoPaths = PlaceHolderVideos.map(item =>
    slugPath('/gallery-videos', item.id)
  );

  const categoryPaths = getProgrammaticCategories('en').map(category =>
    slugPath('/category', category.slug)
  );

  const tagPaths = getIndexableTagPages('en').map(tag =>
    slugPath('/tags', tag.slug)
  );

  return uniquePaths([
    ...staticPaths,
    ...categoryPaths,
    ...tagPaths,
    ...landingPagePaths,
    ...galleryImagePaths,
    ...galleryVideoPaths,
  ]).map(path => {
    const changeFrequency: ChangeFrequency =
      path === '/' || path.includes('prompts') ? 'daily' : 'weekly';

    return sitemapEntry(path, changeFrequency, lastModified);
  });
}
