'use client';

import { LazyPlaceholder } from '@/components/lazy-in-view';
import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import { cn } from '@/lib/utils';
import type { ComponentProps } from 'react';

type LazyVideoProps = ComponentProps<'video'> & {
  /** Carga inmediata (p. ej. hero principal). */
  eager?: boolean;
  poster?: string;
};

/**
 * Video que solo asigna `src` y descarga cuando está cerca del viewport.
 */
export function LazyVideo({
  src,
  eager = false,
  poster,
  className,
  preload = 'metadata',
  ...props
}: LazyVideoProps) {
  const { ref, isNearView } = useIntersectionInView({
    disabled: eager || !src,
    kind: 'video',
  });

  const shouldLoad = eager || isNearView;

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="relative w-full h-full min-h-[1px]"
    >
      {shouldLoad && src ? (
        <video
          src={src}
          playsInline
          preload={preload}
          poster={poster}
          className={cn('w-full h-full object-cover', className)}
          {...props}
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- poster estático ligero
        <img
          src={poster}
          alt=""
          className={cn('w-full h-full object-cover', className)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <LazyPlaceholder className={className} />
      )}
    </div>
  );
}
