/**
 * Agregaciones de catálogo (tags / stacks / membership) vía hash tables.
 */

import {
  hashCountBy,
  hashCountByFields,
  hashEntriesSorted,
  hashLookup,
  hashSum,
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

export type WebCategoryWithCounts = WebTagCategory & {
  tags: TagWithCount[];
  count: number;
};

/** GROUP BY tag en imágenes o videos (una pasada, tabla hash). */
export function aggregateMediaTagCategories(
  items: ReadonlyArray<{ tags: string[] }>,
  staticDefs: readonly TagCategory[]
): { categories: CategoryWithCounts[]; totalUniqueTags: number } {
  const tagCounts = hashCountBy(items, item => item.tags);
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

export type WebTagAggregateResult = {
  categories: WebCategoryWithCounts[];
  totalWebPages: number;
  totalUniqueTags: number;
};

/** GROUP BY tag | stack | membership para landing pages (un scan, tres tablas hash). */
export function aggregateWebTagCategories(
  pages: ReadonlyArray<{
    tags: string[];
    stack: string[];
    membership?: string;
  }>,
  defs: readonly WebTagCategory[],
  options?: { popularMinCount?: number; popularLimit?: number }
): WebTagAggregateResult {
  const tables = hashCountByFields(pages, [
    { field: 'tags', getKeys: p => p.tags },
    { field: 'stack', getKeys: p => p.stack },
    {
      field: 'membership',
      getKeys: p => (p.membership ? [p.membership] : []),
    },
  ]);

  const tagCounts = tables.tags ?? new Map();
  const stackCounts = tables.stack ?? new Map();
  const membershipCounts = tables.membership ?? new Map();

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
    totalWebPages: pages.length,
    totalUniqueTags: tagCounts.size,
  };
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
  return hashEntriesSorted(tagCounts, {
    minCount,
    limit,
    excludeKeys: assignedTags,
  }).map(({ key, count }) => ({ name: key, count }));
}

/** GROUP BY tag para filtrar ítems por etiqueta — O(n) build, O(1) lookup. */
export function buildTagFilterIndex<T>(
  items: readonly T[],
  getTags: (item: T) => string[]
): Map<string, T[]> {
  const buckets = new Map<string, T[]>();

  for (const item of items) {
    for (const tag of getTags(item)) {
      const key = tag.toLowerCase();
      const list = buckets.get(key);
      if (list) list.push(item);
      else buckets.set(key, [item]);
    }
  }

  return buckets;
}

export function filterItemsByTag<T>(
  index: Map<string, T[]>,
  tag: string
): T[] {
  return index.get(tag.toLowerCase()) ?? [];
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
    topTags: hashEntriesSorted(table, { limit: topN, minCount }),
    totalTaggedRecords: items.length,
  };
}

/** Top tags, stacks y membership en un solo scan (hash aggregation). */
export function summarizeWebFacets(
  pages: ReadonlyArray<{
    tags: string[];
    stack: string[];
    membership?: string;
  }>,
  options?: { topN?: number; minCount?: number }
): WebFacetSummary {
  const topN = options?.topN ?? 12;
  const minCount = options?.minCount ?? 1;

  const tables = hashCountByFields(pages, [
    { field: 'tags', getKeys: p => p.tags },
    { field: 'stack', getKeys: p => p.stack },
    {
      field: 'membership',
      getKeys: p => (p.membership ? [p.membership] : []),
    },
  ]);

  return {
    topTags: hashEntriesSorted(tables.tags ?? new Map(), {
      limit: topN,
      minCount,
    }),
    topStacks: hashEntriesSorted(tables.stack ?? new Map(), {
      limit: topN,
      minCount,
    }),
    topMembership: hashEntriesSorted(tables.membership ?? new Map(), {
      limit: 6,
      minCount: 1,
    }),
    totalRecords: pages.length,
  };
}
