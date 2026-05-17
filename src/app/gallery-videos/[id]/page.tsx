
import { getVideoById } from '@/lib/placeholder-videos';
import { getLocale } from 'next-intl/server';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryVideoDetailClient from './gallery-video-detail-client';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const locale = await getLocale();
  const item = getVideoById(id, locale);

  if (!item) {
    return {
      title: 'Video Not Found | Prompt Studio',
      description: 'The video you are looking for could not be found.',
    }
  }

  const openGraphImages = item.imageUrl ? [{ url: item.imageUrl }] : [];

  return {
    title: `${item.title} | Prompt Studio`,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      images: openGraphImages,
    },
  }
}

export default async function GalleryVideoDetailPage({ params }: Props) {
    const locale = await getLocale();
    const item = getVideoById(params.id, locale);

    if (!item) {
        notFound();
    }

    return <GalleryVideoDetailClient item={item} />;
}
