import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import { Resend } from 'resend';
import connectToDatabase from '@/lib/mongoose';
import NewUser from '@/models/NewUser';

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
    const users = await NewUser.find({ marketingStatus: 'confirmed' });
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      if (!user.email) continue;
      
      const { error } = await resend.contacts.create({
        email: user.email,
        unsubscribed: false,
      });

      if (error) {
        errorCount++;
        errors.push(`Error for ${user.email}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    return NextResponse.json({
      message: 'Sync complete',
      total: users.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // only return first 10 errors
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
