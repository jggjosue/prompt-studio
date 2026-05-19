/**
 * LRU en el navegador (RAM de la pestaña) para fragmentos de API.
 * Expulsa respuestas que el usuario deja de solicitar.
 */

type Entry<T> = {
  value: T;
  at: number;
};

export type ClientLruConfig = {
  maxEntries: number;
  defaultTtlMs: number;
};

const DEFAULT_CONFIG: ClientLruConfig = {
  maxEntries: 24,
  defaultTtlMs: 5 * 60 * 1000,
};

export class ClientLruCache<T> {
  private readonly config: ClientLruConfig;
  private readonly map = new Map<string, Entry<T>>();

  constructor(config: Partial<ClientLruConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  get(key: string): T | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() - entry.at > this.config.defaultTtlMs) {
      this.map.delete(key);
      return undefined;
    }
    entry.at = Date.now();
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, { value, at: Date.now() });
    this.evictIfNeeded();
  }

  delete(key: string): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  private evictIfNeeded(): void {
    while (this.map.size > this.config.maxEntries) {
      const oldest = this.map.keys().next().value;
      if (!oldest) break;
      this.map.delete(oldest);
    }
  }
}

/** Caché global de respuestas GET JSON (landings, legibilidad, catálogo). */
export const clientApiLru = new ClientLruCache<unknown>({
  maxEntries: 32,
  defaultTtlMs: 5 * 60 * 1000,
});

export async function fetchJsonWithLru<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const hit = clientApiLru.get(url);
  if (hit !== undefined) return hit as T;

  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as T;
  clientApiLru.set(url, data);
  return data;
}

/** Tras mutaciones en servidor, forzar refetch en cliente. */
export function clearClientApiCache(): void {
  clientApiLru.clear();
}
