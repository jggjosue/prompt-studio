'use client';

import { LazyPlaceholder } from '@/components/lazy-in-view';
import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import { shouldUnoptimizeImage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { ImageOff } from 'lucide-react';
import Image, { type ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const DEFAULT_QUALITY = 72;

type OptimizedImageProps = ImageProps & {
  /** Fuerza sin optimizar (p. ej. meta.ai). */
  forceUnoptimized?: boolean;
  /**
   * Lazy adaptativo con Intersection Observer (por defecto true si no es `priority`).
   * No monta la petición de imagen hasta que el elemento está cerca del viewport.
   */
  lazyAdaptive?: boolean;
};

/**
 * next/image con AVIF/WebP y lazy loading adaptativo (Intersection Observer).
 */
export function OptimizedImage({
  src,
  quality = DEFAULT_QUALITY,
  unoptimized,
  forceUnoptimized,
  priority,
  lazyAdaptive,
  fill,
  width,
  height,
  className,
  onLoad,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const srcString =
    typeof src === 'string'
      ? src
      : typeof src === 'object' && src && 'src' in src
        ? String(src.src)
        : '';

  const skipOptimize =
    forceUnoptimized ??
    unoptimized ??
    (srcString ? shouldUnoptimizeImage(srcString) : false);

  const useAdaptiveLazy = lazyAdaptive ?? !priority;
  const { ref, isNearView } = useIntersectionInView({
    disabled: !useAdaptiveLazy,
    kind: 'image',
  });

  const shouldLoad = !useAdaptiveLazy || isNearView;
  const fallbackDimensions =
    !fill && width == null && height == null
      ? { width: 1200, height: 900 }
      : { width, height };

  useEffect(() => {
    setIsReady(false);
    setHasError(false);
  }, [srcString]);

  const image = (
    <>
      {shouldLoad ? (
        <Image
          {...props}
          src={src}
          fill={fill}
          width={fallbackDimensions.width}
          height={fallbackDimensions.height}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
          quality={quality}
          unoptimized={skipOptimize}
          decoding="async"
          className={cn(
            'transition-[opacity,filter,transform] duration-500',
            isReady && !hasError
              ? 'opacity-100 blur-0 scale-100'
              : 'opacity-0 blur-sm scale-[1.015]',
            className
          )}
          onLoad={event => {
            setIsReady(true);
            onLoad?.(event);
          }}
          onError={event => {
            setHasError(true);
            onError?.(event);
          }}
        />
      ) : null}
      {!isReady && !hasError ? (
        <LazyPlaceholder className="bg-gradient-to-br from-muted via-muted/80 to-primary/10" />
      ) : null}
      {hasError ? (
        <span className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
          <ImageOff className="size-6" aria-hidden />
          <span className="sr-only">Image unavailable</span>
        </span>
      ) : null}
    </>
  );

  if (!useAdaptiveLazy) {
    return image;
  }

  if (fill) {
    return (
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        className="absolute inset-0 block"
      >
        {image}
      </span>
    );
  }

  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>} className="block w-full">
      {image}
    </span>
  );
}
