/**
 * Respuesta keyset para APIs de catálogo (contrato servidor).
 */

import {
  decodeKeysetCursor,
  encodeKeysetCursor,
  keysetPageMeta,
  keysetSliceForward,
  keysetSort,
  sanitizeKeysetCursor,
  type KeysetCursor,
  type KeysetPageMeta,
} from '@/lib/keyset-pagination';

export type KeysetApiPage<T> = {
  items: T[];
  /** Cursor para la siguiente página (`?after=`). null si no hay más. */
  nextCursor: string | null;
  hasMore: boolean;
  total: number;
  pagination: KeysetPageMeta;
};

export function paginateKeysetCatalog<T>(
  items: readonly T[],
  getKey: (item: T) => string,
  options: {
    after?: string | null;
    limit?: number;
  } = {}
): KeysetApiPage<T> {
  const limit = Math.min(100, Math.max(1, options.limit ?? 30));
  const sorted = keysetSort(items, getKey);
  const after: KeysetCursor = sanitizeKeysetCursor(
    sorted,
    getKey,
    decodeKeysetCursor(options.after ?? null)
  );
  const slice = keysetSliceForward(sorted, getKey, limit, after);

  return {
    items: slice.items,
    nextCursor: slice.hasNext ? encodeKeysetCursor(slice.lastKey) : null,
    hasMore: slice.hasNext,
    total: sorted.length,
    pagination: keysetPageMeta(),
  };
}
