'use client';

import { DEBOUNCE_MS } from '@/lib/flow-control';
import { useSearchField } from '@/hooks/use-search-field';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect } from 'react';

const DEFAULT_STRIP = ['page', 'after'] as const;

/**
 * Buscador con debounce sincronizado a `?q=` (compartible, enlazable).
 * Mismo patrón que `/landing-pages`.
 */
export function useCatalogSearchUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const queryFromUrl = searchParams.get('q')?.trim() ?? '';
  const field = useSearchField(queryFromUrl, DEBOUNCE_MS.searchFilter);

  useEffect(() => {
    field.setInput(queryFromUrl);
  }, [queryFromUrl, field.setInput]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of DEFAULT_STRIP) params.delete(key);
    const trimmed = field.debounced.trim();
    if (trimmed) params.set('q', trimmed);
    else params.delete('q');
    const qs = params.toString();
    const next = qs ? `${pathname}?${qs}` : pathname;
    const current = qs ? `${pathname}?${searchParams.toString()}` : pathname;
    if (next !== current) {
      router.replace(next, { scroll: false });
    }
  }, [field.debounced, pathname, router, searchParams]);

  const clearSearch = useCallback(() => {
    field.setInput('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    for (const key of DEFAULT_STRIP) params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [field, pathname, router, searchParams]);

  return {
    input: field.input,
    setInput: field.setInput,
    debounced: field.debounced,
    isPending: field.isPending,
    clearSearch,
  };
}

/** Conserva `q` y demás params al cambiar tag/filtros. */
export function buildCatalogQueryUrl(
  pathname: string,
  searchParams: URLSearchParams,
  updates: Record<string, string | null | undefined>
): string {
  const params = new URLSearchParams(searchParams.toString());
  for (const key of DEFAULT_STRIP) params.delete(key);

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
