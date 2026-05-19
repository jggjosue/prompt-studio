import { getSitemapPriority } from '@/lib/internal-link-graph';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { PROMPT_EDIT_ENABLED } from '@/lib/prompt-edit';
import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.prompstudio.com';

function sitemapEntry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']
): MetadataRoute.Sitemap[0] {
  return {
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority: getSitemapPriority(path),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    '/',
    '/prompts',
    '/image-prompts',
    '/video-prompts',
    '/landing-pages',
    '/image-tags',
    '/video-tags',
    '/web-tags',
    '/prices',
    '/pricing',
    ...(PROMPT_EDIT_ENABLED ? ['/prompt/edit'] : []),
  ];

  const staticPages: MetadataRoute.Sitemap = staticPaths.map(path =>
    sitemapEntry(
      path,
      path === '/' || path.includes('prompts') ? 'daily' : 'weekly'
    )
  );

  const galleryImagePages: MetadataRoute.Sitemap = PlaceHolderImages.map(item =>
    sitemapEntry(`/gallery/${item.id}`, 'weekly')
  );

  const galleryVideoPages: MetadataRoute.Sitemap = PlaceHolderVideos.map(item =>
    sitemapEntry(`/gallery-videos/${item.id}`, 'weekly')
  );

  return [...staticPages, ...galleryImagePages, ...galleryVideoPages];
}
