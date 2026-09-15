'use client';

import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import type { ReactNode, RefObject } from 'react';

export function ViewportRender({
  children,
  minHeight = 520,
  rootMargin = '900px 0px',
  className,
}: {
  children: ReactNode;
  minHeight?: number;
  rootMargin?: string;
  className?: string;
}) {
  const { ref, isNearView } = useIntersectionInView({
    rootMargin,
    threshold: 0,
    kind: 'image',
    once: false,
  });

  return (
    <div
      ref={ref as RefObject<HTMLDivElement>}
      className={className}
      style={{ minHeight }}
      data-virtualized={!isNearView || undefined}
    >
      {isNearView ? children : <div aria-hidden className="h-full min-h-[inherit] rounded-lg bg-muted/20" />}
    </div>
  );
}
