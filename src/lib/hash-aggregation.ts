/**
 * Hash Aggregation — equivalente en memoria a GROUP BY con tabla hash dinámica.
 * Un solo paso O(n) sobre los datos; evita ordenar todo el conjunto para contar.
 *
 * Motores de BD:
 *   MongoDB  → $group (hash table en memoria o spill a disco)
 *   PostgreSQL → HashAggregate (plan GROUP BY sin sort global)
 *   Spark    → map-side combine + reduceByKey
 */

export type HashCountMap = Map<string, number>;

export type SortedHashEntry = { key: string; count: number };

export type HashAggregateOptions = {
  minCount?: number;
  limit?: number;
  excludeKeys?: ReadonlySet<string>;
};

export type HashAggregateStats = {
  /** Filas del catálogo escaneadas. */
  inputRows: number;
  /** Claves distintas en la tabla hash (cardinalidad del GROUP BY). */
  uniqueGroups: number;
  /** Build: una pasada O(n); lookup O(1); top-K: O(u + k log k), u = grupos únicos. */
  buildComplexity: 'O(n)';
  groupByEngine: 'hash-table';
};

/** Clave canónica para tablas hash (misma familia que facet index / búsqueda). */
export function normalizeHashKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

/** Incrementa contador en tabla hash — O(1) amortizado. */
export function hashIncrement<K>(
  table: Map<K, number>,
  key: K,
  delta = 1
): void {
  table.set(key, (table.get(key) ?? 0) + delta);
}

/**
 * GROUP BY: cuenta ocurrencias de cada clave (una o varias por registro).
 * Un paso lineal O(n × f) donde f = campos/keys por ítem.
 */
export function hashCountBy<T>(
  items: readonly T[],
  getKeys: (item: T) => Iterable<string | null | undefined>
): HashCountMap {
  const table: HashCountMap = new Map();

  for (const item of items) {
    for (const raw of getKeys(item)) {
      const key = raw?.trim();
      if (!key) continue;
      hashIncrement(table, key);
    }
  }

  return table;
}

/**
 * Varios GROUP BY en un solo scan (tags, stacks, membership, etc.).
 */
export function hashCountByFields<T>(
  items: readonly T[],
  fields: ReadonlyArray<{
    field: string;
    getKeys: (item: T) => Iterable<string | null | undefined>;
  }>
): Record<string, HashCountMap> {
  const tables: Record<string, HashCountMap> = {};
  for (const { field } of fields) {
    tables[field] = new Map();
  }

  for (const item of items) {
    for (const { field, getKeys } of fields) {
      const table = tables[field]!;
      for (const raw of getKeys(item)) {
        const key = raw?.trim();
        if (!key) continue;
        hashIncrement(table, key);
      }
    }
  }

  return tables;
}

/**
 * GROUP BY con acumulador personalizado (SUM, lista de ids, etc.).
 */
export function hashGroupBy<T, K, A>(
  items: readonly T[],
  getKey: (item: T) => K | null | undefined,
  createAccumulator: () => A,
  accumulate: (acc: A, item: T) => void
): Map<K, A> {
  const table = new Map<K, A>();

  for (const item of items) {
    const key = getKey(item);
    if (key === null || key === undefined) continue;

    let acc = table.get(key);
    if (acc === undefined) {
      acc = createAccumulator();
      table.set(key, acc);
    }
    accumulate(acc, item);
  }

  return table;
}

/**
 * Top-K por conteo sin ordenar toda la tabla cuando hay `limit`.
 * O(u + k log k) con heap; sin limit, equivalente a sort completo O(u log u).
 */
export function hashTopK(
  table: HashCountMap,
  options: HashAggregateOptions = {}
): SortedHashEntry[] {
  const { minCount = 0, limit, excludeKeys } = options;

  if (limit === undefined) {
    const rows: SortedHashEntry[] = [];
    for (const [key, count] of table) {
      if (count < minCount) continue;
      if (excludeKeys?.has(key)) continue;
      rows.push({ key, count });
    }
    rows.sort((a, b) => b.count - a.count);
    return rows;
  }

  if (limit <= 0) return [];

  const heap: SortedHashEntry[] = [];

  const beatsMin = (count: number) =>
    heap.length < limit || count > (heap[0]?.count ?? 0);

  const sink = (i: number) => {
    const n = heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && heap[left]!.count < heap[smallest]!.count) {
        smallest = left;
      }
      if (right < n && heap[right]!.count < heap[smallest]!.count) {
        smallest = right;
      }
      if (smallest === i) break;
      const tmp = heap[i]!;
      heap[i] = heap[smallest]!;
      heap[smallest] = tmp;
    }
  };

  for (const [key, count] of table) {
    if (count < minCount) continue;
    if (excludeKeys?.has(key)) continue;
    if (!beatsMin(count)) continue;

    if (heap.length < limit) {
      heap.push({ key, count });
      let i = heap.length - 1;
      while (i > 0) {
        const parent = (i - 1) >> 1;
        if (heap[parent]!.count <= heap[i]!.count) break;
        const tmp = heap[parent]!;
        heap[parent] = heap[i]!;
        heap[i] = tmp;
        i = parent;
      }
    } else {
      heap[0] = { key, count };
      sink(0);
    }
  }

  heap.sort((a, b) => b.count - a.count);
  return heap;
}

/** Proyección hash → filas { key, count } (usa hashTopK si hay limit). */
export function hashEntriesSorted(
  table: HashCountMap,
  options: HashAggregateOptions = {}
): SortedHashEntry[] {
  return hashTopK(table, options);
}

/** Combina tablas parciales (map-side combine / merge de shards). */
export function hashMergeCountTables(
  ...tables: ReadonlyArray<HashCountMap>
): HashCountMap {
  const merged: HashCountMap = new Map();
  for (const table of tables) {
    for (const [key, count] of table) {
      hashIncrement(merged, key, count);
    }
  }
  return merged;
}

export function hashAggregateStats(
  table: HashCountMap,
  inputRows: number
): HashAggregateStats {
  return {
    inputRows,
    uniqueGroups: table.size,
    buildComplexity: 'O(n)',
    groupByEngine: 'hash-table',
  };
}

export function hashLookup(table: HashCountMap, key: string): number {
  return table.get(key) ?? 0;
}

export function hashSum(entries: ReadonlyArray<{ count: number }>): number {
  let sum = 0;
  for (const e of entries) sum += e.count;
  return sum;
}

export function hashUniqueKeyCount(table: HashCountMap): number {
  return table.size;
}
