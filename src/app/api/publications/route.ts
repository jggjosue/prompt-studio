import { auth } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { getServerSubscriptionStatus, hasPublishingPlan } from '@/lib/server-subscription-status';
import connectToDatabase from '@/lib/mongoose';
import LandingPublication from '@/models/LandingPublication';
import { getRawWebPageByCatalogId } from '@/lib/web-pages';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import { publicationSlug, publicUrl, readLandingFiles } from '@/lib/landing-publishing';
import { auditPublicationFiles } from '@/lib/publication-quality';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import AssetProvenance from '@/models/AssetProvenance';
import PublicationQualityAudit from '@/models/PublicationQualityAudit';
import CreativeProject from '@/models/CreativeProject';
import { recordProjectFunnelEvent } from '@/lib/project-funnel-events';
import { humanVerificationDecision } from '@/lib/human-verification';
import { recordObservabilityEvent } from '@/lib/observability-server';

const headers = { 'Cache-Control': 'private, no-store' };
type PublicationRow = { _id: unknown; projectId?: string | null; pageId: string; name: string; slug: string; customDomain?: string | null; domainStatus: string; version: number; status: string; github?: unknown; vercel?: unknown; updatedAt: Date };
const serialize = (p: PublicationRow) => ({ id: String(p._id), projectId: p.projectId ?? null, pageId: p.pageId, name: p.name, slug: p.slug, url: publicUrl(p.slug), customDomain: p.customDomain, domainStatus: p.domainStatus, version: p.version, status: p.status, github: p.github, vercel: p.vercel, updatedAt: p.updatedAt });

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ publications: [] }, { status: 401, headers });
  await connectToDatabase();
  const rows = await LandingPublication.find({ userId }).sort({ updatedAt: -1 }).limit(100).lean();
  return NextResponse.json({ publications: rows.map(serialize) }, { headers });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Inicia sesión para publicar.' }, { status: 401, headers });
  const quota = await rateLimit({ key: `publish:${userId}`, limit: 10, windowMs: 60_000 });
  if (!quota.ok) return tooManyRequests(quota);
  if (!hasPublishingPlan(await getServerSubscriptionStatus())) return NextResponse.json({ error: 'Publicar en tu propio dominio requiere el plan Pro.' }, {status:402, headers });
  const body = await request.json().catch(() => null) as { pageId?: string; name?: string; slug?: string; assetIds?: string[]; projectId?: string } | null;
  const pageId = body?.pageId?.trim() ?? '', page = getRawWebPageByCatalogId(pageId), folder = page ? normalizeDemoFolder(page.demoUrl ?? '') : null;
  if (!page || !folder) return NextResponse.json({ error: 'Landing inválida.' }, { status: 400, headers });
  const base = publicationSlug(body?.slug || body?.name || pageId);
  if (!base) return NextResponse.json({ error: 'El subdominio no es válido.' }, { status: 400, headers });
  const assetIds = [...new Set((body?.assetIds || []).filter(id => mongoose.isValidObjectId(id)))].slice(0, 50);
  await connectToDatabase();
  const projectId = typeof body?.projectId === 'string' && mongoose.isValidObjectId(body.projectId) ? body.projectId : null;
  if (projectId) {
    const project = await CreativeProject.findOne({ _id: projectId, userId }).select('reviewStatus changeRequests').lean();
    if (!project) return NextResponse.json({ error: 'El proyecto no pertenece al usuario.' }, { status: 403, headers });
    const verification = humanVerificationDecision({ costly: false, sensitive: true, reviewStatus: project.reviewStatus, hasOpenChanges: project.changeRequests?.some((item: { status: string }) => item.status === 'open') ?? false });
    if (!verification.approved) {
      void recordObservabilityEvent({ category: 'commerce', name: 'human_verification_blocked', route: '/api/publications', userId, productId: projectId, status: 'blocked', metadata: { operation: 'publish', reasons: verification.reasons } });
      return NextResponse.json({ error: 'La publicación requiere aprobación humana del proyecto y no puede tener cambios pendientes.', approvalRequired: true, verification: { reviewStatus: project.reviewStatus ?? 'draft', hasOpenChanges: verification.reasons.includes('open_change_requests') } }, { status: 409, headers });
    }
  }
  const assets = assetIds.length ? await AssetProvenance.find({ _id: { $in: assetIds }, userId }).select('license').lean() : [];
  if (assets.length !== assetIds.length) return NextResponse.json({ error: 'Uno de los activos no pertenece al usuario.' }, { status: 403, headers });
  let files;
  try { files = await readLandingFiles(folder, page.stack ?? []); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'No se pudo auditar la landing.' }, { status: 422, headers }); }
  const quality = auditPublicationFiles(files, assets.map(asset => ({ id: String(asset._id), status: asset.license.status, name: asset.license.name })));
  const audit = await PublicationQualityAudit.create({ userId, pageId, status: quality.status, score: quality.score, blockers: quality.blockers, warnings: quality.warnings, findings: quality.findings, assetIds });
  if (quality.status === 'blocked') return NextResponse.json({ error: 'La publicación fue bloqueada por controles de calidad.', quality: { id: String(audit._id), ...quality } }, { status: 422, headers });
  let slug = base;
  for (let n = 2; await LandingPublication.exists({ slug }); n += 1) slug = `${base.slice(0, 55)}-${n}`;
  const created = await LandingPublication.create({ userId, projectId, pageId, name: (body?.name?.trim() || base).slice(0, 160), slug, folder });
  audit.publicationId = created._id;
  await audit.save();
  if (assetIds.length) await AssetProvenance.updateMany({ _id: { $in: assetIds }, userId }, { $push: { publications: { publicationId: created._id, name: created.name, version: created.version, addedAt: new Date() } }, $set: { updatedAt: new Date() } });
  if (projectId) await recordProjectFunnelEvent({ userId, projectId, stage: 'publication', occurredAt: created.publishedAt, sourceId: String(created._id) });
  return NextResponse.json({ publication: serialize(created), quality: { id: String(audit._id), ...quality } }, { status: 201, headers });
}
