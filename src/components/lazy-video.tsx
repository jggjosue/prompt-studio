'use client';

import { LazyPlaceholder } from '@/components/lazy-in-view';
import { OptimizedImage } from '@/components/optimized-image';
import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import { cn } from '@/lib/utils';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { type ComponentProps, useEffect, useRef, useState } from 'react';

type LazyVideoProps = ComponentProps<'video'> & {
  /** Carga inmediata (p. ej. hero principal). */
  eager?: boolean;
  poster?: string;
  /** Salta a un fotograma representativo en previews sin reproducción. */
  previewSeek?: boolean;
};

/**
 * Video que solo asigna `src` y descarga cuando está cerca del viewport.
 */
export function LazyVideo({
  src,
  eager = false,
  poster,
  previewSeek = true,
  className,
  preload = 'metadata',
  onCanPlay,
  onLoadedData,
  onLoadedMetadata,
  onError,
  ...props
}: LazyVideoProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewSeekApplied = useRef(false);
  const { ref, isNearView } = useIntersectionInView({
    disabled: !src,
    kind: 'video',
    // Once a media element has loaded, keep it mounted. Recreating the video
    // on every viewport transition restarts metadata/range requests.
    once: true,
  });

  const shouldLoad = eager || isNearView;

  useEffect(() => {
    previewSeekApplied.current = false;
    setIsReady(false);
    setHasError(false);
    if (videoRef.current && videoRef.current.readyState >= 1) {
      setIsReady(true);
    }
  }, [src]);

  useEffect(() => {
    if (shouldLoad && videoRef.current && videoRef.current.readyState >= 1) {
      setIsReady(true);
    }
  }, [shouldLoad]);

  useEffect(() => {
    if (!isNearView && !eager) videoRef.current?.pause();
  }, [isNearView, eager]);

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
            onLoadedMetadata={event => {
              const video = event.currentTarget;
              if (previewSeek && !previewSeekApplied.current && Number.isFinite(video.duration) && video.duration > 0) {
                previewSeekApplied.current = true;
                const previewSecond = Math.min(2, Math.max(0.1, video.duration * 0.12));
                try {
                  video.currentTime = previewSecond;
                } catch {
                  // Some browsers may reject seeking until more media data is available.
                }
              }
              setIsReady(true);
              onLoadedMetadata?.(event);
            }}
            onLoadedData={event => {
              setIsReady(true);
              onLoadedData?.(event);
            }}
            onCanPlay={event => {
              setIsReady(true);
              onCanPlay?.(event);
            }}
            onPlay={event => {
              setIsReady(true);
              props.onPlay?.(event);
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
