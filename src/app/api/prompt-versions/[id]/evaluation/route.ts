import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { signalsForVersion, versionById } from '@/lib/prompt-lineage-server';

export const runtime = 'nodejs';
const headers = () => cacheHeaders('private-no-store');

/**
 * GET /api/prompt-versions/[id]/evaluation
 *
 * Agrega las señales registradas para una versión de prompt: calidad y
 * fidelidad del worker, coste y latencia medios de los trabajos completados
 * y feedback humano (utilidad, valoración media y motivos). Solo se reporta
 * lo grabado; nada se inventa.
 */
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Inicia sesión para consultar la evaluación.' }, { status: 401, headers: headers() });
  }
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: 'Versión no encontrada.' }, { status: 404, headers: headers() });
  }
  const version = await versionById(id, userId);
  if (!version) {
    return NextResponse.json({ error: 'Versión no encontrada.' }, { status: 404, headers: headers() });
  }
  const signals = await signalsForVersion(version.version, userId);
  return NextResponse.json({ versionId: id, versionNumber: version.version, signals }, { headers: headers() });
}