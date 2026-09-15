import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import connectToDatabase from '@/lib/mongoose';
import { isPromptVersionAction, sanitizeModelSnapshot } from '@/lib/prompt-versioning';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import PromptVersion from '@/models/PromptVersion';

export const runtime = 'nodejs';
const headers = () => cacheHeaders('private-no-store');
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const kinds = ['image', 'video', 'web'];

function serialize(item: any) {
  return { id: String(item._id), promptId: item.promptId, promptKind: item.promptKind, version: item.version, title: item.title, content: item.content, note: item.note, action: item.action, basedOnVersion: item.basedOnVersion ?? null, modelSnapshot: item.modelSnapshot || [], createdAt: item.createdAt };
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ versions: [] }, { status: 401, headers: headers() });
  const promptId = clean(new URL(request.url).searchParams.get('promptId'), 120);
  if (!promptId) return NextResponse.json({ error: 'promptId es obligatorio.' }, { status: 400, headers: headers() });
  await connectToDatabase();
  const versions = await PromptVersion.find({ userId, promptId }).sort({ version: -1 }).limit(100).lean();
  return NextResponse.json({ versions: versions.map(serialize) }, { headers: headers() });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para guardar versiones.' }, { status: 401, headers: headers() });
  const quota = await rateLimit({ key: `prompt-versions:${userId}`, limit: 20, windowMs: 60_000 });
  if (!quota.ok) return tooManyRequests(quota);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const promptId = clean(body?.promptId, 120), title = clean(body?.title, 200), requestedContent = clean(body?.content, 20_000), note = clean(body?.note, 300);
  const promptKind = clean(body?.promptKind, 20), action = body?.action;
  const basedOnVersion = Number.isInteger(body?.basedOnVersion) && Number(body?.basedOnVersion) > 0 ? Number(body?.basedOnVersion) : null;
  if (!promptId || !title || !requestedContent || !kinds.includes(promptKind) || !isPromptVersionAction(action)) return NextResponse.json({ error: 'Datos de versión inválidos.' }, { status: 400, headers: headers() });
  await connectToDatabase();
  let content = requestedContent;
  if (basedOnVersion) {
    const source = await PromptVersion.findOne({ userId, promptId, version: basedOnVersion }).select('content').lean();
    if (!source) return NextResponse.json({ error: 'La versión de origen no existe.' }, { status: 404, headers: headers() });
    // Duplicar y restaurar copian la fuente almacenada. El cliente no puede
    // atribuir contenido distinto a una versión anterior.
    if (action !== 'saved') content = source.content;
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const latest = await PromptVersion.findOne({ userId, promptId }).sort({ version: -1 }).select('version').lean();
    try {
      const created = await PromptVersion.create({ userId, promptId, promptKind, version: (latest?.version || 0) + 1, title, content, note, action, basedOnVersion, modelSnapshot: sanitizeModelSnapshot(body?.modelSnapshot) });
      return NextResponse.json({ version: serialize(created) }, { status: 201, headers: headers() });
    } catch (error: unknown) {
      if ((error as { code?: number }).code !== 11000 || attempt === 1) throw error;
    }
  }
  return NextResponse.json({ error: 'No se pudo asignar la versión.' }, { status: 409, headers: headers() });
}
