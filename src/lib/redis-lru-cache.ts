/**
 * Caché LRU en Redis (RAM compartida entre instancias).
 *
 * Índice ZSET por namespace (score = último acceso) + valor STRING.
 * Al superar maxEntries se expulsa con ZPOPMIN (menor score = menos reciente).
 *
 * En producción conviene además `maxmemory-policy allkeys-lru` en el servidor Redis.
 */

import { createHash } from 'crypto';
import type { Redis } from 'ioredis';
import type { LruSetOptions, LruStats, LruStoreConfig } from '@/lib/lru-cache-store';
import { getLruStoreConfigFromEnv } from '@/lib/lru-cache-store';

const VAL_PREFIX = 'ps:cache:val:';
const LRU_INDEX_PREFIX = 'ps:cache:lru:';

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex').slice(0, 32);
}

function valueKey(namespace: string, key: string): string {
  return `${VAL_PREFIX}${namespace}:${hashKey(key)}`;
}

function indexKey(namespace: string): string {
  return `${LRU_INDEX_PREFIX}${namespace}`;
}

export type RedisLruPayload =
  | { kind: 'buffer'; data: string }
  | { kind: 'json'; data: string }
  | { kind: 'text'; data: string };

export function serializeForRedis(value: unknown): RedisLruPayload {
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) {
    const buf = Buffer.isBuffer(value) ? value : Buffer.from(value);
    return { kind: 'buffer', data: buf.toString('base64') };
  }
  if (typeof value === 'string') {
    return { kind: 'text', data: value };
  }
  return { kind: 'json', data: JSON.stringify(value) };
}

export function deserializeFromRedis<T>(payload: RedisLruPayload): T {
  if (payload.kind === 'buffer') {
    return Buffer.from(payload.data, 'base64') as T;
  }
  if (payload.kind === 'text') {
    return payload.data as T;
  }
  return JSON.parse(payload.data) as T;
}

let redisClient: Redis | null = null;
let redisInitFailed = false;

export function isRedisLruConfigured(): boolean {
  return Boolean(process.env.REDIS_URL?.trim());
}

export async function getRedisLruClient(): Promise<Redis | null> {
  const url = process.env.REDIS_URL?.trim();
  if (!url || redisInitFailed) return null;

  if (redisClient) return redisClient;

  try {
    const { default: Redis } = await import('ioredis');
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });
    return redisClient;
  } catch (error) {
    redisInitFailed = true;
    console.warn('[redis-lru] No se pudo conectar; solo caché en memoria.', error);
    return null;
  }
}

export class RedisLruStore {
  private readonly config: LruStoreConfig;

  constructor(config: Partial<LruStoreConfig> = {}) {
    this.config = { ...getLruStoreConfigFromEnv(), ...config };
  }

  async get<T>(namespace: string, key: string): Promise<T | undefined> {
    const redis = await getRedisLruClient();
    if (!redis) return undefined;

    const vKey = valueKey(namespace, key);
    const raw = await redis.get(vKey);
    if (!raw) return undefined;

    const now = Date.now();
    await redis
      .multi()
      .zadd(indexKey(namespace), now, key)
      .expire(vKey, Math.ceil(this.config.defaultTtlMs / 1000))
      .exec();

    try {
      const payload = JSON.parse(raw) as RedisLruPayload;
      return deserializeFromRedis<T>(payload);
    } catch {
      return undefined;
    }
  }

  async set(
    namespace: string,
    key: string,
    value: unknown,
    options: LruSetOptions = {}
  ): Promise<void> {
    const redis = await getRedisLruClient();
    if (!redis) return;

    const ttlMs = options.ttlMs ?? this.config.defaultTtlMs;
    const ttlSec = Math.max(1, Math.ceil(ttlMs / 1000));
    const vKey = valueKey(namespace, key);
    const iKey = indexKey(namespace);
    const payload = JSON.stringify(serializeForRedis(value));
    const now = Date.now();

    await redis
      .multi()
      .set(vKey, payload, 'EX', ttlSec)
      .zadd(iKey, now, key)
      .exec();

    await this.evictIfNeeded(redis, namespace);
  }

  private async evictIfNeeded(redis: Redis, namespace: string): Promise<void> {
    const iKey = indexKey(namespace);
    const count = await redis.zcard(iKey);
    const overflow = count - this.config.maxEntries;
    if (overflow <= 0) return;

    const victims = await redis.zpopmin(iKey, overflow);
    if (!victims?.length) return;

    const pipeline = redis.pipeline();
    for (let i = 0; i < victims.length; i += 2) {
      const victimKey = victims[i] as string;
      pipeline.del(valueKey(namespace, victimKey));
    }
    await pipeline.exec();
  }

  async delete(namespace: string, key: string): Promise<void> {
    const redis = await getRedisLruClient();
    if (!redis) return;
    await redis
      .multi()
      .del(valueKey(namespace, key))
      .zrem(indexKey(namespace), key)
      .exec();
  }

  async clearNamespace(namespace: string): Promise<void> {
    const redis = await getRedisLruClient();
    if (!redis) return;

    const iKey = indexKey(namespace);
    const members = await redis.zrange(iKey, 0, -1);
    if (members.length) {
      const pipeline = redis.pipeline();
      for (const member of members) {
        pipeline.del(valueKey(namespace, member));
      }
      pipeline.del(iKey);
      await pipeline.exec();
    } else {
      await redis.del(iKey);
    }
  }

  async stats(namespace: string): Promise<LruStats | null> {
    const redis = await getRedisLruClient();
    if (!redis) return null;
    const size = await redis.zcard(indexKey(namespace));
    return {
      namespace,
      size,
      calculatedSize: 0,
      maxEntries: this.config.maxEntries,
      maxSizeBytes: this.config.maxSizeBytes,
    };
  }
}
