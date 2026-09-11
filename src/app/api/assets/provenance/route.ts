import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { safeLicense } from '@/lib/asset-provenance';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import AssetProvenance from '@/models/AssetProvenance';
import LandingPublication from '@/models/LandingPublication';

const headers = { 'Cache-Control': 'private, no-store' };
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const view = (row: any) => ({ id: String(row._id), jobId: String(row.jobId), assetType: row.assetType, prompt: row.prompt, provider: row.provider, model: row.modelName, generatedAt: row.generatedAt, brandKit: row.brandKit, projectId: row.projectId, transformations: row.transformations, license: row.license, publications: row.publications, contentHash: row.contentHash, updatedAt: row.updatedAt });

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ assets: [] }, { status: 401, headers });
  await connectToDatabase();
  const projectId = clean(new URL(request.url).searchParams.get('projectId'), 80);
  const query: Record<string, unknown> = { userId };
  if (projectId) query.projectId = projectId;
  const rows = await AssetProvenance.find(query).sort({ generatedAt: -1 }).limit(200).lean();
  return NextResponse.json({ assets: rows.map(view) }, { headers });
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });
  const quota = await rateLimit({ key: `asset-provenance:${userId}`, limit: 30, windowMs: 60_000 });
  if (!quota.ok) return tooManyRequests(quota);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = clean(body?.id, 80), action = clean(body?.action, 40);
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Activo inválido.' }, { status: 400, headers });
  await connectToDatabase();
  const asset = await AssetProvenance.findOne({ _id: id, userId });
  if (!asset) return NextResponse.json({ error: 'Activo no encontrado.' }, { status: 404, headers });
  if (action === 'transform') {
    const kind = clean(body?.kind, 80), description = clean(body?.description, 1000), tool = clean(body?.tool, 120), parentAssetId = clean(body?.parentAssetId, 80) || null;
    if (!kind || !description || (parentAssetId && !mongoose.isValidObjectId(parentAssetId))) return NextResponse.json({ error: 'Transformación inválida.' }, { status: 400, headers });
    if (parentAssetId && !(await AssetProvenance.exists({ _id: parentAssetId, userId }))) return NextResponse.json({ error: 'El activo de origen no pertenece al usuario.' }, { status: 403, headers });
    asset.transformations.push({ kind, description, tool, parentAssetId, createdAt: new Date() });
  } else if (action === 'license') {
    asset.license = safeLicense(body?.license);
  } else if (action === 'publication') {
    const publicationId = clean(body?.publicationId, 80);
    if (!mongoose.isValidObjectId(publicationId)) return NextResponse.json({ error: 'Publicación inválida.' }, { status: 400, headers });
    const publication = await LandingPublication.findOne({ _id: publicationId, userId }).select('name version').lean();
    if (!publication) return NextResponse.json({ error: 'La publicación no pertenece al usuario.' }, { status: 403, headers });
    if (!asset.publications.some((item: { publicationId: mongoose.Types.ObjectId; version: number }) => String(item.publicationId) === publicationId && item.version === publication.version)) asset.publications.push({ publicationId: publication._id, name: publication.name, version: publication.version, addedAt: new Date() });
  } else return NextResponse.json({ error: 'Acción inválida.' }, { status: 400, headers });
  asset.updatedAt = new Date();
  await asset.save();
  return NextResponse.json({ asset: view(asset) }, { headers });
}
