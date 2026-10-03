import { requireCronOrAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongoose';
import { upsertResendContact } from '@/lib/resend';
import UserProfile from '@/models/UserProfile';
import { NextResponse } from 'next/server';

async function syncRegisteredUsersToResend(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  try {
    await connectToDatabase();
    const users = await UserProfile.find({
      userId: { $type: 'string' },
      email: { $type: 'string', $ne: '' },
    })
      .select({
        _id: 0,
        email: 1,
        marketingOptIn: 1,
        unsubscribeTimestamp: 1,
        emailSuppressedAt: 1,
        emailSuppressionReason: 1,
        emailDoNotContact: 1,
        emailLocale: 1,
        emailPreferenceTopics: 1,
      })
      .lean();

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const result = await upsertResendContact({
        email: user.email,
        marketingOptIn: user.marketingOptIn,
        unsubscribeTimestamp: user.unsubscribeTimestamp,
        emailSuppressedAt: user.emailSuppressedAt,
        emailSuppressionReason: user.emailSuppressionReason,
        emailDoNotContact: user.emailDoNotContact,
        locale: user.emailLocale,
        topics: user.emailPreferenceTopics,
      });
      if (result.error) errorCount++;
      else successCount++;
    }

    return NextResponse.json({
      message: 'Registered-user Resend reconciliation complete',
      total: users.length,
      successCount,
      errorCount,
    });
  } catch {
    return NextResponse.json({ error: 'RESEND_SYNC_FAILED' }, { status: 500 });
  }
}

// GET remains available for an authenticated cron/admin invocation. The
// dashboard uses POST so a state-changing reconciliation is never triggered by
// link previews, crawlers or browser prefetching.
export const GET = syncRegisteredUsersToResend;
export const POST = syncRegisteredUsersToResend;
