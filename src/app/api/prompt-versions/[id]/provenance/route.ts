import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { cacheHeaders } from '@/lib/cache-policy';
import { provenanceForVersion, versionById } from '@/lib/prompt-lineage-server';

export const runtime = 'nodejs';
const headers = () => cacheHeaders('private-no-store');

interface ProvenanceAsset {
  _id: unknown;
  assetType: string;
  provider: string;
  modelName: string | null;
  generatedAt: Date;
  contentHash: string;
  projectId: string | null;
  transformations: unknown[] | null;
  publications: unknown[] | null;
}

const serializeAsset = (item: ProvenanceAsset) => ({
  id: String(item._id),
  assetType: item.assetType,
  provider: item.provider,
  modelName: item.modelName,
  generatedAt: item.generatedAt,
  contentHash: item.contentHash,
  projectId: item.projectId,
  transformationCount: item.transformations?.length ?? 0,
  publicationCount: item.publications?.length ?? 0,
});

/**
 * GET /api/prompt-versions/[id]/provenance
 *
 * Traza los artefactos generados (imagen, vídeo, texto, código, datos) que
 * provienen de una versión de prompt: proveedor, modelo, contenido hash y
 * enlaces al proyecto o publicaciones. Rastro reproducible de salida a
 * versión.
 */
export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Inicia sesión para consultar la procedencia.' }, { status: 401, headers: headers() });
  }
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ error: 'Versión no encontrada.' }, { status: 404, headers: headers() });
  }
  const version = await versionById(id, userId);
  if (!version) {
    return NextResponse.json({ error: 'Versión no encontrada.' }, { status: 404, headers: headers() });
  }
  const assets = await provenanceForVersion(id, userId) as unknown as ProvenanceAsset[];
  return NextResponse.json(
    { versionId: id, versionNumber: version.version, assets: assets.map(serializeAsset), assetCount: assets.length },
    { headers: headers() }
  );
}