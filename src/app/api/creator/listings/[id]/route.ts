import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { marketplaceEligibility } from '@/lib/marketplace-asset';
import AssetProvenance from '@/models/AssetProvenance';
import MarketplaceListing from '@/models/MarketplaceListing';
import MarketplaceRelease from '@/models/MarketplaceRelease';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(), { id } = await params;
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  if (!mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'Producto inválido.' }, { status: 400 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const content = typeof body?.content === 'string' ? body.content.trim().slice(0, 100000) : '';
  const changeNote = typeof body?.changeNote === 'string' ? body.changeNote.trim().slice(0, 300) : '';
  const provenanceId = typeof body?.provenanceId === 'string' ? body.provenanceId : '';
  if (content.length < 40 || !mongoose.isValidObjectId(provenanceId)) return NextResponse.json({ error: 'Cada release requiere contenido y procedencia válidos.' }, { status: 400 });
  await connectToDatabase();
  const [listing, provenance] = await Promise.all([MarketplaceListing.findOne({ _id: id, creatorUserId: userId }).select('+content'), AssetProvenance.findOne({ _id: provenanceId, userId }).lean()]);
  if (!listing) return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
  const eligibility = marketplaceEligibility({ creatorUserId: userId, kind: listing.kind, contentHash: provenance?.contentHash ?? '', qualityScore: null, previewUrl: listing.preview?.url ?? null, reproducibility: listing.kind === 'prompt' ? null : listing.preview ? { seed: listing.preview.seed, parameters: listing.preview.parameters } : null, provenance: provenance ? { id: String(provenance._id), creatorUserId: provenance.userId, contentHash: provenance.contentHash, promptVersionId: provenance.prompt.versionId, promptVersionNumber: provenance.prompt.versionNumber, provider: provenance.provider, model: provenance.modelName, licenseStatus: provenance.license.status, commercialUse: provenance.license.commercialUse } : null });
  if (!eligibility.eligible) return NextResponse.json({ error: 'El nuevo release no es elegible.', reasons: eligibility.reasons }, { status: 422 });
  if (provenance!.contentHash === listing.contentHash) return NextResponse.json({ error: 'No hay un activo nuevo que publicar.' }, { status: 409 });
  if (await MarketplaceListing.exists({ _id: { $ne: listing._id }, contentHash: provenance!.contentHash })) return NextResponse.json({ error: 'La actualización duplica otro producto.' }, { status: 409 });
  const releaseNumber = listing.version + 1;
  const release = await MarketplaceRelease.create({ listingId: listing._id, releaseNumber, content, contentHash: provenance!.contentHash, changeNote, provenance: { assetProvenanceId: provenanceId, prompt: provenance!.prompt, provider: provenance!.provider, model: provenance!.modelName, generatedAt: provenance!.generatedAt }, preview: listing.preview });
  listing.version = releaseNumber; listing.content = content; listing.contentHash = provenance!.contentHash; listing.assetProvenanceId = provenance!._id; listing.promptVersionId = provenance!.prompt.versionId!; listing.currentReleaseId = release._id;
  listing.eligibility = { ...eligibility, checkedAt: new Date() }; listing.status = 'pending'; listing.qualityScore = null; listing.reviewNotes = null; listing.updatedAt = new Date(); listing.versions.push({ version: releaseNumber, contentHash: provenance!.contentHash, changeNote, createdAt: new Date() });
  await listing.save();
  return NextResponse.json({ version: releaseNumber, releaseId: String(release._id), status: listing.status });
}
