'use client';

import { CatalogSearchIndex } from '@/lib/catalog-search-index';
import {
  fuzzyFilterSort,
  type FuzzySearchOptions,
} from '@/lib/fuzzy-search';
import { useMemo } from 'react';

export type UseFuzzyFilterOptions = FuzzySearchOptions;

/**
 * Filtra con búsqueda difusa + índice B+ Tree (O(log n + k) candidatos, luego Levenshtein).
 */
export function useFuzzyFilter<T>(
  items: readonly T[],
  query: string,
  getFields: (item: T) => readonly string[],
  getId: (item: T) => string,
  options?: UseFuzzyFilterOptions
): T[] {
  const catalogIndex = useMemo(
    () => CatalogSearchIndex.fromItems(items, getId, getFields),
    [items, getId, getFields]
  );

  return useMemo(
    () =>
      fuzzyFilterSort(items, query, getFields, {
        ...options,
        catalogIndex,
        getId: getId as (item: unknown) => string,
      }),
    [items, query, getFields, options, catalogIndex, getId]
  );
}
