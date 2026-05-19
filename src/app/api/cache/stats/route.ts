import { isCacheAdminAuthorized } from '@/lib/cache-admin-auth';
import { cacheStatsAll, isRedisLruConfigured } from '@/lib/server-cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  if (!isCacheAdminAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const namespaces = await cacheStatsAll();

  return NextResponse.json({
    engine: 'lru',
    layers: {
      memory: 'MemoryLruStore (L1, proceso)',
      redis: isRedisLruConfigured()
        ? 'RedisLruStore (L2, ZSET + STRING)'
        : null,
    },
    eviction: 'least-recently-used',
    namespaces,
  });
}
