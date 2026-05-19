'use client';

import {
  decodeKeysetCursor,
  encodeKeysetCursor,
  keysetSliceForward,
  keysetSort,
  type KeysetCursor,
} from '@/lib/keyset-pagination';
import { useCallback, useEffect, useMemo, useState } from 'react';

export type UseKeysetPaginationOptions = {
  /** Reset to the first page when these values change (e.g. search query, tag). */
  resetDeps?: readonly unknown[];
};

export type UseKeysetPaginationResult<T> = {
  items: T[];
  hasNext: boolean;
  hasPrev: boolean;
  /** 1-based approximate page index (depth of cursor stack). */
  pageIndex: number;
  rangeStart: number;
  rangeEnd: number;
  totalCount: number;
  goNext: () => void;
  goPrev: () => void;
  reset: () => void;
};

/**
 * Client-side keyset pagination over an in-memory catalog.
 * Maintains a stack of `after` cursors so "previous" is O(1) without OFFSET.
 */
export function useKeysetPagination<T>(
  items: readonly T[],
  getKey: (item: T) => string,
  pageSize: number,
  options: UseKeysetPaginationOptions = {}
): UseKeysetPaginationResult<T> {
  const { resetDeps = [] } = options;
  const sorted = useMemo(() => keysetSort(items, getKey), [items, getKey]);

  const [afterStack, setAfterStack] = useState<KeysetCursor[]>([null]);

  const resetKey = useMemo(
    () => JSON.stringify(resetDeps),
    [resetDeps]
  );

  useEffect(() => {
    setAfterStack([null]);
  }, [sorted.length, resetKey]);

  const afterKey = afterStack[afterStack.length - 1] ?? null;

  const slice = useMemo(
    () => keysetSliceForward(sorted, getKey, pageSize, afterKey),
    [sorted, getKey, pageSize, afterKey]
  );

  const goNext = useCallback(() => {
    if (!slice.hasNext || !slice.lastKey) return;
    setAfterStack(stack => [...stack, slice.lastKey]);
  }, [slice.hasNext, slice.lastKey]);

  const goPrev = useCallback(() => {
    setAfterStack(stack => (stack.length > 1 ? stack.slice(0, -1) : stack));
  }, []);

  const reset = useCallback(() => {
    setAfterStack([null]);
  }, []);

  return {
    items: slice.items,
    hasNext: slice.hasNext,
    hasPrev: afterStack.length > 1,
    pageIndex: afterStack.length,
    rangeStart: slice.items.length === 0 ? 0 : slice.startIndex + 1,
    rangeEnd: slice.endIndex,
    totalCount: sorted.length,
    goNext,
    goPrev,
    reset,
  };
}

export type UseKeysetPaginationUrlOptions = UseKeysetPaginationOptions & {
  searchParams: URLSearchParams;
  pathname: string;
  router: {
    replace: (url: string, options?: { scroll?: boolean }) => void;
    push: (url: string, options?: { scroll?: boolean }) => void;
  };
  /** Query param name for the forward cursor (default: `after`). */
  cursorParam?: string;
  scrollOnChange?: boolean;
};

/**
 * Keyset pagination synced to `?after=<cursor>` in the URL (shareable deep links).
 */
export function useKeysetPaginationUrl<T>(
  items: readonly T[],
  getKey: (item: T) => string,
  pageSize: number,
  options: UseKeysetPaginationUrlOptions
): UseKeysetPaginationResult<T> {
  const {
    resetDeps = [],
    searchParams,
    pathname,
    router,
    cursorParam = 'after',
    scrollOnChange = true,
  } = options;

  const sorted = useMemo(() => keysetSort(items, getKey), [items, getKey]);
  const resetKey = useMemo(
    () => JSON.stringify(resetDeps),
    [resetDeps]
  );

  const afterFromUrl = decodeKeysetCursor(searchParams.get(cursorParam));
  const [afterStack, setAfterStack] = useState<KeysetCursor[]>(() =>
    afterFromUrl ? [null, afterFromUrl] : [null]
  );

  useEffect(() => {
    setAfterStack([null]);
  }, [sorted.length, resetKey]);

  useEffect(() => {
    const fromUrl = decodeKeysetCursor(searchParams.get(cursorParam));
    setAfterStack(fromUrl ? [null, fromUrl] : [null]);
  }, [searchParams, cursorParam]);

  const afterKey = afterStack[afterStack.length - 1] ?? null;

  const slice = useMemo(
    () => keysetSliceForward(sorted, getKey, pageSize, afterKey),
    [sorted, getKey, pageSize, afterKey]
  );

  const pushUrl = useCallback(
    (nextAfter: KeysetCursor) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      const encoded = encodeKeysetCursor(nextAfter);
      if (encoded) params.set(cursorParam, encoded);
      else params.delete(cursorParam);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      if (scrollOnChange) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [
      cursorParam,
      pathname,
      router,
      scrollOnChange,
      searchParams,
    ]
  );

  const goNext = useCallback(() => {
    if (!slice.hasNext || !slice.lastKey) return;
    setAfterStack(stack => [...stack, slice.lastKey]);
    pushUrl(slice.lastKey);
  }, [pushUrl, slice.hasNext, slice.lastKey]);

  const goPrev = useCallback(() => {
    setAfterStack(stack => {
      if (stack.length <= 1) return stack;
      const next = stack.slice(0, -1);
      const prevAfter = next[next.length - 1] ?? null;
      pushUrl(prevAfter);
      return next;
    });
  }, [pushUrl]);

  const reset = useCallback(() => {
    setAfterStack([null]);
    pushUrl(null);
  }, [pushUrl]);

  return {
    items: slice.items,
    hasNext: slice.hasNext,
    hasPrev: afterStack.length > 1,
    pageIndex: afterStack.length,
    rangeStart: slice.items.length === 0 ? 0 : slice.startIndex + 1,
    rangeEnd: slice.endIndex,
    totalCount: sorted.length,
    goNext,
    goPrev,
    reset,
  };
}
