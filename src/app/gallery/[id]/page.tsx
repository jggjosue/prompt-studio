import type { Metadata, ResolvingMetadata } from 'next';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import GalleryDetailClient from './gallery-detail-client';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const item = PlaceHolderImages.find(p => p.id === id);

  if (!item) {
    return {
      title: 'Content Not Found | Prompt Studio',
      description: 'The content you are looking for could not be found.',
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

export default function GalleryDetailPage({ params }: Props) {
    const item: ImagePlaceholder | undefined = PlaceHolderImages.find(
        p => p.id === params.id
    );

    if (!item) {
        notFound();
    }

    // The old page.tsx is now the client component
    return <GalleryDetailClient item={item} />;
}
