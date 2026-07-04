import { isCacheAdminAuthorized } from '@/lib/cache-admin-auth';
import { cacheStatsAll } from '@/lib/server-cache';
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
      redis: null,
    },
    eviction: 'least-recently-used',
    namespaces,
  });
}
