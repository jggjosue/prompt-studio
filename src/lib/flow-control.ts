/**
 * Control de flujo con temporizadores: debounce y throttle.
 * Evita ejecutar filtrado, autocompletado o peticiones en cada pulsación.
 */

export const DEBOUNCE_MS = {
  /** Filtrado client-side (grids, listas). */
  searchFilter: 300,
  /** Sincronización de `?q=` en la URL. */
  urlSync: 320,
  /** Autocompletado / peticiones al servidor. */
  autocomplete: 400,
} as const;

export const THROTTLE_MS = {
  scroll: 100,
  resize: 150,
} as const;

type DebouncedFn<T extends (...args: never[]) => void> = T & {
  cancel: () => void;
  flush: () => void;
};

/**
 * Retrasa la ejecución hasta que pasen `waitMs` sin nuevas llamadas.
 */
export function debounce<T extends (...args: never[]) => void>(
  fn: T,
  waitMs: number
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;

  const invoke = () => {
    if (lastArgs) fn(...lastArgs);
  };

  const debounced = ((...args: Parameters<T>) => {
    lastArgs = args;
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      invoke();
    }, waitMs);
  }) as DebouncedFn<T>;

  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
  };

  debounced.flush = () => {
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    invoke();
  };

  return debounced;
}

type ThrottledFn<T extends (...args: never[]) => void> = T & {
  cancel: () => void;
};

/**
 * Limita la ejecución a como máximo una vez cada `waitMs`.
 */
export function throttle<T extends (...args: never[]) => void>(
  fn: T,
  waitMs: number
): ThrottledFn<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastRun = 0;

  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;
    const remaining = waitMs - (now - lastRun);

    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = undefined;
      }
      lastRun = now;
      fn(...args);
      return;
    }

    if (!timer) {
      timer = setTimeout(() => {
        timer = undefined;
        lastRun = Date.now();
        if (lastArgs) fn(...lastArgs);
      }, remaining);
    }
  }) as ThrottledFn<T>;

  throttled.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    lastArgs = undefined;
  };

  return throttled;
}
