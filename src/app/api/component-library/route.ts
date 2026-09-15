import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import ComponentLibrary, { LIBRARY_LIMITS } from '@/models/ComponentLibrary';

export const runtime = 'nodejs';

/** Contenido por usuario: nunca cacheable. */
const headers = () => cacheHeaders('private-no-store');

/** La vista se guarda entera al cambiar; conviene acotar la frecuencia. */
const SAVE_LIMIT = { limit: 60, windowMs: 60_000 };

const EMPTY = { favorites: [], recent: [], collections: [], projects: [] };

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const ids = (value: unknown, max: number) =>
  Array.isArray(value)
    ? Array.from(
        new Set(
          value
            .map(item => text(item, LIBRARY_LIMITS.idLength))
            .filter(Boolean)
        )
      ).slice(0, max)
    : [];

/**
 * Saneado del cuerpo.
 *
 * El cliente manda el estado completo, así que aquí se recorta todo: nombres,
 * ids, tamaños de lista y número de grupos. Sin esto, un `PUT` manipulado podría
 * dejar un documento de megabytes en la cuenta y romper la pantalla que lo lee.
 */
function sanitizeGroups(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, LIBRARY_LIMITS.groups)
    .map(raw => {
      const group = (raw ?? {}) as Record<string, unknown>;
      const id = text(group.id, LIBRARY_LIMITS.idLength);
      const name = text(group.name, LIBRARY_LIMITS.nameLength);
      if (!id || !name) return null;
      const createdAt = text(group.createdAt, 40) || new Date().toISOString();
      return {
        id,
        name,
        componentIds: ids(group.componentIds, LIBRARY_LIMITS.componentsPerGroup),
        createdAt,
      };
    })
    .filter((group): group is NonNullable<typeof group> => group !== null);
}

function sanitizeState(body: Record<string, unknown> | null) {
  return {
    favorites: ids(body?.favorites, LIBRARY_LIMITS.favorites),
    recent: Array.isArray(body?.recent)
      ? (body.recent as unknown[])
          .slice(0, LIBRARY_LIMITS.recent)
          .map(raw => {
            const item = (raw ?? {}) as Record<string, unknown>;
            const id = text(item.id, LIBRARY_LIMITS.idLength);
            if (!id) return null;
            return { id, seenAt: text(item.seenAt, 40) || new Date().toISOString() };
          })
          .filter((item): item is { id: string; seenAt: string } => item !== null)
      : [],
    collections: sanitizeGroups(body?.collections),
    projects: sanitizeGroups(body?.projects),
  };
}

/**
 * GET /api/component-library — biblioteca del usuario.
 *
 * Sin sesión devuelve 401 con el estado vacío: la pantalla es privada y el
 * cliente usa ese código para mandar a registrarse en lugar de pintar una
 * biblioteca falsa.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { library: EMPTY, error: 'Inicia sesión para ver tu biblioteca.' },
      { status: 401, headers: headers() }
    );
  }

  await connectToDatabase();
  const document = await ComponentLibrary.findOne({ userId }).lean();

  return NextResponse.json(
    {
      library: document
        ? {
            favorites: document.favorites ?? [],
            recent: document.recent ?? [],
            collections: document.collections ?? [],
            projects: document.projects ?? [],
          }
        : EMPTY,
    },
    { headers: headers() }
  );
}

/** PUT /api/component-library — reemplaza la biblioteca del usuario. */
export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Inicia sesión para guardar tu biblioteca.' },
      { status: 401, headers: headers() }
    );
  }

  const quota = await rateLimit({ key: `component-library:${userId}`, ...SAVE_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json(
      { error: 'JSON inválido.' },
      { status: 400, headers: headers() }
    );
  }

  const library = sanitizeState(body);

  await connectToDatabase();
  // El filtro lleva userId: nadie puede escribir en la biblioteca de otra cuenta.
  await ComponentLibrary.updateOne(
    { userId },
    { $set: { ...library, updatedAt: new Date() }, $setOnInsert: { userId, createdAt: new Date() } },
    { upsert: true }
  );

  return NextResponse.json({ library }, { headers: headers() });
}
