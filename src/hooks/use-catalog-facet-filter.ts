'use client';

import {
  CatalogFacetIndex,
  type CatalogFacetFields,
  type FacetFilter,
} from '@/lib/catalog-facet-index';
import { useMemo } from 'react';

/**
 * Filtra el catálogo por tag/stack/membership con índice B+ (O(log n) por faceta).
 */
export function useCatalogFacetFilter<T>(
  items: readonly T[],
  getId: (item: T) => string,
  getFacets: (item: T) => CatalogFacetFields,
  facet: FacetFilter
): T[] {
  const index = useMemo(
    () => CatalogFacetIndex.fromItems(items, getId, getFacets),
    [items]
  );

  return useMemo(
    () => index.filter(items, facet),
    [index, items, facet.tag, facet.stack, facet.membership]
  );
}
