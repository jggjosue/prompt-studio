import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { compareVersions } from '@/lib/prompt-evaluation';
import { signalsForVersion, versionById } from '@/lib/prompt-lineage-server';

export const runtime = 'nodejs';
const headers = () => cacheHeaders('private-no-store');

/**
 * GET /api/prompt-versions/compare?versionA=<id>&versionB=<id>
 *
 * Compara dos versiones del MISMO prompt usando únicamente los ejes donde
 * ambas tienen señal registrada: calidad, fidelidad, coste, latencia y
 * valoración media. Entradas inconsistentes no se comparan.
 */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Inicia sesión para comparar versiones.' }, { status: 401, headers: headers() });
  }
  const url = new URL(request.url);
  const versionA = url.searchParams.get('versionA') ?? '';
  const versionB = url.searchParams.get('versionB') ?? '';
  const objectId = /^[a-f0-9]{24}$/i;
  if (!objectId.test(versionA) || !objectId.test(versionB)) {
    return NextResponse.json({ error: 'Indica dos versiones válidas.' }, { status: 400, headers: headers() });
  }
  const [a, b] = await Promise.all([versionById(versionA, userId), versionById(versionB, userId)]);
  if (!a || !b) {
    return NextResponse.json({ error: 'Versión no encontrada.' }, { status: 404, headers: headers() });
  }
  if (a.promptId !== b.promptId) {
    return NextResponse.json({ error: 'Solo se comparan versiones del mismo prompt.' }, { status: 400, headers: headers() });
  }
  const [signalsA, signalsB] = await Promise.all([signalsForVersion(a.version, userId), signalsForVersion(b.version, userId)]);
  if (!signalsA || !signalsB) {
    return NextResponse.json({ error: 'Faltan señales registradas para comparar.' }, { status: 409, headers: headers() });
  }
  const comparison = compareVersions(signalsA, signalsB);
  return NextResponse.json(
    {
      promptId: a.promptId,
      a: { versionId: String(a._id), versionNumber: a.version, signals: signalsA },
      b: { versionId: String(b._id), versionNumber: b.version, signals: signalsB },
      comparison,
    },
    { headers: headers() }
  );
}