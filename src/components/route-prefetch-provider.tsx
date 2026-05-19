'use client';

import { IDLE_PREFETCH_ROUTES, pathnameOnly } from '@/lib/app-routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Precarga rutas frecuentes en idle para que el trie del App Router
 * ya tenga los segmentos listos al hacer clic (sin round-trip al servidor).
 */
export function RoutePrefetchProvider() {
  const router = useRouter();

  useEffect(() => {
    const prefetchAll = () => {
      for (const route of IDLE_PREFETCH_ROUTES) {
        router.prefetch(pathnameOnly(route));
      }
    };

    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(prefetchAll, { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }

    const timer = window.setTimeout(prefetchAll, 1200);
    return () => window.clearTimeout(timer);
  }, [router]);

  return null;
}
