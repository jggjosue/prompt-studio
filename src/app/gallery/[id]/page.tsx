import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
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
    'chatgpt go bbva',
    'how to use chatgpt effectively',
    'chatgpt health',
    'chatgpt search',
    'chatgpt go',
    'AI Prompts',
    'Video Prompts',
    'Image Prompts',
    'AI Video Generator',
    'AI Image Generator',
    'chatgpt 5.2',
    'chatgpt christmas photo',
    'chatgpt 5.1',
    'chatgpt wrapped',
    'chatgpt adult mode',
    'how to cancel chatgpt plus subscription',
    'challenges cloudflare chatgpt',
    'chatgpt news',
    'notebooklm',
    'grok ai',
    'banana pro',
    'nano banana pro',
    'prompts',
    'chat gpt prompts for christmas pictures',
    'voice mail prompts',
    'christmas ai photo prompts',
    'darlink ai',
    'voicemail prompts crossword',
    'best grok spicy prompts',
    'grok prompts for images',
    'daily writing prompts',
    'awesome chatgpt prompts',
  ],
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
    const imageItem = PlaceHolderImages.find(p => p.id === params.id);
    const videoItem = PlaceHolderVideos.find(p => p.id === params.id);
    const item: ImagePlaceholder | VideoProp | undefined = imageItem || videoItem;

    if (!item) {
        notFound();
    }

    // The old page.tsx is now the client component
    return <GalleryDetailClient item={item} />;
}
