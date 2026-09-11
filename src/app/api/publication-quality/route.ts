import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import PublicationQualityAudit from '@/models/PublicationQualityAudit';

const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ audits: [] }, { status: 401, headers });
  const url = new URL(request.url), publicationId = url.searchParams.get('publicationId'), pageId = url.searchParams.get('pageId');
  await connectToDatabase();
  const query: Record<string, unknown> = { userId };
  if (publicationId) query.publicationId = publicationId;
  if (pageId) query.pageId = pageId;
  const rows = await PublicationQualityAudit.find(query).sort({ createdAt: -1 }).limit(100).lean();
  return NextResponse.json({ audits: rows.map((row: any) => ({ id: String(row._id), publicationId: row.publicationId ? String(row.publicationId) : null, pageId: row.pageId, status: row.status, score: row.score, blockers: row.blockers, warnings: row.warnings, findings: row.findings, assetIds: row.assetIds, createdAt: row.createdAt })) }, { headers });
}
