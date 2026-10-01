import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongoose';
import { FOUNDER_OUTREACH_SEGMENTS } from '@/lib/founder-b2b-outreach';
import { createFounderOutreachAttempt, markFounderOutreachStage, recordFounderOutreachLearning } from '@/lib/founder-outreach-operations';

export async function POST(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  await connectToDatabase();

  if (body.action === 'create') {
    if (typeof body.prospectId !== 'string' || typeof body.segment !== 'string' ||
        !FOUNDER_OUTREACH_SEGMENTS.includes(body.segment as never) ||
        typeof body.personalizationNote !== 'string' || typeof body.reviewedBy !== 'string' ||
        typeof body.senderIdentity !== 'string') {
      return NextResponse.json({ error: 'Invalid attempt' }, { status: 400 });
    }
    const result = await createFounderOutreachAttempt({
      prospectId: body.prospectId, segment: body.segment as (typeof FOUNDER_OUTREACH_SEGMENTS)[number],
      personalizationNote: body.personalizationNote, reviewedBy: body.reviewedBy, senderIdentity: body.senderIdentity,
    });
    return NextResponse.json(result, { status: result.created ? 201 : 409 });
  }

  if (body.action === 'stage' && typeof body.attemptId === 'string' && typeof body.stage === 'string') {
    const allowed = ['sent','delivered','reply','positive_reply','demo_trial','activation','checkout','paid'] as const;
    if (!allowed.includes(body.stage as never)) return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    const attempt = await markFounderOutreachStage(body.attemptId, body.stage as typeof allowed[number]);
    return NextResponse.json({ updated: Boolean(attempt), attempt });
  }

  if (body.action === 'learning' && typeof body.attemptId === 'string') {
    const attempt = await recordFounderOutreachLearning(body.attemptId, {
      objection: typeof body.objection === 'string' ? body.objection : null,
      requestedOutcome: typeof body.requestedOutcome === 'string' ? body.requestedOutcome : null,
      learningNotes: typeof body.learningNotes === 'string' ? body.learningNotes : null,
    });
    return NextResponse.json({ updated: Boolean(attempt), attempt });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
