import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { contentFingerprint, validMarketplaceLicense } from '@/lib/creator-marketplace';
import { marketplaceEligibility, type MarketplaceAssetKind } from '@/lib/marketplace-asset';
import { publicationSlug } from '@/lib/landing-publishing';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import AssetProvenance from '@/models/AssetProvenance';
import MarketplaceListing from '@/models/MarketplaceListing';
import MarketplaceRelease from '@/models/MarketplaceRelease';
import MarketplaceSale from '@/models/MarketplaceSale';

const headers = { 'Cache-Control': 'private, no-store' };
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });
  await connectToDatabase();
  const [listings, sales] = await Promise.all([MarketplaceListing.find({ creatorUserId: userId }).sort({ updatedAt: -1 }).select('+content').lean(), MarketplaceSale.find({ creatorUserId: userId }).lean()]);
  const byListing = new Map<string, { sales: number; gross: number; net: number }>();
  for (const sale of sales) { const key = String(sale.listingId), row = byListing.get(key) || { sales: 0, gross: 0, net: 0 }; row.sales++; row.gross += sale.grossCents; row.net += sale.creatorNetCents; byListing.set(key, row); }
  return NextResponse.json({ listings: listings.map(row => ({ id: String(row._id), title: row.title, kind: row.kind, summary: row.summary, content: row.content, license: row.license, priceCents: row.priceCents, currency: row.currency, status: row.status, qualityScore: row.qualityScore, reviewNotes: row.reviewNotes, version: row.version, versions: row.versions, provenanceId: String(row.assetProvenanceId), releaseId: row.currentReleaseId ? String(row.currentReleaseId) : null, eligibility: row.eligibility, metrics: byListing.get(String(row._id)) || { sales: 0, gross: 0, net: 0 } })) }, { headers });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para publicar.' }, { status: 401, headers });
  const quota = await rateLimit({ key: `creator-listing:${userId}`, limit: 10, windowMs: 60_000 });
  if (!quota.ok) return tooManyRequests(quota);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const title = clean(body?.title, 160), summary = clean(body?.summary, 500), content = clean(body?.content, 100000);
  const kind = clean(body?.kind, 20) as MarketplaceAssetKind, license = body?.license, priceCents = Number(body?.priceCents);
  const currency = clean(body?.currency, 3).toLowerCase() || 'usd', provenanceId = clean(body?.provenanceId, 80), previewUrl = clean(body?.previewUrl, 2000);
  const seed = typeof body?.seed === 'number' && Number.isInteger(body.seed) ? body.seed : null;
  const parameters = body?.parameters && typeof body.parameters === 'object' && !Array.isArray(body.parameters) ? body.parameters as Record<string, unknown> : {};
  if (title.length < 3 || summary.length < 20 || content.length < 40 || !['prompt', 'kit', 'template'].includes(kind) || !validMarketplaceLicense(license) || !Number.isInteger(priceCents) || priceCents < 0 || priceCents > 50000 || !['usd', 'mxn', 'eur'].includes(currency) || !mongoose.isValidObjectId(provenanceId)) return NextResponse.json({ error: 'Revisa título, contenido, procedencia, licencia y precio.' }, { status: 400, headers });
  await connectToDatabase();
  const provenance = await AssetProvenance.findOne({ _id: provenanceId, userId }).lean();
  const hash = provenance?.contentHash ?? contentFingerprint(content);
  const eligibility = marketplaceEligibility({ creatorUserId: userId, kind, contentHash: hash, qualityScore: null, previewUrl: previewUrl || null, reproducibility: kind === 'prompt' ? null : { seed, parameters }, provenance: provenance ? { id: String(provenance._id), creatorUserId: provenance.userId, contentHash: provenance.contentHash, promptVersionId: provenance.prompt.versionId, promptVersionNumber: provenance.prompt.versionNumber, provider: provenance.provider, model: provenance.modelName, licenseStatus: provenance.license.status, commercialUse: provenance.license.commercialUse } : null });
  if (!eligibility.eligible) return NextResponse.json({ error: 'El activo no cumple los requisitos de publicación.', reasons: eligibility.reasons }, { status: 422, headers });
  if (await MarketplaceListing.exists({ contentHash: hash })) return NextResponse.json({ error: 'Este contenido ya existe. La política anti-duplicados bloquea copias exactas.' }, { status: 409, headers });
  const user = await (await clerkClient()).users.getUser(userId), creatorName = ([user.firstName, user.lastName].filter(Boolean).join(' ') || 'Creador').slice(0, 80);
  let slug = publicationSlug(title); for (let n = 2; await MarketplaceListing.exists({ slug }); n++) slug = `${publicationSlug(title).slice(0, 55)}-${n}`;
  const listing = await MarketplaceListing.create({ creatorUserId: userId, creatorName, title, slug, kind, summary, content, contentHash: hash, license, priceCents, currency, status: 'pending', assetProvenanceId: provenance!._id, promptVersionId: provenance!.prompt.versionId, eligibility: { ...eligibility, checkedAt: new Date() }, preview: previewUrl ? { url: previewUrl, seed, parameters } : null, versions: [{ version: 1, contentHash: hash, changeNote: 'Versión inicial' }] });
  const release = await MarketplaceRelease.create({ listingId: listing._id, releaseNumber: 1, content, contentHash: hash, changeNote: 'Versión inicial', provenance: { assetProvenanceId: provenanceId, prompt: provenance!.prompt, provider: provenance!.provider, model: provenance!.modelName, generatedAt: provenance!.generatedAt }, preview: listing.preview });
  listing.currentReleaseId = release._id; await listing.save();
  return NextResponse.json({ id: String(listing._id), releaseId: String(release._id), status: listing.status }, { status: 201, headers });
}
