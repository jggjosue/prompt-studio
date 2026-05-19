'use client';

import { DEBOUNCE_MS } from '@/lib/flow-control';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useCallback, useState } from 'react';

/**
 * Campo de búsqueda: el input responde al instante; el filtrado usa debounce.
 */
export function useSearchField(
  initialValue = '',
  delayMs: number = DEBOUNCE_MS.searchFilter
) {
  const [input, setInput] = useState(initialValue);
  const debounced = useDebouncedValue(input, delayMs);
  const isPending = input.trim() !== debounced.trim();

  const clear = useCallback(() => setInput(''), []);

  return {
    input,
    setInput,
    debounced,
    isPending,
    clear,
  };
}
