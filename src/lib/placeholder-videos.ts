import data from '../data/prompts/placeholder-videos.json';
import type { Locale } from '@/i18n/config';
import { pickLocalized, type LocalizedField } from '@/lib/localized-string';
import { serializeCatalogPrompt } from '@/lib/catalog-prompt';

export type VideoProp = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  type: 'video';
  tags: string[];
  membership?: string;
};

type RawVideoEntry = {
  id?: string;
  title: LocalizedField;
  description: LocalizedField;
  imageUrl: string;
  imageHint: LocalizedField;
  type?: 'video';
  tags: string[];
  randomId?: string;
  membership?: string;
};

function mapVideoEntry(video: RawVideoEntry, index: number, locale: Locale | string): VideoProp {
  const generatedId = `v-${index + 1}`;
  const title = pickLocalized(video.title, locale);
  const imageHint = pickLocalized(video.imageHint, locale);

  return {
    id: generatedId,
    title,
    description: serializeCatalogPrompt(video, locale, 'video'),
    imageUrl: video.imageUrl,
    imageHint,
    type: 'video',
    tags: (video.tags || []).filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0),
    membership: video.membership,
  };
}

const rawVideos = data.placeholderVideos as RawVideoEntry[];

export function getPlaceholderVideos(locale: Locale | string = 'en'): VideoProp[] {
  return rawVideos.map((video, index) => mapVideoEntry(video, index, locale));
}

/** @deprecated Prefer getPlaceholderVideos(locale) in UI */
export const PlaceHolderVideos: VideoProp[] = getPlaceholderVideos('en');

export function getVideoById(id: string, locale: Locale | string = 'en'): VideoProp | undefined {
  return getPlaceholderVideos(locale).find(p => p.id === id);
}
