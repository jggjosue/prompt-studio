'use client';

import { debounce } from '@/lib/flow-control';
import { useEffect, useMemo, useRef } from 'react';

/**
 * Callback con debounce (p. ej. fetch de autocompletado al dejar de escribir).
 */
export function useDebouncedCallback<T extends (...args: never[]) => void>(
  callback: T,
  delayMs: number
): T & { cancel: () => void; flush: () => void } {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const debounced = useMemo(
    () =>
      debounce((...args: Parameters<T>) => {
        callbackRef.current(...args);
      }, delayMs),
    [delayMs]
  );

  useEffect(() => () => debounced.cancel(), [debounced]);

  return debounced as T & { cancel: () => void; flush: () => void };
}
