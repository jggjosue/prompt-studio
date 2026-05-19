import data from '../../public/webpages/web-pages.json';
import type { Locale } from '@/i18n/config';
import { pickLocalized, type LocalizedField } from '@/lib/localized-string';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import { resolveWebPageImageUrl } from '@/lib/web-page-media';

export type WebPageEntry = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint: string;
  demoUrl: string;
  stack: string[];
  tags: string[];
  membership: string;
};

type RawWebPageEntry = {
  id?: string;
  title: LocalizedField;
  description: LocalizedField;
  imageUrl: string;
  imageHint: LocalizedField;
  demoUrl: string;
  stack: string[];
  tags: string[];
  membership: string;
};

const rawPages = data.webPages as RawWebPageEntry[];

export function getRawWebPages(): RawWebPageEntry[] {
  return rawPages;
}

export function getRawWebPageById(id: string): RawWebPageEntry | undefined {
  return rawPages.find(page => page.id === id);
}

export function getRawWebPageByDemoSlug(slug: string): RawWebPageEntry | undefined {
  return rawPages.find(page => normalizeDemoFolder(page.demoUrl ?? '') === slug);
}

/** Resuelve `wp-12` → entrada cruda en web-pages.json (índice 1-based del catálogo). */
export function getRawWebPageByCatalogId(catalogId: string): RawWebPageEntry | undefined {
  const match = /^wp-(\d+)$/.exec(catalogId.trim());
  if (!match) return undefined;
  const index = Number.parseInt(match[1]!, 10) - 1;
  if (index < 0 || index >= rawPages.length) return undefined;
  return rawPages[index];
}

function mapWebPage(page: RawWebPageEntry, index: number, locale: Locale | string): WebPageEntry {
  return {
    id: `wp-${index + 1}`,
    title: pickLocalized(page.title, locale),
    description: pickLocalized(page.description, locale),
    imageUrl: resolveWebPageImageUrl(page.imageUrl),
    imageHint: pickLocalized(page.imageHint, locale),
    demoUrl: page.demoUrl,
    stack: page.stack,
    tags: page.tags,
    membership: page.membership,
  };
}

export function getWebPages(locale: Locale | string = 'en'): WebPageEntry[] {
  return rawPages.map((page, index) => mapWebPage(page, index, locale));
}

/** @deprecated Prefer getWebPages(locale) in UI */
export const WebPages: WebPageEntry[] = getWebPages('en');

export function getWebPageById(id: string, locale: Locale | string = 'en'): WebPageEntry | undefined {
  return getWebPages(locale).find(p => p.id === id);
}
