import type { Metadata } from 'next';
import DiscoverClient from './discover/discover-client';
import webPagesData from '../../public/webpages/web-pages.json';
import imagesData from '../../public/prompts/placeholder-images.json';
import videosData from '../../public/prompts/placeholder-videos.json';

export const metadata: Metadata = {
  title: 'Descubrir | Prompt Studio',
  description: 'Descubre imágenes, videos, páginas web y animaciones creadas para inspirar tu próximo proyecto.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <DiscoverClient
      images={imagesData.placeholderImages.slice(0, 60)}
      videos={videosData.placeholderVideos.slice(0, 30)}
      webPages={webPagesData.webPages.slice(0, 36)}
      animations={[]}
    />
  );
}
