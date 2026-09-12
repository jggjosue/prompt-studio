import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import SavedItem, { isSavedItemKind } from '@/models/SavedItem';

export const runtime = 'nodejs';

/** Contenido por usuario: nunca cacheable. */
const headers = () => cacheHeaders('private-no-store');

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

/**
 * `href` se guarda y luego se pinta como enlace. Solo se admiten rutas internas:
 * sin esta comprobación, un payload manipulado podría dejar un `javascript:` o
 * un dominio externo guardado en la cuenta de la víctima.
 */
function isInternalHref(href: string): boolean {
  return /^\/[^/\\]/.test(href) || href === '/';
}

/** Límite propio: escritura autenticada y barata, pero conviene acotarla. */
const SAVE_LIMIT = { limit: 30, windowMs: 60_000 };

/** GET /api/saved — recursos guardados por el usuario, del más reciente al más antiguo. */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ items: [] }, { status: 401, headers: headers() });
  }

  await connectToDatabase();
  const documents = await SavedItem.find({ userId })
    .sort({ createdAt: -1 })
    .limit(500)
    .lean();

  return NextResponse.json(
    {
      items: documents.map(item => ({
        itemKind: item.itemKind,
        itemId: item.itemId,
        title: item.title,
        imageUrl: item.imageUrl ?? null,
        href: item.href,
        createdAt: item.createdAt,
      })),
    },
    { headers: headers() }
  );
}

/** POST /api/saved — guarda un recurso. Idempotente: repetirlo no duplica. */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Inicia sesión para guardar recursos.' },
      { status: 401, headers: headers() }
    );
  }

  const quota = await rateLimit({ key: `saved:${userId}`, ...SAVE_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const itemKind = body?.itemKind;
  const itemId = clean(body?.itemId, 120);
  const title = clean(body?.title, 200);
  const href = clean(body?.href, 300);
  const imageUrl = clean(body?.imageUrl, 600) || null;

  if (!isSavedItemKind(itemKind) || !itemId || !title || !isInternalHref(href)) {
    return NextResponse.json(
      { error: 'Datos del recurso inválidos.' },
      { status: 400, headers: headers() }
    );
  }

  await connectToDatabase();
  // Upsert contra el índice único {userId, itemKind, itemId}: dos clics
  // simultáneos no pueden crear dos filas.
  await SavedItem.updateOne(
    { userId, itemKind, itemId },
    {
      $set: { title, imageUrl, href },
      $setOnInsert: { userId, itemKind, itemId, createdAt: new Date() },
    },
    { upsert: true }
  );

  return NextResponse.json({ saved: true }, { headers: headers() });
}

/** DELETE /api/saved — quita un recurso guardado. */
export async function DELETE(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Inicia sesión para modificar tus guardados.' },
      { status: 401, headers: headers() }
    );
  }

  const quota = await rateLimit({ key: `saved:${userId}`, ...SAVE_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const itemKind = body?.itemKind;
  const itemId = clean(body?.itemId, 120);

  if (!isSavedItemKind(itemKind) || !itemId) {
    return NextResponse.json(
      { error: 'Datos del recurso inválidos.' },
      { status: 400, headers: headers() }
    );
  }

  await connectToDatabase();
  // El filtro incluye userId: nadie puede borrar el guardado de otra persona.
  await SavedItem.deleteOne({ userId, itemKind, itemId });

  return NextResponse.json({ saved: false }, { headers: headers() });
}
