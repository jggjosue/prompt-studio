'use client';

import {
  aggregateMediaTagCategories,
  aggregateWebTagCategories,
  buildTagFilterIndex,
  type WebTagAggregateResult,
} from '@/lib/catalog-tag-aggregation';
import { imageTagsData as staticImageTagsData } from '@/lib/image-tags-data';
import { videoTagsData as staticVideoTagsData } from '@/lib/video-tags-data';
import { webTagCategoryDefs } from '@/lib/web-tags-data';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { VideoProp } from '@/lib/placeholder-videos';
import type { WebPageEntry } from '@/lib/web-pages';
import { useMemo } from 'react';

export function useImageTagAggregates(
  images: ReadonlyArray<ImagePlaceholder>
) {
  return useMemo(
    () => aggregateMediaTagCategories(images, staticImageTagsData),
    [images]
  );
}

export function useVideoTagAggregates(videos: ReadonlyArray<VideoProp>) {
  return useMemo(
    () => aggregateMediaTagCategories(videos, staticVideoTagsData),
    [videos]
  );
}

export function useWebTagAggregates(
  pages: ReadonlyArray<WebPageEntry>
): WebTagAggregateResult {
  return useMemo(
    () => aggregateWebTagCategories(pages, webTagCategoryDefs),
    [pages]
  );
}

/** Índice hash tag → ítems para filtrado O(1) por etiqueta seleccionada. */
export function useImageTagFilterIndex(images: ReadonlyArray<ImagePlaceholder>) {
  return useMemo(
    () =>
      buildTagFilterIndex(images, item => item.tags),
    [images]
  );
}

export function useVideoTagFilterIndex(videos: ReadonlyArray<VideoProp>) {
  return useMemo(
    () => buildTagFilterIndex(videos, item => item.tags ?? []),
    [videos]
  );
}

export function useWebPageTagFilterIndex(pages: ReadonlyArray<WebPageEntry>) {
  return useMemo(() => {
    const byTag = buildTagFilterIndex(pages, p => p.tags);
    const byStack = buildTagFilterIndex(pages, p => p.stack);
    const byMembership = buildTagFilterIndex(pages, p =>
      p.membership ? [p.membership] : []
    );
    return { byTag, byStack, byMembership };
  }, [pages]);
}
