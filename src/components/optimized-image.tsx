'use client';

import { LazyPlaceholder } from '@/components/lazy-in-view';
import { useIntersectionInView } from '@/hooks/use-intersection-in-view';
import { shouldUnoptimizeImage } from '@/lib/utils';
import { cn } from '@/lib/utils';
import Image, { type ImageProps } from 'next/image';

const DEFAULT_QUALITY = 75;

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
  className,
  ...props
}: OptimizedImageProps) {
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

  const image = shouldLoad ? (
    <Image
      {...props}
      src={src}
      fill={fill}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      quality={quality}
      unoptimized={skipOptimize}
      className={className}
    />
  ) : (
    <LazyPlaceholder />
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
