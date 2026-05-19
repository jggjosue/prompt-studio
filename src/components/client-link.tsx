'use client';

import { isInternalHref, pathnameOnly } from '@/lib/app-routes';
import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useRef, type ComponentProps } from 'react';

type ClientLinkProps = LinkProps &
  Omit<ComponentProps<'a'>, keyof LinkProps> & {
    /** Prefetch al pasar el ratón o enfocar (además del prefetch de Next.js). */
    prefetchOnIntent?: boolean;
  };

/**
 * Enlace interno optimizado para enrutamiento client-side:
 * prefetch en intención (hover/focus) + Link de Next.js sin recarga completa.
 */
export function ClientLink({
  href,
  prefetchOnIntent = true,
  prefetch = true,
  onMouseEnter,
  onFocus,
  children,
  ...props
}: ClientLinkProps) {
  const router = useRouter();
  const didPrefetch = useRef(false);

  const hrefStr =
    typeof href === 'string'
      ? href
      : href.pathname
        ? `${href.pathname}${href.search ?? ''}`
        : '';

  const prefetchRoute = useCallback(() => {
    if (!prefetchOnIntent || didPrefetch.current) return;
    const path = pathnameOnly(hrefStr);
    if (!isInternalHref(path)) return;
    didPrefetch.current = true;
    router.prefetch(path);
  }, [hrefStr, prefetchOnIntent, router]);

  return (
    <Link
      href={href}
      prefetch={prefetch}
      onMouseEnter={e => {
        prefetchRoute();
        onMouseEnter?.(e);
      }}
      onFocus={e => {
        prefetchRoute();
        onFocus?.(e);
      }}
      {...props}
    >
      {children}
    </Link>
  );
}
