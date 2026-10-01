import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import { Resend } from 'resend';
import connectToDatabase from '@/lib/mongoose';
import NewUser from '@/models/NewUser';
import { resendUnsubscribedState } from '@/lib/email-suppression';

export async function GET(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  
  try {
    await connectToDatabase();
    // Include suppressed/unsubscribed records so provider state is reconciled;
    // re-import must never turn them back into subscribed contacts.
    const users = await NewUser.find({ email: { $exists: true, $ne: '' } });
    
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      if (!user.email) continue;
      
      const { error } = await resend.contacts.create({
        email: user.email,
        unsubscribed: user.marketingStatus !== 'confirmed' || resendUnsubscribedState(user),
      });

      if (error) {
        errorCount++;
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      message: 'Sync complete',
      total: users.length,
      successCount,
      errorCount,
    });
  } catch {
    return NextResponse.json({ error: 'RESEND_SYNC_FAILED' }, { status: 500 });
  }
}
