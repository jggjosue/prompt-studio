import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.prompt-studio.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/image-prompts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/video-prompts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/prompt/edit`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
     {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const galleryPages: MetadataRoute.Sitemap = [
    ...PlaceHolderImages.map(item => ({
      url: `${BASE_URL}/gallery/${item.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    ...PlaceHolderVideos.map(item => ({
      url: `${BASE_URL}/gallery/${item.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];

  return [...staticPages, ...galleryPages];
}
