'use client';

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { getPlaceholderImages, type ImagePlaceholder } from '@/lib/placeholder-images';
import { getPlaceholderVideos, type VideoProp } from '@/lib/placeholder-videos';
import { getWebPages, type WebPageEntry } from '@/lib/web-pages';

export function useLocalizedPlaceholderImages(): ImagePlaceholder[] {
  const locale = useLocale() as Locale;
  return useMemo(() => getPlaceholderImages(locale), [locale]);
}

export function useLocalizedPlaceholderVideos(): VideoProp[] {
  const locale = useLocale() as Locale;
  return useMemo(() => getPlaceholderVideos(locale), [locale]);
}

export function useLocalizedWebPages(): WebPageEntry[] {
  const locale = useLocale() as Locale;
  return useMemo(() => getWebPages(locale), [locale]);
}
