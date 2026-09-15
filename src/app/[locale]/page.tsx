import type { Metadata } from 'next';
import animationsData from '../../data/prompts/web-animations.json';
import imagesData from '../../data/prompts/placeholder-images.json';
import videosData from '../../data/prompts/placeholder-videos.json';
import webPagesData from '../../data/web-pages.json';
import DiscoverClient from './discover/discover-client';
import { JsonLd } from '@/components/json-ld';
import { buildOrganizationSchema, buildWebSiteSchema } from '@/lib/json-ld';
import { SITE_URL } from '@/lib/site-url';
import { HOME_FEED_LIMITS } from '@/lib/progressive-feed';

export const metadata: Metadata = {
  title: 'Descubrir | Prompt Studio',
  description: 'Descubre imágenes, videos, páginas web y animaciones creadas para inspirar tu próximo proyecto.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  const organizationId = `${SITE_URL}#organization`;
  const organizationSchema = buildOrganizationSchema({
    url: SITE_URL,
    name: 'Prompt Studio',
    logoUrl: `${SITE_URL}/icons/icon.svg`,
  });
  const webSiteSchema = buildWebSiteSchema({
    url: SITE_URL,
    name: 'Prompt Studio',
    alternateName: 'PrompStudio',
    publisherId: organizationId,
  });
  /**
   * El id del detalle es la POSICION en el catalogo completo: `getPlaceholderImages`
   * genera `img-${index + 1}` recorriendo el mismo JSON (idem `v-${index + 1}`
   * para videos). El feed reordena y filtra, asi que su indice propio no sirve:
   * enlazar con el, como se hacia antes, abria el detalle de otra imagen.
   */
  const imageDetailIds = new Map(
    imagesData.placeholderImages.map((image, index) => [image, `img-${index + 1}`] as const)
  );
  const videoDetailIds = new Map(
    videosData.placeholderVideos.map((video, index) => [video, `v-${index + 1}`] as const)
  );

  const productPhotography = imagesData.placeholderImages.filter(image =>
    image.tags.includes('Product Photography')
  );
  const featuredImageCandidates = [
    ...productPhotography.slice(0, 24),
    ...imagesData.placeholderImages.slice(0, 36),
  ];
  const seenImageKeys = new Set<string | number>();
  const featuredImages = featuredImageCandidates
    .filter((image, index) => {
      const imageKey = image.id ?? image.randomId ?? `index-${index}`;
      if (seenImageKeys.has(imageKey)) return false;
      seenImageKeys.add(imageKey);
      return true;
    })
    .slice(0, HOME_FEED_LIMITS.image)
    .map(image => ({
      id: image.id,
      randomId: image.randomId,
      title: image.title,
      description: image.description,
      imageUrl: image.imageUrl,
      detailId: imageDetailIds.get(image),
      tags: image.tags.filter((tag): tag is string => typeof tag === 'string'),
    }));
  const productReels = videosData.placeholderVideos.filter(video =>
    video.tags.includes('Product Reel')
  );
  const featuredVideos = [
    ...productReels.slice(0, 15),
    ...videosData.placeholderVideos.slice(0, 15),
  ].slice(0, HOME_FEED_LIMITS.video).map(video => ({
    randomId: video.randomId,
    title: video.title,
    description: video.description,
    imageUrl: video.imageUrl,
    tags: video.tags.filter((tag): tag is string => typeof tag === 'string'),
    detailId: videoDetailIds.get(video),
  }));

  // El filtro «Animaciones» del feed existía sin datos que mostrar.
  const featuredAnimations = animationsData.animations.slice(0, HOME_FEED_LIMITS.animation);
  // Las webs sin `imageUrl` van al final: el destacado usa la primera de la lista.
  const featuredWebPages = [...webPagesData.webPages]
    .sort((a, b) => Number(Boolean(b.imageUrl)) - Number(Boolean(a.imageUrl)))
    .slice(0, HOME_FEED_LIMITS.web)
    .map(page => ({
      id: page.id,
      title: page.title,
      description: page.description,
      imageUrl: page.imageUrl,
      tags: page.tags,
      demoUrl: page.demoUrl,
      price: page.price,
    }));

  return (
    <>
      <JsonLd data={organizationSchema} />
      <JsonLd data={webSiteSchema} />
      <DiscoverClient
        images={featuredImages}
        videos={featuredVideos}
        webPages={featuredWebPages}
        animations={featuredAnimations}
      />
    </>
  );
}
