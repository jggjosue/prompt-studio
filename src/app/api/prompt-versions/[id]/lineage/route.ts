import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { lineageFor, type VersionSlim } from '@/lib/prompt-lineage-server';

export const runtime = 'nodejs';
const headers = () => cacheHeaders('private-no-store');

const serializeVersion = (item: VersionSlim, includeContent: boolean) => ({
  id: String(item._id),
  promptId: item.promptId,
  promptKind: item.promptKind,
  version: item.version,
  title: item.title,
  ...(includeContent && item.content != null ? { content: item.content } : {}),
  note: item.note,
  action: item.action,
  basedOnVersion: item.basedOnVersion ?? null,
  modelSnapshot: item.modelSnapshot || [],
  createdAt: item.createdAt,
});

/**
 * GET /api/prompt-versions/[id]/lineage
 *
 * Recorre el linaje de una versión en ambas direcciones: ancestros
 * (cadena de basedOnVersion) y descendientes (todas las ramas que parten
 * de ella). No incluye la versión consultada.
 */
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Inicia sesión para consultar el linaje.' }, { status: 401, headers: headers() });
  }
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: 'Versión no encontrada.' }, { status: 404, headers: headers() });
  }
  const result = await lineageFor(id, userId);
  if (!result) {
    return NextResponse.json({ error: 'Versión no encontrada.' }, { status: 404, headers: headers() });
  }
  const { version, ancestors, descendants } = result;
  return NextResponse.json(
    {
      version: serializeVersion(version, true),
      ancestors: ancestors.map((item) => serializeVersion(item, false)),
      descendants: descendants.map((item) => serializeVersion(item, false)),
      ancestorCount: ancestors.length,
      descendantCount: descendants.length,
    },
    { headers: headers() }
  );
}