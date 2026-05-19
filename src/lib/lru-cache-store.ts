/**
 * Caché LRU en memoria del proceso (RAM del servidor / función serverless).
 * Expulsa entradas menos usadas recientemente cuando se alcanza maxEntries o maxSizeBytes.
 */

import { LRUCache } from 'lru-cache';
import {
  getCacheNamespacePolicy,
  getGlobalLruDefaults,
} from '@/lib/cache-namespace-policy';

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

const DEFAULT_CONFIG: LruStoreConfig = getGlobalLruDefaults();

export function getLruStoreConfigFromEnv(): LruStoreConfig {
  return getGlobalLruDefaults();
}

function configForNamespace(namespace: string): LruStoreConfig {
  try {
    const policy = getCacheNamespacePolicy(
      namespace as import('@/lib/cache-namespace-policy').CacheNamespace
    );
    return {
      maxEntries: policy.maxEntries,
      maxSizeBytes: policy.maxSizeBytes,
      defaultTtlMs: policy.defaultTtlMs,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
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
      const nsConfig = configForNamespace(namespace);
      cache = new LRUCache<string, object>({
        max: nsConfig.maxEntries,
        maxSize: nsConfig.maxSizeBytes,
        sizeCalculation: value => entrySize(value),
        ttl: nsConfig.defaultTtlMs,
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
    const nsConfig = configForNamespace(namespace);
    return {
      namespace,
      size: cache.size,
      calculatedSize: cache.calculatedSize ?? 0,
      maxEntries: nsConfig.maxEntries,
      maxSizeBytes: nsConfig.maxSizeBytes,
    };
  }
}
