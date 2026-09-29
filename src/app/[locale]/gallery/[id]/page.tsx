import { getImageById, getPlaceholderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { getPlaceholderVideos, getVideoById, type VideoProp } from '@/lib/placeholder-videos';
import { getLocale } from 'next-intl/server';
import { resolveRenderableMediaUrl } from '@/lib/media-resolver';
import { buildImageObjectSchema, buildVideoObjectSchema, safeJsonLd, schemaDescription } from '@/lib/json-ld';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryDetailClient from './gallery-detail-client';
import { SITE_URL } from '@/lib/site-url';
import { validateCatalogPrompt } from '@/lib/prompt-validation';
import { assessManualActionRisk, selectRelatedGalleryItems } from '@/lib/gallery-detail';

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
  const imageItem = getImageById(id, locale);
  const videoItem = getVideoById(id, locale);
  const item = imageItem || videoItem;

  if (!item) {
    return {
      title: 'Content Not Found | Prompt Studio',
      description: 'The content you are looking for could not be found.',
      keywords: [
        'Chatgpt',
        'AI Prompts',
        'Video Prompts',
        'Image Prompts',
        'AI Video Generator',
        'AI Image Generator',
      ],
    }
  }

  // Intentamos extraer la descripción legible del JSON para el SEO
  let displayDescription = item.title;
  try {
    const parsed = JSON.parse(item.description);
    displayDescription = parsed.description || item.title;
  } catch (_e) {
    displayDescription = item.description;
  }

  const resolvedPreviewUrl = resolveRenderableMediaUrl(item, locale);
  const openGraphImages = resolvedPreviewUrl ? [{ url: resolvedPreviewUrl }] : [];
  const canonicalPath = `/gallery/${id}`;

  return {
    title: `${item.title} | Prompt Studio`,
    description: displayDescription,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: canonicalPath,
      title: item.title,
      description: displayDescription,
      images: openGraphImages,
    },
  }
}

export default async function GalleryDetailPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const imageItem = getImageById(id, locale);
  const videoItem = getVideoById(id, locale);
  const item: ImagePlaceholder | VideoProp | undefined = imageItem || videoItem;

  if (!item) {
    notFound();
  }

  if (item.type === 'video') {
    // If an item in placeholderImages is actually a video or has a video ID format like v-*, redirect to gallery-videos
    const { redirect } = await import('next/navigation');
    const targetId = item.id.startsWith('v-') ? item.id : id;
    redirect(`/gallery-videos/${targetId}`);
  }

  const canonicalPath = `/gallery/${id}`;
  const canonical = `${SITE_URL}${canonicalPath}`;
  const description = promptDescription(item.description, item.title);
  const image = absoluteUrl(resolveRenderableMediaUrl(item, locale) || item.imageUrl);
  const category = item.type === 'video' ? 'Video Prompt' : 'Image Prompt';
  const imageItems = getPlaceholderImages(locale).filter(candidate => candidate.imageUrl);
  const videoItems = getPlaceholderVideos(locale).filter(candidate => candidate.imageUrl);
  const allItems = [...imageItems, ...videoItems];
  const relatedItems = selectRelatedGalleryItems(
    item,
    item.type === 'video' ? videoItems : imageItems
  );
  const manualActionRisk = assessManualActionRisk(item, allItems);

  // For thumbnails, we use the image preview from the resolver, or a fallback.
  const thumbnailUrl = image;

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: item.title,
    description: schemaDescription(description, item.title),
    image: [thumbnailUrl],
    category,
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

  const imageSchema = item.type !== 'video'
    ? buildImageObjectSchema({
        id: `${canonical}#image`,
        url: canonical,
        contentUrl: image,
        name: item.title,
        description,
      })
    : null;
  const videoSchema = item.type === 'video'
    ? buildVideoObjectSchema({
        id: `${canonical}#video`,
        name: item.title,
        description,
        thumbnailUrl,
        uploadDate: (item as VideoProp & { uploadDate?: string }).uploadDate,
        contentUrl: absoluteUrl(item.imageUrl),
        embedUrl: canonical,
      })
    : null;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      {
        '@type': 'ListItem',
        position: 2,
        name: category,
        item: `${SITE_URL}/category/${item.type === 'video' ? 'video-prompts' : 'image-prompts'}`,
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
      {videoSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(videoSchema) }}
        />
      )}
      {imageSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(imageSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />
      <GalleryDetailClient
        item={item}
        validation={validateCatalogPrompt(item)}
        relatedItems={relatedItems}
        manualActionRisk={manualActionRisk}
      />
    </>
  );
}
