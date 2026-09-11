import type { MetadataRoute } from 'next';
import { getSitemapPriority } from '@/lib/internal-link-graph';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import {
  getIndexableTagPages,
  getProgrammaticCategories,
} from '@/lib/seo/programmatic-seo';
import { getRawWebPages } from '@/lib/web-pages';
import { SITE_URL } from '@/lib/site-url';

type SitemapEntry = MetadataRoute.Sitemap[number];
type ChangeFrequency = NonNullable<SitemapEntry['changeFrequency']>;

function absoluteUrl(path: `/${string}`): string {
  return `${SITE_URL}${path}`;
}

function sitemapEntry(
  path: `/${string}`,
  changeFrequency: ChangeFrequency
): SitemapEntry {
  return {
    url: absoluteUrl(path),
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    '/affiliate-program',
    /**
     * Herramientas gratuitas. Son públicas y funcionan, pero no estaban en el
     * sitemap: Google no sabía que existían. Son el activo de captación más
     * barato que tiene el sitio, porque atraen búsquedas con intención propia
     * y no dependen de posicionar el catálogo.
     */
    '/code-auditor',
    '/smart-search',
    '/prompt-optimizer',
    '/ask',
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

    return sitemapEntry(path, changeFrequency);
  });
}
