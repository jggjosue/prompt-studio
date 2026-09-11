import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { hashClientToken } from '@/lib/project-collaboration';
import { clientIp, rateLimit, tooManyRequests } from '@/lib/rate-limit';
import AIGenerationJob from '@/models/AIGenerationJob';
import CreativeProject from '@/models/CreativeProject';
import ProjectClientLink from '@/models/ProjectClientLink';

const headers = { 'Cache-Control': 'private, no-store' };
const clean = (value: unknown, length: number) => typeof value === 'string' ? value.trim().slice(0, length) : '';
async function context(token: string) { if (!/^[A-Za-z0-9_-]{40,100}$/.test(token)) return null; await connectToDatabase(); const link = await ProjectClientLink.findOne({ tokenHash: hashClientToken(token), revokedAt: null, expiresAt: { $gt: new Date() } }).lean(); if (!link) return null; const project = await CreativeProject.findById(link.projectId).select('name brief audience brand reviewStatus reviewComments changeRequests updatedAt').lean(); return project ? { link, project } : null; }

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params, data = await context(token); if (!data) return NextResponse.json({ error: 'El enlace no existe, expiró o fue revocado.' }, { status: 404, headers });
  const jobs = await AIGenerationJob.find({ projectId: data.link.projectId, status: 'completed' }).sort({ completedAt: -1 }).limit(100).select('kind provider result outputResolution outputQuality completedAt').lean();
  return NextResponse.json({ review: { project: { name: data.project.name, brief: data.project.brief, audience: data.project.audience, brand: data.project.brand, status: data.project.reviewStatus ?? 'draft', updatedAt: data.project.updatedAt }, deliverables: jobs.map(job => ({ id: String(job._id), kind: job.kind, provider: job.provider, result: job.result, resolution: job.outputResolution, quality: job.outputQuality, completedAt: job.completedAt })), comments: data.project.reviewComments.filter((comment: any) => comment.source === 'client').map((comment: any) => ({ authorName: comment.authorName, body: comment.body, jobId: comment.jobId, createdAt: comment.createdAt })), openChanges: data.project.changeRequests.filter((item: any) => item.status === 'open').map((item: any) => ({ authorName: item.authorName, body: item.body, jobId: item.jobId, createdAt: item.createdAt })), allowComments: data.link.allowComments, expiresAt: data.link.expiresAt } }, { headers });
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const quota = await rateLimit({ key: `client-review:${clientIp(request)}`, limit: 10, windowMs: 60_000 }); if (!quota.ok) return tooManyRequests(quota);
  const { token } = await params, data = await context(token); if (!data || !data.link.allowComments) return NextResponse.json({ error: 'El enlace no permite comentarios.' }, { status: 403, headers });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null, authorName = clean(body?.authorName, 120), text = clean(body?.body, 2_000), jobId = clean(body?.jobId, 80), requestChange = body?.requestChange === true;
  if (!authorName || !text) return NextResponse.json({ error: 'Nombre y comentario son obligatorios.' }, { status: 400, headers });
  if (jobId && !(await AIGenerationJob.exists({ _id: jobId, projectId: data.link.projectId, status: 'completed' }))) return NextResponse.json({ error: 'Resultado inválido.' }, { status: 400, headers });
  const project = await CreativeProject.findById(data.link.projectId); if (!project) return NextResponse.json({ error: 'Proyecto no encontrado.' }, { status: 404, headers });
  if (requestChange) project.changeRequests.push({ userId: null, authorName, body: text, jobId: jobId || null, status: 'open', resolvedBy: null, createdAt: new Date(), resolvedAt: null } as any); else project.reviewComments.push({ userId: null, authorName, body: text, jobId: jobId || null, source: 'client', createdAt: new Date() } as any);
  if (project.activity.length >= 500) project.activity.shift(); project.activity.push({ actorUserId: null, actorName: authorName, action: requestChange ? 'client_change_requested' : 'client_comment_added', detail: text.slice(0, 300), createdAt: new Date() } as any); project.updatedAt = new Date(); await project.save();
  return NextResponse.json({ ok: true }, { status: 201, headers });
}
