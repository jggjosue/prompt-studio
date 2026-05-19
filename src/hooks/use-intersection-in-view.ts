'use client';

import {
  DEFAULT_LAZY_THRESHOLD,
  getAdaptiveRootMargin,
  type LazyMediaKind,
} from '@/lib/adaptive-lazy';
import { useEffect, useRef, useState } from 'react';

export type UseIntersectionInViewOptions = {
  /** Desactiva el observer y marca como visible de inmediato. */
  disabled?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
  kind?: LazyMediaKind;
  /** Deja de observar tras la primera intersección (por defecto true). */
  once?: boolean;
};

/**
 * Intersection Observer con rootMargin adaptativo: el recurso se activa
 * cuando el elemento está a punto de entrar en el viewport.
 */
export function useIntersectionInView({
  disabled = false,
  rootMargin,
  threshold = DEFAULT_LAZY_THRESHOLD,
  kind = 'image',
  once = true,
}: UseIntersectionInViewOptions = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const [isNearView, setIsNearView] = useState(disabled);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (disabled) {
      setIsNearView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    setIsNearView(false);

    const margin = rootMargin ?? getAdaptiveRootMargin(kind);

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setIsNearView(true);
        if (once) observer.disconnect();
      },
      { rootMargin: margin, threshold }
    );

    observer.observe(element);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [disabled, rootMargin, threshold, kind, once]);

  return { ref, isNearView };
}
