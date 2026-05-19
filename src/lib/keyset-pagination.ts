/**
 * Keyset (cursor) pagination — O(log n + limit) per page on a sorted key.
 *
 * Evita OFFSET (`LIMIT n OFFSET m`), que en BD obliga a leer y descartar
 * las primeras m filas: coste crece con la profundidad de página.
 *
 * Keyset: comparación directa sobre clave indexada (id, timestamp):
 *   `WHERE id > $after ORDER BY id ASC LIMIT $n`  → tiempo ~constante por página.
 *
 * Cliente (catálogo JSON): binary search + slice; servidor: mismo contrato en API.
 */

export type KeysetCursor = string | null;

export type KeysetPageMeta = {
  /** Motor de paginación (para telemetría / API). */
  mode: 'keyset';
  /** Complejidad por página tras ordenar el catálogo. */
  pageComplexity: 'O(log n + limit)';
  /** Complejidad equivalente con OFFSET en la misma posición. */
  offsetEquivalent: 'O(offset + limit)';
};

export type KeysetSlice<T> = {
  items: T[];
  /** 0-based index of first item in the full sorted list */
  startIndex: number;
  /** 0-based index after the last item (exclusive) */
  endIndex: number;
  firstKey: string | null;
  lastKey: string | null;
  hasNext: boolean;
  hasPrevious: boolean;
};

/** Compare cursor keys (numeric ids when possible, else localeCompare). */
export function compareCursorKeys(a: string, b: string): number {
  const na = Number(a);
  const nb = Number(b);
  if (
    Number.isFinite(na) &&
    Number.isFinite(nb) &&
    String(na) === a.trim() &&
    String(nb) === b.trim()
  ) {
    return na - nb;
  }
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

/** Stable ascending sort by cursor key. */
export function keysetSort<T>(
  items: readonly T[],
  getKey: (item: T) => string
): T[] {
  return [...items].sort((a, b) => compareCursorKeys(getKey(a), getKey(b)));
}

/** First index where getKey(item) > key (binary search). */
export function keysetLowerBound<T>(
  sorted: readonly T[],
  getKey: (item: T) => string,
  key: string
): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (compareCursorKeys(getKey(sorted[mid]!), key) <= 0) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

/**
 * Forward page: items strictly after `afterKey` (null = from the start).
 * Equivalent to `WHERE key > $after ORDER BY key LIMIT $limit`.
 */
export function keysetSliceForward<T>(
  sorted: readonly T[],
  getKey: (item: T) => string,
  limit: number,
  afterKey: KeysetCursor
): KeysetSlice<T> {
  const start =
    afterKey === null ? 0 : keysetLowerBound(sorted, getKey, afterKey);
  const end = Math.min(start + limit, sorted.length);
  const items = sorted.slice(start, end) as T[];

  return {
    items,
    startIndex: start,
    endIndex: end,
    firstKey: items[0] ? getKey(items[0]) : null,
    lastKey:
      items.length > 0 ? getKey(items[items.length - 1]!) : null,
    hasNext: end < sorted.length,
    hasPrevious: start > 0,
  };
}

export function encodeKeysetCursor(key: KeysetCursor): string | null {
  if (key === null || key === '') return null;
  return encodeURIComponent(key);
}

export function decodeKeysetCursor(raw: string | null | undefined): KeysetCursor {
  if (!raw?.trim()) return null;
  try {
    return decodeURIComponent(raw.trim());
  } catch {
    return raw.trim();
  }
}

/** True si `afterKey` existe en la lista ordenada (cursor compartible válido). */
export function isKeysetCursorInCatalog<T>(
  sorted: readonly T[],
  getKey: (item: T) => string,
  afterKey: KeysetCursor
): boolean {
  if (afterKey === null) return true;
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const cmp = compareCursorKeys(getKey(sorted[mid]!), afterKey);
    if (cmp === 0) return true;
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}

/** Cursor obsoleto (filtro cambió) → primera página. */
export function sanitizeKeysetCursor<T>(
  sorted: readonly T[],
  getKey: (item: T) => string,
  afterKey: KeysetCursor
): KeysetCursor {
  if (afterKey === null) return null;
  return isKeysetCursorInCatalog(sorted, getKey, afterKey) ? afterKey : null;
}

export function keysetPageMeta(): KeysetPageMeta {
  return {
    mode: 'keyset',
    pageComplexity: 'O(log n + limit)',
    offsetEquivalent: 'O(offset + limit)',
  };
}
