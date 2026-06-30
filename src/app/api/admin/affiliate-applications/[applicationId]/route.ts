import { NextResponse } from 'next/server';
import { isPremiumJoAdmin } from '@/lib/admin-auth';
import connectToDatabase from '@/lib/mongoose';
import AffiliateApplication from '@/models/AffiliateApplication';

const VALID_STATUSES = new Set(['pending', 'reviewed', 'approved', 'rejected'] as const);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  if (!(await isPremiumJoAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { applicationId } = await params;
  const body = (await request.json().catch(() => null)) as { status?: unknown } | null;
  const status = typeof body?.status === 'string' ? body.status.trim() : '';

  if (!VALID_STATUSES.has(status as (typeof VALID_STATUSES extends Set<infer T> ? T : never))) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  await connectToDatabase();
  const application = await AffiliateApplication.findByIdAndUpdate(
    applicationId,
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after', runValidators: true }
  ).lean();

  if (!application) {
    return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    applicationId,
    status: application.status,
  });
}
