import { useState, useEffect, useRef, useCallback } from 'react';

export function useInfiniteScroll<T>(
  items: T[],
  itemsPerPage: number = 30,
  options?: {
    rootMargin?: string;
    threshold?: number;
  }
) {
  const [visibleCount, setVisibleCount] = useState(itemsPerPage);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Reset when items array changes significantly (like filtering)
  useEffect(() => {
    setVisibleCount(itemsPerPage);
  }, [items, itemsPerPage]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target?.isIntersecting) {
        setVisibleCount((prev) => {
          if (prev >= items.length) return prev;
          return Math.min(prev + itemsPerPage, items.length);
        });
      }
    },
    [items.length, itemsPerPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: options?.rootMargin || '400px',
      threshold: options?.threshold || 0,
    });

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [handleObserver, options?.rootMargin, options?.threshold, visibleCount]);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  return {
    visibleItems,
    hasMore,
    observerTarget,
  };
}
