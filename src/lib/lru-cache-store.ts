/**
 * Caché LRU en memoria del proceso (RAM del servidor / función serverless).
 * Expulsa entradas menos usadas recientemente cuando se alcanza maxEntries o maxSizeBytes.
 */

import { LRUCache } from 'lru-cache';

export type LruStoreConfig = {
  maxEntries: number;
  maxSizeBytes: number;
  defaultTtlMs: number;
};

export type LruSetOptions = {
  ttlMs?: number;
  /** Tamaño en bytes para contabilizar maxSizeBytes (p. ej. Buffer.length). */
  sizeBytes?: number;
};

export type LruStats = {
  namespace: string;
  size: number;
  calculatedSize: number;
  maxEntries: number;
  maxSizeBytes: number;
};

const DEFAULT_CONFIG: LruStoreConfig = {
  maxEntries: 256,
  maxSizeBytes: 128 * 1024 * 1024,
  defaultTtlMs: 60 * 60 * 1000,
};

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw?.trim()) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getLruStoreConfigFromEnv(): LruStoreConfig {
  return {
    maxEntries: parsePositiveInt(process.env.CACHE_LRU_MAX_ENTRIES, 256),
    maxSizeBytes:
      parsePositiveInt(process.env.CACHE_LRU_MAX_MB, 128) * 1024 * 1024,
    defaultTtlMs: parsePositiveInt(process.env.CACHE_LRU_TTL_MS, 3_600_000),
  };
}

function entrySize(value: unknown): number {
  if (typeof value === 'string') return value.length;
  if (value instanceof Uint8Array) return value.byteLength;
  if (Buffer.isBuffer(value)) return value.length;
  try {
    return JSON.stringify(value).length;
  } catch {
    return 1;
  }
}

export class MemoryLruStore {
  private readonly config: LruStoreConfig;
  private readonly caches = new Map<string, LRUCache<string, object>>();

  constructor(config: Partial<LruStoreConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private cacheFor(namespace: string): LRUCache<string, object> {
    let cache = this.caches.get(namespace);
    if (!cache) {
      cache = new LRUCache<string, object>({
        max: this.config.maxEntries,
        maxSize: this.config.maxSizeBytes,
        sizeCalculation: value => entrySize(value),
        ttl: this.config.defaultTtlMs,
        updateAgeOnGet: true,
        updateAgeOnHas: true,
      });
      this.caches.set(namespace, cache);
    }
    return cache;
  }

  get<T>(namespace: string, key: string): T | undefined {
    return this.cacheFor(namespace).get(key) as T | undefined;
  }

  set(
    namespace: string,
    key: string,
    value: unknown,
    options: LruSetOptions = {}
  ): void {
    const ttlMs = options.ttlMs ?? this.config.defaultTtlMs;
    this.cacheFor(namespace).set(key, value as object, {
      ttl: ttlMs > 0 ? ttlMs : undefined,
      size: options.sizeBytes ?? entrySize(value),
    });
  }

  delete(namespace: string, key: string): void {
    this.cacheFor(namespace).delete(key);
  }

  clearNamespace(namespace: string): void {
    this.caches.get(namespace)?.clear();
  }

  stats(namespace: string): LruStats {
    const cache = this.cacheFor(namespace);
    return {
      namespace,
      size: cache.size,
      calculatedSize: cache.calculatedSize ?? 0,
      maxEntries: this.config.maxEntries,
      maxSizeBytes: this.config.maxSizeBytes,
    };
  }
}
