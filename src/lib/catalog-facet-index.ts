/**
 * Índice de facetas (tag / stack / membership) sobre B+ Tree.
 * Lookup exacto O(log n) por clave compuesta en lugar de escanear O(n) registros.
 *
 * Equivalente en MongoDB:
 *   db.pages.createIndex({ tags: 1 })
 *   db.pages.createIndex({ stack: 1 })
 */

import { BPlusTree } from '@/lib/bplus-tree';
import { hashIncrement, type HashCountMap } from '@/lib/hash-aggregation';

export type FacetFilter = {
  tag?: string | null;
  stack?: string | null;
  membership?: string | null;
};

function normalizeFacetValue(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function facetKey(kind: 'tag' | 'stack' | 'membership', value: string): string {
  return `${kind}:${normalizeFacetValue(value)}`;
}

export type CatalogFacetFields = {
  tags?: readonly string[];
  stack?: readonly string[];
  membership?: string | null;
};

/** Tablas hash GROUP BY generadas en el mismo scan que el índice B+. */
export type FacetHashTables = {
  tags: HashCountMap;
  stack: HashCountMap;
  membership: HashCountMap;
};

function emptyFacetHashTables(): FacetHashTables {
  return { tags: new Map(), stack: new Map(), membership: new Map() };
}

/**
 * tag|stack|membership → ids (B+ Tree de claves lexicográficas).
 */
export class CatalogFacetIndex<T> {
  private readonly tree = new BPlusTree<Set<string>>();
  private readonly itemsById = new Map<string, T>();
  private keyCount = 0;

  static fromItems<T>(
    items: readonly T[],
    getId: (item: T) => string,
    getFacets: (item: T) => CatalogFacetFields
  ): CatalogFacetIndex<T> {
    const index = new CatalogFacetIndex<T>();
    index.build(items, getId, getFacets);
    return index;
  }

  build<TItem>(
    items: readonly TItem[],
    getId: (item: TItem) => string,
    getFacets: (item: TItem) => CatalogFacetFields
  ): void {
    this.buildWithHashAggregates(items, getId, getFacets);
  }

  /**
   * Un solo scan O(n): índice B+ para filtrar + tablas hash para GROUP BY / facetas UI.
   */
  buildWithHashAggregates<TItem>(
    items: readonly TItem[],
    getId: (item: TItem) => string,
    getFacets: (item: TItem) => CatalogFacetFields
  ): FacetHashTables {
    const tables = emptyFacetHashTables();

    for (const item of items) {
      const id = getId(item);
      this.itemsById.set(id, item as unknown as T);

      const { tags = [], stack = [], membership } = getFacets(item);

      for (const tag of tags) {
        const key = tag?.trim();
        if (!key) continue;
        this.addPosting('tag', key, id);
        hashIncrement(tables.tags, key);
      }
      for (const stackName of stack) {
        const key = stackName?.trim();
        if (!key) continue;
        this.addPosting('stack', key, id);
        hashIncrement(tables.stack, key);
      }
      if (membership) {
        const key = membership.trim();
        if (key) {
          this.addPosting('membership', key, id);
          hashIncrement(tables.membership, key);
        }
      }
    }

    return tables;
  }

  getStats(itemCount: number): {
    itemCount: number;
    facetKeyCount: number;
    lookupComplexity: 'O(log n)';
    scanComplexity: 'O(n)';
  } {
    return {
      itemCount,
      facetKeyCount: this.keyCount,
      lookupComplexity: 'O(log n)',
      scanComplexity: 'O(n)',
    };
  }

  private addPosting(
    kind: 'tag' | 'stack' | 'membership',
    value: string,
    id: string
  ): void {
    const key = facetKey(kind, value);
    const existing = this.tree.search(key);
    if (existing) {
      existing.add(id);
      return;
    }
    this.tree.insert(key, new Set([id]));
    this.keyCount++;
  }

  /** Ids que cumplen todas las facetas activas; `null` = sin filtro. */
  resolveIds(filter: FacetFilter): Set<string> | null {
    const constraints: Array<Set<string>> = [];

    if (filter.tag?.trim()) {
      const ids = this.lookup('tag', filter.tag);
      if (ids.size === 0) return new Set();
      constraints.push(ids);
    }
    if (filter.stack?.trim()) {
      const ids = this.lookup('stack', filter.stack);
      if (ids.size === 0) return new Set();
      constraints.push(ids);
    }
    if (filter.membership?.trim()) {
      const ids = this.lookup('membership', filter.membership);
      if (ids.size === 0) return new Set();
      constraints.push(ids);
    }

    if (constraints.length === 0) return null;

    let result = constraints[0]!;
    for (let i = 1; i < constraints.length; i++) {
      result = intersectIds(result, constraints[i]!);
      if (result.size === 0) return result;
    }
    return result;
  }

  filter(items: readonly T[], facet: FacetFilter): T[] {
    const ids = this.resolveIds(facet);
    if (!ids) return [...items];
    return this.idsToItems(ids);
  }

  filterByTag(tag: string): T[] {
    return this.idsToItems(this.lookup('tag', tag));
  }

  filterByStack(stack: string): T[] {
    return this.idsToItems(this.lookup('stack', stack));
  }

  filterByMembership(membership: string): T[] {
    return this.idsToItems(this.lookup('membership', membership));
  }

  private idsToItems(ids: Set<string>): T[] {
    const out: T[] = [];
    for (const id of ids) {
      const item = this.itemsById.get(id);
      if (item) out.push(item);
    }
    return out;
  }

  private lookup(
    kind: 'tag' | 'stack' | 'membership',
    value: string
  ): Set<string> {
    const key = facetKey(kind, value);
    return new Set(this.tree.search(key) ?? []);
  }
}

function intersectIds(a: Set<string>, b: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const id of a) {
    if (b.has(id)) out.add(id);
  }
  return out;
}
