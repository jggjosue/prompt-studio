/**
 * Agregaciones de catálogo (tags / stacks / membership) vía hash tables.
 */

import {
  CatalogFacetIndex,
  type CatalogFacetFields,
  type FacetHashTables,
} from '@/lib/catalog-facet-index';
import {
  hashCountBy,
  hashLookup,
  hashSum,
  hashTopK,
  type HashCountMap,
  type SortedHashEntry,
} from '@/lib/hash-aggregation';
import type { TagCategory } from '@/lib/image-tags-data';
import type { WebTagCategory } from '@/lib/web-tags-data';

export type TagWithCount = { name: string; count: number };

export type CategoryWithCounts = Omit<TagCategory, 'tags' | 'count'> & {
  tags: TagWithCount[];
  count: number;
};

export type WebCategoryWithCounts = Omit<WebTagCategory, 'tags'> & {
  tags: TagWithCount[];
  count: number;
};

/** GROUP BY tag desde tabla hash ya construida. */
export function aggregateMediaTagCategoriesFromTable(
  tagCounts: HashCountMap,
  staticDefs: readonly TagCategory[]
): { categories: CategoryWithCounts[]; totalUniqueTags: number } {
  const catalogTagNames = new Set<string>();

  const categories = staticDefs.map(category => {
    const tagsWithCounts: TagWithCount[] = category.tags.map(tag => {
      catalogTagNames.add(tag.name);
      return {
        name: tag.name,
        count: hashLookup(tagCounts, tag.name),
      };
    });

    tagsWithCounts.sort((a, b) => b.count - a.count);

    return {
      ...category,
      tags: tagsWithCounts,
      count: hashSum(tagsWithCounts),
    };
  });

  return {
    categories,
    totalUniqueTags: catalogTagNames.size,
  };
}

/** GROUP BY tag en imágenes o videos (una pasada, tabla hash). */
export function aggregateMediaTagCategories(
  items: ReadonlyArray<{ id: string; tags: string[] }>,
  staticDefs: readonly TagCategory[]
): { categories: CategoryWithCounts[]; totalUniqueTags: number } {
  const facetIndex = new CatalogFacetIndex<(typeof items)[number]>();
  const tables = facetIndex.buildWithHashAggregates(
    items,
    item => item.id,
    item => ({ tags: item.tags })
  );
  return aggregateMediaTagCategoriesFromTable(tables.tags, staticDefs);
}

export type WebTagAggregateResult = {
  categories: WebCategoryWithCounts[];
  totalWebPages: number;
  totalUniqueTags: number;
};

/** GROUP BY tag | stack | membership (tablas hash ya materializadas). */
export function aggregateWebTagCategoriesFromTables(
  totalPages: number,
  tables: FacetHashTables,
  defs: readonly WebTagCategory[],
  options?: { popularMinCount?: number; popularLimit?: number }
): WebTagAggregateResult {
  const tagCounts = tables.tags;
  const stackCounts = tables.stack;
  const membershipCounts = tables.membership;

  const assignedTags = new Set<string>();

  const categories: WebCategoryWithCounts[] = defs.map(def => {
    const countTable = resolveWebCountTable(
      def.kind,
      tagCounts,
      stackCounts,
      membershipCounts
    );

    const tagsWithCounts: TagWithCount[] = def.tags
      .map(name => {
        const count = hashLookup(countTable, name);
        if (def.kind === 'tag' && count > 0) {
          assignedTags.add(name);
        }
        return { name, count };
      })
      .filter(tag => tag.count > 0)
      .sort((a, b) => b.count - a.count);

    return {
      ...def,
      tags: tagsWithCounts,
      count: hashSum(tagsWithCounts),
    };
  });

  const popularTags = buildPopularWebTags(
    tagCounts,
    assignedTags,
    options?.popularMinCount ?? 2,
    options?.popularLimit ?? 24
  );

  if (popularTags.length > 0) {
    categories.push({
      name: 'Popular Tags',
      description: 'Frequently used tags across landing page prompts',
      icon: 'Tag',
      kind: 'tag',
      tags: popularTags,
      count: hashSum(popularTags),
    });
  }

  return {
    categories: categories.filter(category => category.tags.length > 0),
    totalWebPages: totalPages,
    totalUniqueTags: tagCounts.size,
  };
}

/** GROUP BY tag | stack | membership para landing pages (un scan, tres tablas hash). */
export function aggregateWebTagCategories(
  pages: ReadonlyArray<{
    id: string;
    tags: string[];
    stack: string[];
    membership?: string;
  }>,
  defs: readonly WebTagCategory[],
  options?: { popularMinCount?: number; popularLimit?: number }
): WebTagAggregateResult {
  const facetIndex = new CatalogFacetIndex<(typeof pages)[number]>();
  const tables = facetIndex.buildWithHashAggregates(
    pages,
    p => p.id,
    p => ({
      tags: p.tags,
      stack: p.stack,
      membership: p.membership ?? null,
    })
  );
  return aggregateWebTagCategoriesFromTables(
    pages.length,
    tables,
    defs,
    options
  );
}

function resolveWebCountTable(
  kind: WebTagCategory['kind'],
  tagCounts: HashCountMap,
  stackCounts: HashCountMap,
  membershipCounts: HashCountMap
): HashCountMap {
  if (kind === 'stack') return stackCounts;
  if (kind === 'membership') return membershipCounts;
  return tagCounts;
}

function buildPopularWebTags(
  tagCounts: HashCountMap,
  assignedTags: ReadonlySet<string>,
  minCount: number,
  limit: number
): TagWithCount[] {
  return hashTopK(tagCounts, {
    minCount,
    limit,
    excludeKeys: assignedTags,
  }).map(({ key, count }) => ({ name: key, count }));
}

/** Índice B+ por facetas (tag / stack / membership). Build O(n), lookup O(log n). */
export type TagFilterIndex<T> = CatalogFacetIndex<T>;

/** @deprecated Usa `CatalogFacetIndex.fromItems` con tags, stack y membership. */
export function buildTagFilterIndex<T>(
  items: readonly T[],
  getTags: (item: T) => string[],
  getId: (item: T) => string
): CatalogFacetIndex<T> {
  return CatalogFacetIndex.fromItems(items, getId, item => ({
    tags: getTags(item),
  }));
}

export function buildWebFacetIndex<T>(
  items: readonly T[],
  getId: (item: T) => string,
  getFacets: (item: T) => CatalogFacetFields
): CatalogFacetIndex<T> {
  return CatalogFacetIndex.fromItems(items, getId, getFacets);
}

export function filterItemsByTag<T>(
  index: CatalogFacetIndex<T>,
  tag: string
): T[] {
  return index.filterByTag(tag);
}

export function filterItemsByStack<T>(
  index: CatalogFacetIndex<T>,
  stack: string
): T[] {
  return index.filterByStack(stack);
}

export function filterItemsByMembership<T>(
  index: CatalogFacetIndex<T>,
  membership: string
): T[] {
  return index.filterByMembership(membership);
}

export type TagFacetSummary = {
  topTags: SortedHashEntry[];
  totalTaggedRecords: number;
};

export type WebFacetSummary = {
  topTags: SortedHashEntry[];
  topStacks: SortedHashEntry[];
  topMembership: SortedHashEntry[];
  totalRecords: number;
};

/** Resumen rápido de facetas para UI (top N tags). */
export function summarizeTagFacets<T>(
  items: readonly T[],
  getTags: (item: T) => string[],
  options?: { topN?: number; minCount?: number }
): TagFacetSummary {
  const topN = options?.topN ?? 12;
  const minCount = options?.minCount ?? 1;
  const table = hashCountBy(items, item => getTags(item));
  return {
    topTags: hashTopK(table, { limit: topN, minCount }),
    totalTaggedRecords: items.length,
  };
}

/** Top tags, stacks y membership en un solo scan (hash aggregation). */
export function summarizeWebFacets(
  pages: ReadonlyArray<{
    id: string;
    tags: string[];
    stack: string[];
    membership?: string;
  }>,
  options?: { topN?: number; minCount?: number }
): WebFacetSummary {
  const topN = options?.topN ?? 12;
  const minCount = options?.minCount ?? 1;

  const facetIndex = new CatalogFacetIndex<(typeof pages)[number]>();
  const tables = facetIndex.buildWithHashAggregates(
    pages,
    p => p.id,
    p => ({
      tags: p.tags,
      stack: p.stack,
      membership: p.membership ?? null,
    })
  );

  return {
    topTags: hashTopK(tables.tags, { limit: topN, minCount }),
    topStacks: hashTopK(tables.stack, { limit: topN, minCount }),
    topMembership: hashTopK(tables.membership, { limit: 6, minCount: 1 }),
    totalRecords: pages.length,
  };
}

/** Dashboard: tres catálogos, tres GROUP BY hash (datasets distintos). */
export function summarizeDashboardCatalogFacets(input: {
  landings: ReadonlyArray<{
    id: string;
    tags: string[];
    stack: string[];
    membership?: string;
  }>;
  images: ReadonlyArray<{ tags: string[] }>;
  videos: ReadonlyArray<{ tags: string[] }>;
  topN?: number;
  minCount?: number;
}) {
  const topN = input.topN ?? 8;
  const minCount = input.minCount ?? 2;
  return {
    landing: summarizeWebFacets(input.landings, { topN, minCount }),
    image: summarizeTagFacets(input.images, p => p.tags, { topN, minCount }),
    video: summarizeTagFacets(input.videos, p => p.tags, { topN, minCount }),
  };
}
