import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { validatePageSchema, type SiteSchema } from '@/lib/editor/page-schema';
import PageComposerProject, { PAGE_COMPOSER_PROJECT_LIMITS } from '@/models/PageComposerProject';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** El autoguardado escribe con debounce; el límite acota una ráfaga anómala. */
const SAVE_LIMIT = { limit: 120, windowMs: 60_000 };

/** Los borradores Free y Premium requieren una cuenta y siempre pertenecen a su autor. */
async function guard() {
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() }) };
  }
  return { userId };
}

/** Valida y acota un schema antes de tocar la base de datos. */
function sanitizeSchema(raw: unknown): { schema: SiteSchema } | { error: string } {
  if (!raw || typeof raw !== 'object') return { error: 'schema inválido' };
  const result = validatePageSchema(raw);
  if (!result.ok) {
    const first = result.issues[0];
    return { error: first ? `schema inválido (${first.code})` : 'schema inválido' };
  }
  return { schema: result.schema };
}

/** GET /api/page-composer/projects/[id] — borrador del usuario. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await guard();
  if ('error' in gate) return gate.error;

  const { id } = await params;
  await connectToDatabase();
  const project = await PageComposerProject.findOne({ _id: id, userId: gate.userId }).lean();
  if (!project) return NextResponse.json({ error: 'No existe el borrador.' }, { status: 404, headers: headers() });

  return NextResponse.json(
    {
      id: String(project._id),
      name: project.name,
      schema: project.document,
      version: project.version,
      updatedAt: project.updatedAt,
    },
    { headers: headers() }
  );
}

/**
 * PUT /api/page-composer/projects/[id] — guarda un borrador.
 *
 * Concurrencia optimista: el cliente manda `version`; si el guardado de otra
 * pestaña avanzó la versión, se responde 409 sin tocar nada. Un borrador
 * inexistente se crea cuando el cliente llega con `version` 0.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await guard();
  if ('error' in gate) return gate.error;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'JSON inválido.' }, { status: 400, headers: headers() });

  const quota = await rateLimit({ key: `page-composer-project:${gate.userId}`, ...SAVE_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const sanitized = sanitizeSchema(body.schema);
  if ('error' in sanitized) {
    return NextResponse.json({ error: sanitized.error }, { status: 400, headers: headers() });
  }

  const sentVersion = typeof body.version === 'number' && Number.isFinite(body.version) ? body.version : null;
  const name = typeof body.name === 'string' && body.name.trim()
    ? body.name.trim().slice(0, PAGE_COMPOSER_PROJECT_LIMITS.nameLength)
    : 'Sitio sin título';
  const { id } = await params;

  await connectToDatabase();

  const isNew = id === 'new';
  const stored = isNew ? null : await PageComposerProject.findOne({ _id: id, userId: gate.userId });

  if (!stored) {
    if (sentVersion !== 0 && sentVersion !== null) {
      return NextResponse.json(
        { error: 'Versión obsoleta.', version: null },
        { status: 409, headers: headers() }
      );
    }
    const created = await PageComposerProject.create({
      userId: gate.userId,
      name,
      document: sanitized.schema,
      version: 1,
    });
    return NextResponse.json(
      { id: String(created._id), version: created.version, savedAt: new Date().toISOString() },
      { headers: headers() }
    );
  }

  if (sentVersion !== stored.version) {
    return NextResponse.json(
      { error: 'Versión obsoleta.', version: stored.version },
      { status: 409, headers: headers() }
    );
  }

  stored.document = sanitized.schema;
  stored.name = name;
  stored.version = stored.version + 1;
  stored.updatedAt = new Date();
  await stored.save();

  return NextResponse.json(
    { id: String(stored._id), version: stored.version, savedAt: new Date().toISOString() },
    { headers: headers() }
  );
}
