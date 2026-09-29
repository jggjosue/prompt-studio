
import { getVideoById } from '@/lib/placeholder-videos';
import { getLocale } from 'next-intl/server';
import { buildVideoObjectSchema, safeJsonLd, schemaDescription } from '@/lib/json-ld';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryVideoDetailClient from './gallery-video-detail-client';
import { SITE_URL } from '@/lib/site-url';
import { validateCatalogPrompt } from '@/lib/prompt-validation';

type Props = {
  params: Promise<{ id: string }>
}

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

function promptDescription(description: string, fallback: string): string {
  try {
    const parsed = JSON.parse(description) as { description?: string };
    return parsed.description || fallback;
  } catch {
    return description || fallback;
  }
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const item = getVideoById(id, locale);

  if (!item) {
    return {
      title: 'Video Not Found | Prompt Studio',
      description: 'The video you are looking for could not be found.',
    }
  }

  const openGraphImages = item.imageUrl ? [{ url: item.imageUrl }] : [];
  const canonicalPath = `/gallery-videos/${id}`;
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  return {
    title: `${item.title} | Prompt Studio`,
    description: item.description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      url: canonicalUrl,
      title: item.title,
      description: item.description,
      images: openGraphImages,
    },
  }
}

export default async function GalleryVideoDetailPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const imageItem = (await import('@/lib/placeholder-images')).getImageById(id, locale);
  const videoItem = getVideoById(id, locale);

  if (!videoItem && imageItem) {
    const { redirect } = await import('next/navigation');
    redirect(`/gallery/${id}`);
  }

  const item = videoItem;

  if (!item) {
    notFound();
  }

  const canonical = `${SITE_URL}/gallery-videos/${id}`;
  const description = promptDescription(item.description, item.title);
  const images = (await import('@/lib/placeholder-images')).getPlaceholderImages(locale);
  const thumbnailItem = images.find(img => img.title === item.title);
  const localPoster =
    item.imageUrl.startsWith('/videos/indexable/') &&
    item.imageUrl.endsWith('.mp4')
      ? item.imageUrl.replace(/\.mp4$/, '.jpg')
      : null;
  const thumbnailUrl = localPoster
    ? absoluteUrl(localPoster)
    : thumbnailItem
      ? absoluteUrl(thumbnailItem.imageUrl)
      : `${SITE_URL}/og-image.png`;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: item.title,
    description: schemaDescription(description, item.title),
    image: [thumbnailUrl],
    category: 'Video Prompt',
    brand: {
      '@type': 'Brand',
      name: 'Prompt Studio',
    },
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'USD',
      price: '0.00',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  const videoSchema = buildVideoObjectSchema({
    id: `${canonical}#video`,
    name: item.title,
    description,
    thumbnailUrl,
    uploadDate: (item as typeof item & { uploadDate?: string }).uploadDate,
    contentUrl: absoluteUrl(item.imageUrl),
    embedUrl: canonical,
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Video Prompts',
        item: `${SITE_URL}/category/video-prompts`,
      },
      { '@type': 'ListItem', position: 3, name: item.title, item: canonical },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(productSchema) }}
      />
      {videoSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(videoSchema) }}
        />
      ) : null}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <GalleryVideoDetailClient item={item} validation={validateCatalogPrompt(item)} poster={thumbnailUrl} />
    </>
  );
}
