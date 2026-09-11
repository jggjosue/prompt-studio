import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongoose';
import { canEditProject, canManageTeam, canReview, canTransitionReview, createClientToken, hashClientToken, normalizeCollaboratorEmail, reviewStatuses, type ProjectRole, type ReviewStatus } from '@/lib/project-collaboration';
import { rateLimit, tooManyRequests } from '@/lib/rate-limit';
import { getSiteUrl } from '@/lib/site-url';
import AIGenerationJob from '@/models/AIGenerationJob';
import CreativeProject from '@/models/CreativeProject';
import ProjectClientLink from '@/models/ProjectClientLink';

const headers = { 'Cache-Control': 'private, no-store' };
const clean = (value: unknown, length: number) => typeof value === 'string' ? value.trim().slice(0, length) : '';
async function identity(userId: string) { const user = await (await clerkClient()).users.getUser(userId); return { email: user.primaryEmailAddress?.emailAddress?.toLowerCase() ?? '', name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'Miembro del equipo' }; }
function roleFor(project: any, userId: string, email: string): ProjectRole | null { if (project.userId === userId) return 'owner'; const member = project.collaborators.find((item: any) => item.userId === userId || item.email === email); return member?.role ?? null; }
function activity(project: any, userId: string | null, name: string, action: string, detail: string) { if (project.activity.length >= 500) project.activity.shift(); project.activity.push({ actorUserId: userId, actorName: name, action, detail, createdAt: new Date() }); }

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(), { id } = await params;
  if (!userId || !mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });
  const who = await identity(userId); await connectToDatabase();
  const project = await CreativeProject.findById(id).select('userId reviewStatus collaborators reviewComments changeRequests activity').lean();
  const role = project ? roleFor(project, userId, who.email) : null;
  if (!project || !role) return NextResponse.json({ error: 'Proyecto no encontrado.' }, { status: 404, headers });
  const links = canManageTeam(role) ? await ProjectClientLink.find({ projectId: id }).sort({ createdAt: -1 }).select('label allowComments expiresAt revokedAt createdAt').lean() : [];
  return NextResponse.json({ collaboration: { role, reviewStatus: project.reviewStatus ?? 'draft', collaborators: project.collaborators, comments: project.reviewComments, changeRequests: project.changeRequests, activity: [...project.activity].reverse().slice(0, 100), links: links.map(link => ({ id: String(link._id), label: link.label, allowComments: link.allowComments, expiresAt: link.expiresAt, revokedAt: link.revokedAt, createdAt: link.createdAt })) } }, { headers });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth(), { id } = await params;
  if (!userId || !mongoose.isValidObjectId(id)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401, headers });
  const quota = await rateLimit({ key: `project-collaboration:${userId}`, limit: 30, windowMs: 60_000 }); if (!quota.ok) return tooManyRequests(quota);
  const body = await request.json().catch(() => null) as Record<string, unknown> | null, action = clean(body?.action, 40), who = await identity(userId);
  await connectToDatabase(); const project = await CreativeProject.findById(id); const role = project ? roleFor(project, userId, who.email) : null;
  if (!project || !role) return NextResponse.json({ error: 'Proyecto no encontrado.' }, { status: 404, headers });

  if (action === 'invite') {
    if (!canManageTeam(role)) return NextResponse.json({ error: 'Solo el propietario administra el equipo.' }, { status: 403, headers });
    const email = normalizeCollaboratorEmail(body?.email), memberRole = body?.role === 'reviewer' ? 'reviewer' : body?.role === 'editor' ? 'editor' : null;
    if (!email || !memberRole || email === who.email) return NextResponse.json({ error: 'Correo o rol inválido.' }, { status: 400, headers });
    const existing = project.collaborators.find((item: any) => item.email === email); if (existing) existing.role = memberRole; else project.collaborators.push({ email, userId: null, role: memberRole, invitedBy: userId, createdAt: new Date() } as any);
    activity(project, userId, who.name, 'member_invited', `${email} · ${memberRole}`);
  } else if (action === 'comment' || action === 'request-change') {
    const text = clean(body?.body, 2_000), jobId = clean(body?.jobId, 80); if (!text) return NextResponse.json({ error: 'Escribe un comentario.' }, { status: 400, headers });
    if (jobId && (!mongoose.isValidObjectId(jobId) || !(await AIGenerationJob.exists({ _id: jobId, projectId: id })))) return NextResponse.json({ error: 'El resultado no pertenece al proyecto.' }, { status: 400, headers });
    if (action === 'request-change') { if (!canReview(role)) return NextResponse.json({ error: 'Solo revisores y propietario pueden solicitar cambios.' }, { status: 403, headers }); if (project.changeRequests.length >= 300) project.changeRequests.shift(); project.changeRequests.push({ userId, authorName: who.name, body: text, jobId: jobId || null, status: 'open', resolvedBy: null, createdAt: new Date(), resolvedAt: null } as any); activity(project, userId, who.name, 'change_requested', text.slice(0, 300)); }
    else { if (project.reviewComments.length >= 500) project.reviewComments.shift(); project.reviewComments.push({ userId, authorName: who.name, body: text, jobId: jobId || null, source: 'member', createdAt: new Date() } as any); activity(project, userId, who.name, 'comment_added', text.slice(0, 300)); }
  } else if (action === 'set-status') {
    const next = body?.status as ReviewStatus, current = (project.reviewStatus ?? 'draft') as ReviewStatus;
    if (!reviewStatuses.includes(next) || !canTransitionReview(role, current, next)) return NextResponse.json({ error: 'Transición de estado no permitida para tu rol.' }, { status: 403, headers });
    project.reviewStatus = next; activity(project, userId, who.name, 'status_changed', `${current} → ${next}`);
  } else if (action === 'resolve-change') {
    if (!canEditProject(role)) return NextResponse.json({ error: 'Solo propietario o editor pueden resolver cambios.' }, { status: 403, headers });
    const requestId = clean(body?.requestId, 80), item = project.changeRequests.id(requestId); if (!item || item.status !== 'open') return NextResponse.json({ error: 'Solicitud no encontrada.' }, { status: 404, headers }); item.status = 'resolved'; item.resolvedBy = userId; item.resolvedAt = new Date(); activity(project, userId, who.name, 'change_resolved', item.body.slice(0, 300));
  } else if (action === 'create-link') {
    if (!canManageTeam(role)) return NextResponse.json({ error: 'Solo el propietario crea enlaces.' }, { status: 403, headers });
    const token = createClientToken(), days = Math.max(1, Math.min(90, Math.round(Number(body?.days) || 14))), label = clean(body?.label, 120) || 'Cliente';
    await ProjectClientLink.create({ projectId: id, ownerUserId: userId, tokenHash: hashClientToken(token), label, allowComments: body?.allowComments !== false, expiresAt: new Date(Date.now() + days * 86_400_000) });
    activity(project, userId, who.name, 'client_link_created', `${label} · ${days} días`); await project.save();
    return NextResponse.json({ url: `${getSiteUrl().replace(/\/$/, '')}/review/${token}` }, { status: 201, headers });
  } else if (action === 'revoke-link') {
    if (!canManageTeam(role)) return NextResponse.json({ error: 'Solo el propietario revoca enlaces.' }, { status: 403, headers });
    const linkId = clean(body?.linkId, 80); await ProjectClientLink.updateOne({ _id: linkId, projectId: id, ownerUserId: userId }, { $set: { revokedAt: new Date() } }); activity(project, userId, who.name, 'client_link_revoked', 'Enlace privado revocado');
  } else return NextResponse.json({ error: 'Acción inválida.' }, { status: 400, headers });
  project.updatedAt = new Date(); await project.save(); return NextResponse.json({ ok: true, reviewStatus: project.reviewStatus }, { headers });
}
