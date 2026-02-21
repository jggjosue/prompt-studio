import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { PlaceHolderVideos, type VideoProp } from '@/lib/placeholder-videos';
import type { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import GalleryDetailClient from './gallery-detail-client';

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const id = params.id;
  const imageItem = PlaceHolderImages.find(p => p.id === id);
  const videoItem = PlaceHolderVideos.find(p => p.id === id);
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

  const openGraphImages = item.imageUrl ? [{ url: item.imageUrl }] : [];

  return {
    title: `${item.title} | Prompt Studio`,
    description: displayDescription,
    openGraph: {
      title: item.title,
      description: displayDescription,
      images: openGraphImages,
    },
  }
}

export default function GalleryDetailPage({ params }: Props) {
    const imageItem = PlaceHolderImages.find(p => p.id === params.id);
    const videoItem = PlaceHolderVideos.find(p => p.id === params.id);
    const item: ImagePlaceholder | VideoProp | undefined = imageItem || videoItem;

    if (!item) {
        notFound();
    }

    return <GalleryDetailClient item={item} />;
}
