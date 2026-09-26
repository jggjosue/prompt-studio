import type { Metadata } from 'next';
import VideoPromptsClient from './video-prompts-client';
import { getPlaceholderVideos } from '@/lib/placeholder-videos';
import { RelatedInternalLinks } from '@/components/related-internal-links';
import { JsonLd } from '@/components/json-ld';
import { SITE_URL } from '@/lib/site-url';
import { getTranslations } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const requestedLocale = (await params).locale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: 'metadata.videoPrompts' });
  return { title: t('title'), description: t('description'), alternates: { canonical: '/video-prompts' } };
}

export default async function VideoPromptsPage({ params }: { params: Promise<{ locale: string }> }) {
  const requestedLocale = (await params).locale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const videos = getPlaceholderVideos(locale);
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
