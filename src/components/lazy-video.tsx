'use client';

import { LazyPlaceholder } from '@/components/lazy-in-view';
import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import { cn } from '@/lib/utils';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { OptimizedImage } from '@/components/optimized-image';

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
  onCanPlay,
  onLoadedData,
  onError,
  ...props
}: LazyVideoProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { ref, isNearView } = useIntersectionInView({
    disabled: !src,
    kind: 'video',
    once: false,
  });

  const shouldLoad = eager || isNearView;

  useEffect(() => {
    setIsReady(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (!isNearView) videoRef.current?.pause();
  }, [isNearView]);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="relative w-full h-full min-h-[1px] overflow-hidden bg-muted/55"
    >
      {shouldLoad && src ? (
        <>
          <video
            ref={videoRef}
            src={src}
            playsInline
            preload={preload}
            poster={poster}
            className={cn(
              'w-full h-full object-cover transition-[opacity,filter] duration-500',
              isReady && !hasError
                ? 'opacity-100 blur-0'
                : 'opacity-0 blur-sm',
              className
            )}
            onLoadedData={event => {
              setIsReady(true);
              onLoadedData?.(event);
            }}
            onCanPlay={event => {
              setIsReady(true);
              onCanPlay?.(event);
            }}
            onError={event => {
              setHasError(true);
              onError?.(event);
            }}
            {...props}
          />
          {!isReady && !hasError ? (
            <div
              className="pointer-events-none absolute inset-0 grid place-items-center bg-gradient-to-br from-muted via-muted/80 to-primary/10"
              aria-hidden
            >
              <LoaderCircle className="size-7 animate-spin text-primary/80" />
            </div>
          ) : null}
          {hasError ? (
            <div className="absolute inset-0 grid place-items-center bg-muted px-6 text-center text-sm text-muted-foreground">
              <span className="flex flex-col items-center gap-2">
                <AlertCircle className="size-6 text-primary" />
                Video unavailable
              </span>
            </div>
          ) : null}
        </>
      ) : poster ? (
        <OptimizedImage
          src={poster}
          alt=""
          width={1280}
          height={720}
          lazyAdaptive
          sizes="(max-width: 768px) 100vw, 50vw"
          className={cn('w-full h-full object-cover', className)}
        />
      ) : (
        <LazyPlaceholder
          className={cn(
            'bg-gradient-to-br from-muted via-muted/80 to-primary/10',
            className
          )}
        />
      )}
    </div>
  );
}
