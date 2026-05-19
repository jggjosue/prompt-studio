/**
 * Hash Aggregation — equivalente en memoria a GROUP BY con tabla hash dinámica.
 * Un solo paso O(n) sobre los datos; evita ordenar todo el conjunto para contar.
 * (MongoDB $group, PostgreSQL HashAggregate, Spark map-side combine.)
 */

export type HashCountMap = Map<string, number>;

export type SortedHashEntry = { key: string; count: number };

export type HashAggregateOptions = {
  minCount?: number;
  limit?: number;
  excludeKeys?: ReadonlySet<string>;
};

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

/** Proyección de tabla hash → filas { key, count } ordenadas por count desc. */
export function hashEntriesSorted(
  table: HashCountMap,
  options: HashAggregateOptions = {}
): SortedHashEntry[] {
  const { minCount = 0, limit, excludeKeys } = options;
  const rows: SortedHashEntry[] = [];

  for (const [key, count] of table) {
    if (count < minCount) continue;
    if (excludeKeys?.has(key)) continue;
    rows.push({ key, count });
  }

  rows.sort((a, b) => b.count - a.count);
  return limit !== undefined ? rows.slice(0, limit) : rows;
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
