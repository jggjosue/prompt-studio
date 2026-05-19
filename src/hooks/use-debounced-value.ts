'use client';

import { DEBOUNCE_MS } from '@/lib/flow-control';
import { useEffect, useState } from 'react';

/**
 * Retrasa actualizaciones (p. ej. búsqueda) para no re-renderizar toda la grilla en cada tecla.
 * La reconciliación de React solo procesa el diff cuando el valor debounced cambia.
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number = DEBOUNCE_MS.searchFilter
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(id);
  }, [value, delayMs]);

  return debounced;
}
