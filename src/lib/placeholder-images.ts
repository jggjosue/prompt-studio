import data from '../data/prompts/placeholder-images.json';
import type { Locale } from '@/i18n/config';
import { pickLocalized, type LocalizedField } from '@/lib/localized-string';
import { serializeCatalogPrompt } from '@/lib/catalog-prompt';

export type ImagePlaceholder = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  type: 'image' | 'video';
  tags: string[];
  membership?: string;
};

type RawImageEntry = {
  id?: string;
  title: LocalizedField;
  description: LocalizedField;
  imageUrl: string;
  imageHint: LocalizedField;
  type: 'image' | 'video';
  tags: string[];
  randomId?: string;
  membership?: string;
};

function mapImageEntry(image: RawImageEntry, index: number, locale: Locale | string): ImagePlaceholder {
  const generatedId = `img-${index + 1}`;
  const title = pickLocalized(image.title, locale);
  const imageHint = pickLocalized(image.imageHint, locale);

  return {
    id: generatedId,
    title,
    description: serializeCatalogPrompt(image, locale),
    imageUrl: image.imageUrl,
    imageHint,
    type: image.type,
    tags: (image.tags || []).filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0),
    membership: image.membership,
  };
}

const rawImages = data.placeholderImages as RawImageEntry[];

export function getPlaceholderImages(locale: Locale | string = 'en'): ImagePlaceholder[] {
  return rawImages.map((image, index) => mapImageEntry(image, index, locale));
}

/** @deprecated Prefer getPlaceholderImages(locale) in UI */
export const PlaceHolderImages: ImagePlaceholder[] = getPlaceholderImages('en');

export function getImageById(id: string, locale: Locale | string = 'en'): ImagePlaceholder | undefined {
  return getPlaceholderImages(locale).find(p => p.id === id);
}
