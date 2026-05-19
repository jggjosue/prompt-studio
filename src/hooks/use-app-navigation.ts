'use client';

import { isNavActive, pathnameOnly } from '@/lib/app-routes';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

type NavigateOptions = {
  scroll?: boolean;
  replace?: boolean;
};

/**
 * Navegación programática alineada con el trie de rutas (sin recarga completa).
 */
export function useAppNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (href: string, options?: NavigateOptions) => {
      const path = pathnameOnly(href);
      const method = options?.replace ? router.replace : router.push;
      method(href, { scroll: options?.scroll ?? true });
      if (path.startsWith('/')) {
        router.prefetch(path);
      }
    },
    [router]
  );

  const isActive = useCallback(
    (href?: string, activePrefixes?: readonly string[]) =>
      isNavActive(pathname, href, activePrefixes),
    [pathname]
  );

  return { navigate, pathname, isActive, prefetch: router.prefetch };
}
