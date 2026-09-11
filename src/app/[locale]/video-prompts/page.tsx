import type { Metadata } from 'next';
import VideoPromptsClient from './video-prompts-client';
import { getPlaceholderVideos } from '@/lib/placeholder-videos';
import imagesData from '../../../public/prompts/placeholder-images.json';

export const metadata: Metadata = {
  title: 'AI Video Prompts | Prompt Studio',
  description: 'Discover thousands of AI video prompts and examples. Get inspired and create your own AI generated videos.',
  alternates: {
    canonical: '/video-prompts',
  },
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
};

export default function VideoPromptsPage() {
  const videos = getPlaceholderVideos('en');
  const images = imagesData.placeholderImages;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: videos.map((video, index) => {
      // Find matching image by title for the thumbnail
      const matchingImg = images.find(
        (img) => img.title.en === video.title || img.title.es === video.title
      );

      // Parse the JSON stringified description to get the plain text description
      let descriptionText = video.title;
      try {
        const parsed = JSON.parse(video.description);
        if (parsed && parsed.description) {
          descriptionText = parsed.description;
        }
      } catch (e) {
        // Fallback
      }

      const defaultThumbnail = 'https://prompstudio.com/og-image.png';

      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'VideoObject',
          name: video.title,
          description: descriptionText,
          contentUrl: video.imageUrl,
          thumbnailUrl: matchingImg?.imageUrl || defaultThumbnail,
          uploadDate: new Date('2024-01-01').toISOString(), // fallback date for SEO validation
        },
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <VideoPromptsClient />
    </>
  );
}
