/**
 * Caché servidor con política LRU (Least Recently Used).
 *
 * - L1: memoria del proceso (`MemoryLruStore`) — siempre activa.
 *
 * Los fragmentos que nadie pide dejan de renovarse y son expulsados al llenar RAM.
 */

import {
  getCacheNamespacePolicy,
  listCacheNamespaces,
  type CacheNamespace,
} from '@/lib/cache-namespace-policy';
import {
  MemoryLruStore,
  getLruStoreConfigFromEnv,
  type LruSetOptions,
  type LruStats,
} from '@/lib/lru-cache-store';

export type { CacheNamespace };

export type CacheGetOrSetOptions = LruSetOptions & {
  namespace: CacheNamespace;
};

const memory = new MemoryLruStore(getLruStoreConfigFromEnv());

function resolveStoreOptions(
  namespace: CacheNamespace,
  options: Omit<CacheGetOrSetOptions, 'namespace'> = {}
): Omit<CacheGetOrSetOptions, 'namespace'> {
  const policy = getCacheNamespacePolicy(namespace);
  return {
    ttlMs: options.ttlMs ?? policy.defaultTtlMs,
    sizeBytes: options.sizeBytes,
  };
}

/**
 * Obtiene del caché o ejecuta `factory` y guarda el resultado (LRU + TTL).
 */
export async function cacheGetOrSet<T>(
  namespace: CacheNamespace,
  key: string,
  factory: () => Promise<T> | T,
  options: Omit<CacheGetOrSetOptions, 'namespace'> = {}
): Promise<T> {
  const memHit = memory.get<T>(namespace, key);
  if (memHit !== undefined) {
    return memHit;
  }

  const value = await factory();
  const storeOptions = withAutoSize(value, resolveStoreOptions(namespace, options));
  memory.set(namespace, key, value, storeOptions);

  return value;
}

function withAutoSize(
  value: unknown,
  options: Omit<CacheGetOrSetOptions, 'namespace'>
): Omit<CacheGetOrSetOptions, 'namespace'> {
  if (options.sizeBytes !== undefined) return options;
  if (Buffer.isBuffer(value)) {
    return { ...options, sizeBytes: value.length };
  }
  if (value instanceof Uint8Array) {
    return { ...options, sizeBytes: value.byteLength };
  }
  return options;
}

export function cacheGet<T>(namespace: CacheNamespace, key: string): T | undefined {
  return memory.get<T>(namespace, key);
}

export async function cacheSet<T>(
  namespace: CacheNamespace,
  key: string,
  value: T,
  options: Omit<CacheGetOrSetOptions, 'namespace'> = {}
): Promise<void> {
  const storeOptions = withAutoSize(value, resolveStoreOptions(namespace, options));
  memory.set(namespace, key, value, storeOptions);
}

/** Lectura L1. */
export async function cacheGetAsync<T>(
  namespace: CacheNamespace,
  key: string
): Promise<T | undefined> {
  return memory.get<T>(namespace, key);
}

export async function cacheInvalidate(
  namespace: CacheNamespace,
  key?: string
): Promise<void> {
  if (key) {
    memory.delete(namespace, key);
    return;
  }
  memory.clearNamespace(namespace);
}

export async function cacheStats(
  namespace: CacheNamespace
): Promise<{
  policy: ReturnType<typeof getCacheNamespacePolicy>;
  memory: LruStats;
  redis: LruStats | null;
}> {
  return {
    policy: getCacheNamespacePolicy(namespace),
    memory: memory.stats(namespace),
    redis: null,
  };
}

export async function cacheStatsAll(): Promise<
  Record<
    CacheNamespace,
    Awaited<ReturnType<typeof cacheStats>> & { redisConfigured: boolean }
  >
> {
  const redisConfigured = false;
  const out = {} as Record<CacheNamespace, Awaited<ReturnType<typeof cacheStats>> & { redisConfigured: boolean }>;
  for (const ns of listCacheNamespaces()) {
    const stats = await cacheStats(ns);
    out[ns] = { ...stats, redisConfigured };
  }
  return out;
}

/** Invalida todos los namespaces (tras deploy masivo de JSON). */
export async function cacheInvalidateAll(): Promise<void> {
  for (const ns of listCacheNamespaces()) {
    await cacheInvalidate(ns);
  }
}

/** Clave estable para assets transcodificados. */
export function webAssetCacheKey(
  path: string,
  width: number | undefined,
  quality: number,
  format: string
): string {
  return `${path}|w=${width ?? 0}|q=${quality}|f=${format}`;
}

