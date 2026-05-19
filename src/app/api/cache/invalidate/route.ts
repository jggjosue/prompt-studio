import { isCacheAdminAuthorized } from '@/lib/cache-admin-auth';
import type { CacheNamespace } from '@/lib/cache-namespace-policy';
import { listCacheNamespaces } from '@/lib/cache-namespace-policy';
import {
  cacheInvalidate,
  cacheInvalidateAll,
} from '@/lib/server-cache';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!isCacheAdminAuthorized(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: { namespace?: string; key?: string; all?: boolean } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    /* cuerpo vacío → invalidar todo si all */
  }

  if (body.all) {
    await cacheInvalidateAll();
    return NextResponse.json({ ok: true, invalidated: 'all' });
  }

  const namespace = body.namespace as CacheNamespace | undefined;
  if (!namespace || !listCacheNamespaces().includes(namespace)) {
    return NextResponse.json(
      {
        error: 'namespace inválido',
        allowed: listCacheNamespaces(),
      },
      { status: 400 }
    );
  }

  await cacheInvalidate(namespace, body.key);
  return NextResponse.json({
    ok: true,
    namespace,
    key: body.key ?? '*',
  });
}
