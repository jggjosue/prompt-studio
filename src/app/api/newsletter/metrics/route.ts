import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongoose';
import NewUser from '@/models/NewUser';

export async function GET(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  await connectToDatabase();
  const [signupRequests, confirmations, pending, unsubscribed] = await Promise.all([
    NewUser.countDocuments({ marketingConsentRequestedAt: { $ne: null } }),
    NewUser.countDocuments({ marketingConfirmedAt: { $ne: null } }),
    NewUser.countDocuments({ marketingStatus: 'pending' }),
    NewUser.countDocuments({ marketingStatus: 'unsubscribed' }),
  ]);

  return NextResponse.json({
    signupRequests,
    confirmations,
    pending,
    unsubscribed,
    confirmationConversionRate: signupRequests
      ? Math.round((confirmations / signupRequests) * 10_000) / 100
      : 0,
  });
}
