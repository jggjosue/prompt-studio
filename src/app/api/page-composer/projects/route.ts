import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import {
  getServerSubscriptionStatus,
  hasComponentBuilderPlan,
} from '@/lib/server-subscription-status';
import { sanitizeBlocks, sanitizeSettings, type PageComposerBlock } from '@/lib/page-composer';
import PageComposerProject from '@/models/PageComposerProject';

export const runtime = 'nodejs';

const headers = () => cacheHeaders('private-no-store');

/** El guardado es explícito (botón): un límite amplio frena solo ráfagas anómalas. */
const SAVE_LIMIT = { limit: 60, windowMs: 60_000 };

/**
 * Puerta doble, igual que la página: cuenta **y** plan.
 * Guardar el diseño es una acción de usuarios Premium.
 */
async function guard() {
  const { userId } = await auth();
  if (!userId) {
    return { error: NextResponse.json({ error: 'Inicia sesión.' }, { status: 401, headers: headers() }) };
  }
  const status = await getServerSubscriptionStatus();
  if (!hasComponentBuilderPlan(status)) {
    return { error: NextResponse.json({ error: 'Guardar diseños requiere Premium.' }, { status: 403, headers: headers() }) };
  }
  return { userId };
}

const toSummary = (project: Record<string, unknown>) => ({
  id: String((project as { _id: unknown })._id),
  sourceKitId: (project as { sourceKitId?: string }).sourceKitId ?? null,
  name: (project as { name: string }).name,
  brand: (project as { brand: string }).brand,
  description: (project as { description: string }).description,
  primary: (project as { primary: string }).primary,
  secondary: (project as { secondary: string }).secondary,
  background: (project as { background: string }).background,
  blocks: (project as { blocks: PageComposerBlock[] }).blocks,
  updatedAt: (project as { updatedAt: Date }).updatedAt,
});

/** GET /api/page-composer/projects?sourceKitId=… — diseños del usuario, el más reciente primero. */
export async function GET(request: Request) {
  const gate = await guard();
  if ('error' in gate) return gate.error;

  const rawSourceKitId = new URL(request.url).searchParams.get('sourceKitId');
  const sourceKitId = rawSourceKitId?.trim().slice(0, 120) || null;

  await connectToDatabase();
  const projects = await PageComposerProject.find({
    userId: gate.userId,
    ...(sourceKitId ? { sourceKitId } : {}),
  })
    .sort({ updatedAt: -1 })
    .limit(50)
    .lean();

  return NextResponse.json(
    { projects: projects.map((project) => toSummary(project as unknown as Record<string, unknown>)) },
    { headers: headers() }
  );
}

/**
 * PUT /api/page-composer/projects — crea o sobrescribe el diseño.
 *
 * Con `id` actualiza ese diseño (solo si pertenece al usuario); sin `id`,
 * actualiza el diseño atado al `sourceKitId` si existe o crea uno nuevo.
 */
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'JSON inválido.' }, { status: 400, headers: headers() });

  const gate = await guard();
  if ('error' in gate) return gate.error;

  const quota = await rateLimit({ key: `page-composer-project:${gate.userId}`, ...SAVE_LIMIT });
  if (!quota.ok) return tooManyRequests(quota);

  const settings = sanitizeSettings(body);
  if ('error' in settings) {
    return NextResponse.json({ error: settings.error }, { status: 400, headers: headers() });
  }

  const sanitized = sanitizeBlocks(body.blocks);
  if ('error' in sanitized) {
    return NextResponse.json({ error: sanitized.error }, { status: 400, headers: headers() });
  }

  const sourceKitId = typeof body.sourceKitId === 'string'
    ? body.sourceKitId.trim().slice(0, 120) || null
    : null;
  const projectId = typeof body.id === 'string' && body.id ? body.id : null;

  await connectToDatabase();

  const update: Record<string, unknown> = {
    $set: {
      name: settings.name,
      brand: settings.brand,
      description: settings.description,
      primary: settings.primary,
      secondary: settings.secondary,
      background: settings.background,
      blocks: sanitized.blocks,
      updatedAt: new Date(),
    },
    $setOnInsert: { userId: gate.userId, sourceKitId, createdAt: new Date() },
  };

  const filter = projectId
    ? { _id: projectId, userId: gate.userId }
    : { userId: gate.userId, ...(sourceKitId ? { sourceKitId } : {}) };

  const saved = await PageComposerProject.findOneAndUpdate(filter, update, { upsert: true, new: true }).lean();

  return NextResponse.json(
    { id: saved ? String((saved as { _id: unknown })._id) : null, savedAt: new Date().toISOString() },
    { headers: headers() }
  );
}

/** DELETE /api/page-composer/projects?id=… */
export async function DELETE(request: Request) {
  const gate = await guard();
  if ('error' in gate) return gate.error;

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta el id.' }, { status: 400, headers: headers() });

  await connectToDatabase();
  await PageComposerProject.deleteOne({ _id: id, userId: gate.userId });
  return NextResponse.json({ deleted: true }, { headers: headers() });
}