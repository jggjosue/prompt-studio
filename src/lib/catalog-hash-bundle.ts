/**
 * Pipeline de catálogo: un scan → índice B+ (filtro) + tablas hash (GROUP BY / UI).
 * Evita dos pasadas O(n) separadas (facet index + hashCountBy).
 */

import {
  CatalogFacetIndex,
  type CatalogFacetFields,
  type FacetFilter,
  type FacetHashTables,
} from '@/lib/catalog-facet-index';
import {
  hashAggregateStats,
  hashTopK,
  type HashAggregateStats,
  type SortedHashEntry,
} from '@/lib/hash-aggregation';
import type { TagFacetSummary, WebFacetSummary } from '@/lib/catalog-tag-aggregation';

export type CatalogHashBundleOptions = {
  topN?: number;
  minCount?: number;
};

export type MediaCatalogHashBundle<T> = {
  facetIndex: CatalogFacetIndex<T>;
  hashTables: FacetHashTables;
  facetSummary: TagFacetSummary;
  stats: HashAggregateStats;
};

export type WebCatalogHashBundle<T> = {
  facetIndex: CatalogFacetIndex<T>;
  hashTables: FacetHashTables;
  facetSummary: WebFacetSummary;
  stats: HashAggregateStats;
};

export function buildMediaCatalogHashBundle<T>(
  items: readonly T[],
  getId: (item: T) => string,
  getTags: (item: T) => readonly string[],
  options: CatalogHashBundleOptions = {}
): MediaCatalogHashBundle<T> {
  const topN = options.topN ?? 12;
  const minCount = options.minCount ?? 1;

  const facetIndex = new CatalogFacetIndex<T>();
  const hashTables = facetIndex.buildWithHashAggregates(items, getId, item => ({
    tags: getTags(item),
  }));

  return {
    facetIndex,
    hashTables,
    facetSummary: {
      topTags: hashTopK(hashTables.tags, { limit: topN, minCount }),
      totalTaggedRecords: items.length,
    },
    stats: hashAggregateStats(hashTables.tags, items.length),
  };
}

export function buildWebCatalogHashBundle<T>(
  items: readonly T[],
  getId: (item: T) => string,
  getFacets: (item: T) => CatalogFacetFields,
  options: CatalogHashBundleOptions = {}
): WebCatalogHashBundle<T> {
  const topN = options.topN ?? 12;
  const minCount = options.minCount ?? 1;

  const facetIndex = new CatalogFacetIndex<T>();
  const hashTables = facetIndex.buildWithHashAggregates(items, getId, getFacets);

  return {
    facetIndex,
    hashTables,
    facetSummary: {
      topTags: hashTopK(hashTables.tags, { limit: topN, minCount }),
      topStacks: hashTopK(hashTables.stack, { limit: topN, minCount }),
      topMembership: hashTopK(hashTables.membership, {
        limit: 6,
        minCount: 1,
      }),
      totalRecords: items.length,
    },
    stats: hashAggregateStats(hashTables.tags, items.length),
  };
}

export function filterCatalogByFacets<T>(
  bundle: { facetIndex: CatalogFacetIndex<T> },
  items: readonly T[],
  facet: FacetFilter
): T[] {
  return bundle.facetIndex.filter(items, facet);
}

export type CatalogHashBundleTopTags = {
  topTags: SortedHashEntry[];
  topStacks?: SortedHashEntry[];
};
