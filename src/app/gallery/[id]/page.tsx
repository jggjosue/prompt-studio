import { getImageById, type ImagePlaceholder } from '@/lib/placeholder-images';
import { getVideoById, type VideoProp } from '@/lib/placeholder-videos';
import { getLocale } from 'next-intl/server';
import { resolveRenderableMediaUrl } from '@/lib/media-resolver';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryDetailClient from './gallery-detail-client';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.prompstudio.com'
).replace(/\/$/, '');

type Props = {
  params: Promise<{ id: string }>
}

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
}

function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
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
  parent: ResolvingMetadata
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
  } catch (e) {
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

    const canonicalPath = `/gallery/${id}`;
    const canonical = `${SITE_URL}${canonicalPath}`;
    const description = promptDescription(item.description, item.title);
    const image = absoluteUrl(resolveRenderableMediaUrl(item, locale) || item.imageUrl);
    const category = item.type === 'video' ? 'Video Prompt' : 'Image Prompt';
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonical}#product`,
      name: item.title,
      description,
      image: [image],
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
          dangerouslySetInnerHTML={{ __html: jsonLdScript(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumbSchema) }}
        />
        <GalleryDetailClient item={item} />
      </>
    );
}
