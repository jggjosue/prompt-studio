import { requireCronOrAdmin } from '@/lib/api-auth';
import { scheduleCheckoutRecovery } from '@/lib/checkout-recovery-service';
import connectToDatabase from '@/lib/mongoose';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;
  let body: { userId?: string; email?: string; checkoutId?: string; productId?: string; planId?: string; beginCheckoutAt?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 }); }
  if (!body.userId || !body.email || !body.checkoutId || !body.productId) return NextResponse.json({ error: 'INVALID_CHECKOUT' }, { status: 400 });
  const beginCheckoutAt = body.beginCheckoutAt ? new Date(body.beginCheckoutAt) : new Date();
  if (Number.isNaN(beginCheckoutAt.getTime())) return NextResponse.json({ error: 'INVALID_BEGIN_CHECKOUT_AT' }, { status: 400 });
  await connectToDatabase();
  const recovery = await scheduleCheckoutRecovery({ userId: body.userId, email: body.email, checkoutId: body.checkoutId, productId: body.productId, planId: body.planId ?? null, beginCheckoutAt });
  return NextResponse.json({ scheduled: Boolean(recovery), checkoutId: body.checkoutId });
}
