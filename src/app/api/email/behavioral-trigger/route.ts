import { requireCronOrAdmin } from '@/lib/api-auth';
import { processBehavioralTrigger } from '@/lib/behavioral-email-trigger-processor';
import { BEHAVIORAL_EMAIL_TRIGGERS, type BehavioralEmailTrigger } from '@/lib/behavioral-email-triggers';
import connectToDatabase from '@/lib/mongoose';
import { NextResponse } from 'next/server';

const allowed = new Set<string>(BEHAVIORAL_EMAIL_TRIGGERS);

export async function POST(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  let body: { userId?: string; trigger?: string; sourceEventId?: string; occurredAt?: string; purchased?: boolean };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }

  if (!body.userId || !body.sourceEventId || !body.trigger || !allowed.has(body.trigger)) {
    return NextResponse.json({ error: 'INVALID_TRIGGER' }, { status: 400 });
  }
  const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();
  if (Number.isNaN(occurredAt.getTime())) return NextResponse.json({ error: 'INVALID_OCCURRED_AT' }, { status: 400 });

  await connectToDatabase();
  const result = await processBehavioralTrigger({
    userId: body.userId,
    trigger: body.trigger as BehavioralEmailTrigger,
    sourceEventId: body.sourceEventId,
    occurredAt,
    purchased: body.purchased === true,
  });
  return NextResponse.json(result);
}
