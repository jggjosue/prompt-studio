'use client';

import { CatalogFacetIndex } from '@/lib/catalog-facet-index';
import {
  aggregateMediaTagCategoriesFromTable,
  aggregateWebTagCategoriesFromTables,
  type WebTagAggregateResult,
} from '@/lib/catalog-tag-aggregation';
import { webTagCategoryDefs } from '@/lib/web-tags-data';
import { imageTagsData as staticImageTagsData } from '@/lib/image-tags-data';
import { videoTagsData as staticVideoTagsData } from '@/lib/video-tags-data';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { VideoProp } from '@/lib/placeholder-videos';
import type { WebPageEntry } from '@/lib/web-pages';
import { useMemo } from 'react';

export function useMediaCatalogHashPipeline<
  T extends { id: string; tags: string[] },
>(items: ReadonlyArray<T>) {
  return useMemo(() => {
    const facetIndex = new CatalogFacetIndex<T>();
    const hashTables = facetIndex.buildWithHashAggregates(
      items,
      item => item.id,
      item => ({ tags: item.tags })
    );
    return { facetIndex, hashTables };
  }, [items]);
}

function useMediaTagsCatalogPipeline<T extends { id: string; tags: string[] }>(
  items: ReadonlyArray<T>,
  staticDefs: typeof staticImageTagsData
) {
  return useMemo(() => {
    const facetIndex = new CatalogFacetIndex<T>();
    const hashTables = facetIndex.buildWithHashAggregates(
      items,
      item => item.id,
      item => ({ tags: item.tags })
    );
    const aggregates = aggregateMediaTagCategoriesFromTable(
      hashTables.tags,
      staticDefs
    );
    return { facetIndex, hashTables, ...aggregates };
  }, [items, staticDefs]);
}

/** Un scan: GROUP BY hash + índice B+ para /image-tags. */
export function useImageTagsCatalogPipeline(
  images: ReadonlyArray<ImagePlaceholder>
) {
  return useMediaTagsCatalogPipeline(images, staticImageTagsData);
}

/** Un scan: GROUP BY hash + índice B+ para /video-tags. */
export function useVideoTagsCatalogPipeline(videos: ReadonlyArray<VideoProp>) {
  return useMemo(() => {
    const facetIndex = new CatalogFacetIndex<VideoProp>();
    const hashTables = facetIndex.buildWithHashAggregates(
      videos,
      v => v.id,
      v => ({ tags: v.tags ?? [] })
    );
    const aggregates = aggregateMediaTagCategoriesFromTable(
      hashTables.tags,
      staticVideoTagsData
    );
    return { facetIndex, hashTables, ...aggregates };
  }, [videos]);
}

/** @deprecated Usa `useImageTagsCatalogPipeline`. */
export function useImageTagAggregates(
  images: ReadonlyArray<ImagePlaceholder>
) {
  const { categories, totalUniqueTags } = useImageTagsCatalogPipeline(images);
  return { categories, totalUniqueTags };
}

/** @deprecated Usa `useVideoTagsCatalogPipeline`. */
export function useVideoTagAggregates(videos: ReadonlyArray<VideoProp>) {
  const { categories, totalUniqueTags } = useVideoTagsCatalogPipeline(videos);
  return { categories, totalUniqueTags };
}

/** @deprecated Usa `useWebCatalogHashPipeline(pages).aggregates`. */
export function useWebTagAggregates(
  pages: ReadonlyArray<WebPageEntry>
): WebTagAggregateResult {
  return useWebCatalogHashPipeline(pages).aggregates;
}

/**
 * Un scan: tablas hash GROUP BY + índice B+ (web-tags / filtrado).
 */
export function useWebCatalogHashPipeline(pages: ReadonlyArray<WebPageEntry>) {
  return useMemo(() => {
    const facetIndex = new CatalogFacetIndex<WebPageEntry>();
    const hashTables = facetIndex.buildWithHashAggregates(
      pages,
      p => p.id,
      p => ({
        tags: p.tags,
        stack: p.stack,
        membership: p.membership ?? null,
      })
    );
    const aggregates = aggregateWebTagCategoriesFromTables(
      pages.length,
      hashTables,
      webTagCategoryDefs
    );
    return { facetIndex, hashTables, aggregates };
  }, [pages]);
}

/** @deprecated Usa `useMediaCatalogHashPipeline(items).facetIndex`. */
export function useImageTagFilterIndex(images: ReadonlyArray<ImagePlaceholder>) {
  return useMediaCatalogHashPipeline(images).facetIndex;
}

export function useVideoTagFilterIndex(videos: ReadonlyArray<VideoProp>) {
  return useVideoTagsCatalogPipeline(videos).facetIndex;
}

/** @deprecated Usa `useWebCatalogHashPipeline(pages).facetIndex`. */
export function useWebPageTagFilterIndex(pages: ReadonlyArray<WebPageEntry>) {
  return useWebCatalogHashPipeline(pages).facetIndex;
}
