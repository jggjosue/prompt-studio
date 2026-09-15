import type { Metadata } from 'next';
import VideoPromptsClient from './video-prompts-client';
import { getPlaceholderVideos } from '@/lib/placeholder-videos';
import { RelatedInternalLinks } from '@/components/related-internal-links';
import { JsonLd } from '@/components/json-ld';
import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Prompts para generar videos con IA',
  description: 'Explora prompts de video para planos cinematográficos, movimiento de cámara, anuncios y contenido social; adapta una idea y crea tu video.',
  alternates: {
    canonical: '/video-prompts',
  },
  keywords: ['prompts para videos IA', 'prompts cinematográficos', 'movimientos de cámara para IA', 'prompts para anuncios en video'],
};

export default function VideoPromptsPage() {
  const videos = getPlaceholderVideos('en');
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: videos.slice(0, 24).map((video, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: video.title,
        url: `${SITE_URL}/gallery-videos/${encodeURIComponent(video.id)}`,
      })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <VideoPromptsClient />
      <RelatedInternalLinks className="mx-auto mb-12 max-w-4xl" />
    </>
  );
}
