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
  const previousList = useRef<T[]>([]);

  // Reinicia al filtrar o reemplazar la lista, pero conserva el avance cuando
  // el servidor añade una página al final.
  useEffect(() => {
    const previous = previousList.current;
    const appended = previous.length <= items.length && previous.every((item, index) => item === items[index]);
    if (!appended) setVisibleCount(itemsPerPage);
    previousList.current = items;
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
