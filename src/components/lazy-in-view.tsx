'use client';

import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import type { LazyMediaKind } from '@/lib/adaptive-lazy';
import { cn } from '@/lib/utils';
import type { ComponentProps, ReactNode } from 'react';

export function LazyPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 bg-muted animate-pulse',
        className
      )}
      aria-hidden
    />
  );
}

type LazyInViewProps = {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  kind?: LazyMediaKind;
  enabled?: boolean;
  once?: boolean;
  rootMargin?: string;
} & Omit<ComponentProps<'div'>, 'children' | 'className'>;

/**
 * Monta hijos solo cuando el contenedor está cerca del viewport (Intersection Observer).
 */
export function LazyInView({
  children,
  fallback,
  className,
  kind = 'image',
  enabled = true,
  once = true,
  rootMargin,
  ...rest
}: LazyInViewProps) {
  const { ref, isNearView } = useIntersectionInView({
    disabled: !enabled,
    kind,
    once,
    rootMargin,
  });

  const show = !enabled || isNearView;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn('relative', className)}
      {...rest}
    >
      {show ? children : (fallback ?? <LazyPlaceholder />)}
    </div>
  );
}
