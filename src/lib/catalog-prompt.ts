import { pickLocalized, type LocalizedField } from '@/lib/localized-string';

export type CatalogPromptSource = {
  id?: string | number;
  randomId?: string;
  title: LocalizedField;
  description: LocalizedField;
  imageUrl?: string;
  imageHint?: LocalizedField;
  type?: string;
  tags?: Array<string | null>;
  membership?: string;
};

/**
 * Serializes the complete, useful catalog metadata used as an AI prompt.
 * Delivery-only and entitlement fields are intentionally excluded.
 */
export function serializeCatalogPrompt(
  item: CatalogPromptSource,
  locale: string,
  fallbackType?: string
): string {
  const tags = (item.tags ?? []).filter(
    (tag): tag is string => typeof tag === 'string' && tag.trim().length > 0
  );
  const prompt = {
    title: pickLocalized(item.title, locale),
    description: pickLocalized(item.description, locale),
    ...(item.imageHint ? { imageHint: pickLocalized(item.imageHint, locale) } : {}),
    ...(item.type || fallbackType ? { type: item.type ?? fallbackType } : {}),
    tags,
  };

  return JSON.stringify(prompt, null, 2);
}
