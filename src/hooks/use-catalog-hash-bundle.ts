'use client';

import {
  buildMediaCatalogHashBundle,
  buildWebCatalogHashBundle,
  filterCatalogByFacets,
  type CatalogHashBundleOptions,
} from '@/lib/catalog-hash-bundle';
import type { CatalogFacetFields, FacetFilter } from '@/lib/catalog-facet-index';
import { useMemo } from 'react';

/**
 * Un scan: GROUP BY hash + índice B+; filtra facetas en O(log n) por clave.
 */
export function useMediaCatalogHashBundle<T>(
  items: readonly T[],
  getId: (item: T) => string,
  getTags: (item: T) => readonly string[],
  facet: FacetFilter,
  options?: CatalogHashBundleOptions
) {
  const bundle = useMemo(
    () => buildMediaCatalogHashBundle(items, getId, getTags, options),
    [items]
  );

  const filtered = useMemo(
    () => filterCatalogByFacets(bundle, items, facet),
    [bundle, items, facet.tag, facet.stack, facet.membership]
  );

  return {
    topTags: bundle.facetSummary.topTags,
    filtered,
    facetIndex: bundle.facetIndex,
    stats: bundle.stats,
  };
}

export function useWebCatalogHashBundle<T>(
  items: readonly T[],
  getId: (item: T) => string,
  getFacets: (item: T) => CatalogFacetFields,
  facet: FacetFilter,
  options?: CatalogHashBundleOptions
) {
  const bundle = useMemo(
    () => buildWebCatalogHashBundle(items, getId, getFacets, options),
    [items]
  );

  const filtered = useMemo(
    () => filterCatalogByFacets(bundle, items, facet),
    [bundle, items, facet.tag, facet.stack, facet.membership]
  );

  return {
    topTags: bundle.facetSummary.topTags,
    topStacks: bundle.facetSummary.topStacks,
    filtered,
    facetIndex: bundle.facetIndex,
    stats: bundle.stats,
  };
}
