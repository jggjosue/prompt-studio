
import { getVideoById } from '@/lib/placeholder-videos';
import { getLocale } from 'next-intl/server';
import { safeJsonLd } from '@/lib/json-ld';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryVideoDetailClient from './gallery-video-detail-client';

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
  const item = getVideoById(id, locale);

  if (!item) {
    return {
      title: 'Video Not Found | Prompt Studio',
      description: 'The video you are looking for could not be found.',
    }
  }

  const openGraphImages = item.imageUrl ? [{ url: item.imageUrl }] : [];
  const canonicalPath = `/gallery-videos/${id}`;

  return {
    title: `${item.title} | Prompt Studio`,
    description: item.description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      url: canonicalPath,
      title: item.title,
      description: item.description,
      images: openGraphImages,
    },
  }
}

export default async function GalleryVideoDetailPage({ params }: Props) {
    const { id } = await params;
    const locale = await getLocale();
    const item = getVideoById(id, locale);

    if (!item) {
        notFound();
    }

    const canonical = `${SITE_URL}/gallery-videos/${id}`;
    const description = promptDescription(item.description, item.title);
    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonical}#product`,
      name: item.title,
      description,
      image: [absoluteUrl(item.imageUrl)],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
        />
        <GalleryVideoDetailClient item={item} />
      </>
    );
}
