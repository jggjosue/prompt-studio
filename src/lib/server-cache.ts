/**
 * Caché servidor con política LRU (Least Recently Used).
 *
 * - L1: memoria del proceso (`MemoryLruStore`) — siempre activa.
 * - L2: Redis opcional (`REDIS_URL`) — compartida entre instancias / regiones.
 *
 * Los fragmentos que nadie pide dejan de renovarse y son expulsados al llenar RAM.
 */

import {
  MemoryLruStore,
  getLruStoreConfigFromEnv,
  type LruSetOptions,
  type LruStats,
} from '@/lib/lru-cache-store';
import { RedisLruStore, isRedisLruConfigured } from '@/lib/redis-lru-cache';

export type CacheNamespace =
  | 'r2-bytes'
  | 'web-asset'
  | 'demo-bundle'
  | 'prompt-json'
  | 'catalog';

export type CacheGetOrSetOptions = LruSetOptions & {
  namespace: CacheNamespace;
};

const memory = new MemoryLruStore(getLruStoreConfigFromEnv());
const redis = new RedisLruStore();

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

  if (isRedisLruConfigured()) {
    const redisHit = await redis.get<T>(namespace, key);
    if (redisHit !== undefined) {
      memory.set(namespace, key, redisHit, options);
      return redisHit;
    }
  }

  const value = await factory();
  const storeOptions = withAutoSize(value, options);
  memory.set(namespace, key, value, storeOptions);

  if (isRedisLruConfigured()) {
    await redis.set(namespace, key, value, storeOptions);
  }

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
  memory.set(namespace, key, value, options);
  if (isRedisLruConfigured()) {
    await redis.set(namespace, key, value, options);
  }
}

export async function cacheInvalidate(
  namespace: CacheNamespace,
  key?: string
): Promise<void> {
  if (key) {
    memory.delete(namespace, key);
    if (isRedisLruConfigured()) {
      await redis.delete(namespace, key);
    }
    return;
  }
  memory.clearNamespace(namespace);
  if (isRedisLruConfigured()) {
    await redis.clearNamespace(namespace);
  }
}

export async function cacheStats(
  namespace: CacheNamespace
): Promise<{ memory: LruStats; redis: LruStats | null }> {
  return {
    memory: memory.stats(namespace),
    redis: isRedisLruConfigured() ? await redis.stats(namespace) : null,
  };
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
