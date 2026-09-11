import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongoose';
import { mainFunnel, type FunnelStage } from '@/lib/main-funnel';
import CreativeProject from '@/models/CreativeProject';
import AIGenerationJob from '@/models/AIGenerationJob';
import ComponentPurchase from '@/models/ComponentPurchase';
import CreditPurchase from '@/models/CreditPurchase';
import ProjectFunnelEvent from '@/models/ProjectFunnelEvent';

const headers = { 'Cache-Control': 'private, no-store' };
export async function GET(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;
  const requested = Number(new URL(request.url).searchParams.get('days') || 90), days = Math.max(7, Math.min(730, Number.isFinite(requested) ? Math.floor(requested) : 90)), since = new Date(Date.now() - days * 86_400_000);
  await connectToDatabase();
  const projects = await CreativeProject.find({ createdAt: { $gte: since } }).select('userId brief decisions createdAt updatedAt').lean();
  const ids = projects.map(project => String(project._id)), users = [...new Set(projects.map(project => project.userId))];
  const [jobs, componentPurchases, creditPurchases] = await Promise.all([
    AIGenerationJob.find({ projectId: { $in: ids } }).select('projectId status feedbackUseful actualCostUsd estimatedCostUsd createdAt completedAt').lean(),
    ComponentPurchase.find({ purchaserUserId: { $in: users }, status: 'paid' }).select('purchaserUserId purchasedAt').lean(),
    CreditPurchase.find({ userId: { $in: users }, status: 'credited' }).select('userId purchasedAt').lean(),
  ]);
  const writes: any[] = [];
  const add = (project: any, stage: FunnelStage, occurredAt: Date, sourceId?: string) => writes.push({ updateOne: { filter: { projectId: String(project._id), stage }, update: { $setOnInsert: { userId: project.userId, projectId: String(project._id), stage, occurredAt, sourceId: sourceId || null, createdAt: new Date() } }, upsert: true } });
  for (const project of projects) {
    const projectId = String(project._id), projectJobs = jobs.filter(job => job.projectId === projectId), completed = projectJobs.filter(job => job.status === 'completed' && job.completedAt).sort((a, b) => +new Date(a.completedAt!) - +new Date(b.completedAt!));
    add(project, 'project_created', project.createdAt);
    if (project.brief.trim().length >= 20) add(project, 'brief_completed', project.createdAt);
    if (completed[0]) add(project, 'first_generation', completed[0].completedAt!, String(completed[0]._id));
    const approvedDecision = project.decisions.filter((decision: any) => decision.type === 'result' && decision.status === 'approved').sort((a: any, b: any) => +new Date(a.createdAt) - +new Date(b.createdAt))[0], useful = completed.find(job => job.feedbackUseful === true);
    const approvedAt = approvedDecision?.createdAt || useful?.completedAt;
    if (approvedAt) add(project, 'result_approved', approvedAt, approvedDecision?.jobId || (useful ? String(useful._id) : undefined));
    const published = project.decisions.filter((decision: any) => decision.status === 'published').sort((a: any, b: any) => +new Date(a.createdAt) - +new Date(b.createdAt))[0];
    if (published) {
      add(project, 'publication', published.createdAt, published.publicationId || undefined);
      const purchases = [...componentPurchases.filter(item => item.purchaserUserId === project.userId).map(item => item.purchasedAt), ...creditPurchases.filter(item => item.userId === project.userId).map(item => item.purchasedAt)].sort((a, b) => +new Date(a) - +new Date(b));
      const repeat = purchases.find((date, index) => index > 0 && new Date(date) > new Date(published.createdAt));
      if (repeat) add(project, 'repurchase', repeat);
    }
  }
  if (writes.length) await ProjectFunnelEvent.bulkWrite(writes, { ordered: false });
  const events = await ProjectFunnelEvent.find({ projectId: { $in: ids } }).select('projectId stage occurredAt').lean();
  const costs = jobs.map(job => ({ projectId: job.projectId || '', createdAt: job.createdAt, costUsd: job.actualCostUsd ?? job.estimatedCostUsd ?? 0 }));
  return NextResponse.json({ days, generatedAt: new Date(), ...mainFunnel(events.map(event => ({ projectId: event.projectId, stage: event.stage as FunnelStage, occurredAt: event.occurredAt })), costs) }, { headers });
}
