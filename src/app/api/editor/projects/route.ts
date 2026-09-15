import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import {
  getServerSubscriptionStatus,
  hasComponentBuilderPlan,
} from '@/lib/server-subscription-status';
import { getRawWebPageByCatalogId } from '@/lib/web-pages';
import EditorProject, { EDITOR_PROJECT_LIMITS } from '@/models/EditorProject';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** El autoguardado escribe con debounce; el límite acota una ráfaga anómala. */
const SAVE_LIMIT = { limit: 120, windowMs: 60_000 };

/**
 * Puerta doble, igual que la página: cuenta **y** plan.
 *
 * La página ya lo comprueba, pero una API que solo confía en que la página
 * comprobó es una API abierta: se puede llamar con `curl`.
 */
async function guard(sourcePageId?: string | null) {
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() }) };
  }
  const status = await getServerSubscriptionStatus();
  // Históricamente las compras se han guardado unas veces como `wp-12` y
  // otras con el id interno de web-pages.json. Aceptamos ambas formas, pero
  // solo tras resolver la relación dentro del catálogo local.
  const sourcePage = sourcePageId ? getRawWebPageByCatalogId(sourcePageId) : null;
  const ownsSourcePage = Boolean(sourcePageId && (
    status.purchasedPages.includes(sourcePageId) ||
    (sourcePage?.id && status.purchasedPages.includes(sourcePage.id))
  ));
  if (!hasComponentBuilderPlan(status) && !ownsSourcePage) {
    return { error: NextResponse.json({ error: 'El editor requiere Premium o la compra de esta página.' }, { status: 403, headers: headers() }) };
  }
  return { userId };
}

/** Recorta el documento a algo que quepa y tenga la forma esperada. */
function sanitizeDocument(raw: unknown): { document: Record<string, unknown> } | { error: string } {
  if (!raw || typeof raw !== 'object') return { error: 'documento inválido' };
  const candidate = raw as Record<string, unknown>;
  const nodes = candidate.nodes;
  const rootId = candidate.rootId;
  if (typeof rootId !== 'string' || !nodes || typeof nodes !== 'object') return { error: 'documento inválido' };
  const count = Object.keys(nodes as Record<string, unknown>).length;
  if (count > EDITOR_PROJECT_LIMITS.maxNodes) return { error: `demasiados nodos (${count})` };
  if (!(rootId in (nodes as Record<string, unknown>))) return { error: 'la raíz no está en el documento' };

  return {
    document: {
      schemaVersion: typeof candidate.schemaVersion === 'number' ? candidate.schemaVersion : 1,
      rootId,
      nodes,
      definitions: candidate.definitions && typeof candidate.definitions === 'object' ? candidate.definitions : {},
    },
  };
}

/** GET /api/editor/projects — proyectos del usuario, el más reciente primero. */
export async function GET(request: Request) {
  const rawSourcePageId = new URL(request.url).searchParams.get('sourcePageId');
  const sourcePageId = rawSourcePageId?.trim().slice(0, 120) || null;
  const gate = await guard(sourcePageId);
  if ('error' in gate) return gate.error;

  await connectToDatabase();
  const projects = await EditorProject.find({ userId: gate.userId, ...(sourcePageId ? { sourcePageId } : {}) })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    {
      projects: projects.map(project => ({
        id: String(project._id),
        name: project.name,
        sourcePageId: project.sourcePageId ?? null,
        document: project.document,
        versions: ((project.versions ?? []) as Array<{ label: string; createdAt: Date }>).map(version => ({
          label: version.label,
          createdAt: version.createdAt,
        })),
        updatedAt: project.updatedAt,
      })),
    },
    { headers: headers() }
  );
}

/**
 * PUT /api/editor/projects — guarda (crea o actualiza) un proyecto.
 *
 * `snapshot: true` añade además una versión etiquetada. El autoguardado normal
 * no crea versiones: si lo hiciera, teclear produciría cien versiones por minuto.
 */
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'JSON inválido.' }, { status: 400, headers: headers() });
  const sourcePageId = typeof body.sourcePageId === 'string'
    ? body.sourcePageId.trim().slice(0, 120) || null
    : null;
  const gate = await guard(sourcePageId);
  if ('error' in gate) return gate.error;

  const quota = await rateLimit({ key: `editor-project:${gate.userId}`, ...SAVE_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const sanitized = sanitizeDocument(body.document);
  if ('error' in sanitized) {
    return NextResponse.json({ error: sanitized.error }, { status: 400, headers: headers() });
  }

  const name = typeof body.name === 'string' && body.name.trim()
    ? body.name.trim().slice(0, EDITOR_PROJECT_LIMITS.nameLength)
    : 'Proyecto sin título';
  const projectId = typeof body.id === 'string' ? body.id : null;
  const snapshotLabel = typeof body.snapshot === 'string' ? body.snapshot.slice(0, 200) : null;

  await connectToDatabase();

  const update: Record<string, unknown> = {
    $set: { name, document: sanitized.document, updatedAt: new Date() },
    $setOnInsert: { userId: gate.userId, sourcePageId, createdAt: new Date() },
  };
  if (snapshotLabel) {
    update.$push = {
      versions: {
        $each: [{ label: snapshotLabel, document: sanitized.document, createdAt: new Date() }],
        // Conserva solo las últimas: el documento no debe crecer sin control.
        $slice: -EDITOR_PROJECT_LIMITS.maxVersions,
      },
    };
  }

  // El filtro incluye userId: nadie puede sobrescribir el proyecto de otra cuenta.
  const filter = projectId
    ? { _id: projectId, userId: gate.userId, ...(sourcePageId ? { sourcePageId } : {}) }
    : { userId: gate.userId, name, ...(sourcePageId ? { sourcePageId } : {}) };
  const saved = await EditorProject.findOneAndUpdate(filter, update, { upsert: true, new: true }).lean();

  return NextResponse.json(
    { id: saved ? String((saved as { _id: unknown })._id) : null, savedAt: new Date().toISOString() },
    { headers: headers() }
  );
}

/** DELETE /api/editor/projects?id=… */
export async function DELETE(request: Request) {
  const gate = await guard();
  if ('error' in gate) return gate.error;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta el id.' }, { status: 400, headers: headers() });

  await connectToDatabase();
  await EditorProject.deleteOne({ _id: id, userId: gate.userId });
  return NextResponse.json({ deleted: true }, { headers: headers() });
}
