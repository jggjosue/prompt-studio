'use client';

import { throttle } from '@/lib/flow-control';
import { useEffect, useMemo, useRef } from 'react';

/**
 * Callback con throttle (p. ej. scroll infinito o resize).
 */
export function useThrottledCallback<T extends (...args: never[]) => void>(
  callback: T,
  waitMs: number
): T & { cancel: () => void } {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const throttled = useMemo(
    () =>
      throttle((...args: Parameters<T>) => {
        callbackRef.current(...args);
      }, waitMs),
    [waitMs]
  );

  useEffect(() => () => throttled.cancel(), [throttled]);

  return throttled as T & { cancel: () => void };
}
