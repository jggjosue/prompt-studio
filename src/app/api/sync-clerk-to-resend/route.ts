import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { upsertResendContact } from '@/lib/resend';

export async function GET(request: Request) {
  const syncSecret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get('authorization');
  if (!syncSecret || authorization !== `Bearer ${syncSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let client;
    try {
      client = await clerkClient();
    } catch (e) {
      // Fallback for older @clerk/nextjs versions
      client = (clerkClient as any);
    }

    // Obtenemos hasta 500 usuarios de Clerk (límite por página)
    const { data: users } = await client.users.getUserList({ limit: 500 });

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const user of users) {
      const email =
        user.emailAddresses?.find(
          (address: { id: string; emailAddress: string }) =>
            address.id === user.primaryEmailAddressId
        )?.emailAddress ??
        user.emailAddresses?.[0]?.emailAddress;
      if (!email) continue;

      try {
        const { error } = await upsertResendContact({
          email,
          firstName: user.firstName ?? undefined,
          lastName: user.lastName ?? undefined,
        });

        if (error) {
          errorCount++;
          errors.push(`Error for ${email}: ${error.message}`);
        } else {
          successCount++;
        }
      } catch (err: any) {
        errorCount++;
        errors.push(`Exception for ${email}: ${err.message}`);
      }
    }

    return NextResponse.json({
      message: 'Sync complete (Clerk to Resend)',
      totalFoundInClerk: users.length,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Mostramos solo los primeros 10 errores
    });
  } catch (error: any) {
    console.error('Error syncing Clerk users directly to Resend:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
