import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongoose';
import RegisteredUser from '@/models/RegisteredUser';
import UserProfile from '@/models/UserProfile';
import NewUser from '@/models/NewUser';
import { upsertResendContact } from '@/lib/resend';

export async function GET() {
  try {
    await connectToDatabase();
    
    // En versiones recientes de @clerk/nextjs, clerkClient() devuelve una promesa con el cliente.
    // Si tienes una versión anterior, puede ser solo clerkClient directamente.
    let client;
    try {
      client = await clerkClient();
    } catch (e) {
      // Fallback if clerkClient is not an async function in this specific version
      client = (clerkClient as any);
    }
    
    // Obtenemos hasta 500 usuarios (límite de la API para una sola petición)
    const { data: users } = await client.users.getUserList({ limit: 500 });
    
    let totalSynced = 0;
    
    for (const user of users) {
      const email = user.emailAddresses?.[0]?.emailAddress;
      if (!email) continue;
      
      const birthDateRaw =
        user.publicMetadata?.birthDate ??
        user.publicMetadata?.birthday ??
        user.privateMetadata?.birthDate ??
        user.privateMetadata?.birthday ??
        null;
      const birthDate = typeof birthDateRaw === 'string' ? birthDateRaw : null;

      const paypalEmailRaw =
        user.privateMetadata?.affiliatePaypalEmail ??
        user.privateMetadata?.paypalEmail ??
        user.publicMetadata?.paypalEmail ??
        null;
      const paypalEmail = typeof paypalEmailRaw === 'string' ? paypalEmailRaw : null;
      
      // Sincronizar en RegisteredUser
      await RegisteredUser.updateOne(
        { email },
        { $setOnInsert: { email } },
        { upsert: true }
      );
      
      // Sincronizar en UserProfile
      await UserProfile.findOneAndUpdate(
        { userId: user.id },
        {
          $set: {
            userId: user.id,
            email,
            birthDate,
            paypalEmail,
            lastUpdatedAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Sincronizar en NewUser (usado por /api/sync-resend)
      await NewUser.updateOne(
        { email },
        { $setOnInsert: { email, createdAt: new Date(user.createdAt) } },
        { upsert: true }
      );
      
      // Sincronizar en Resend
      await upsertResendContact({
        email,
        firstName: user.firstName ?? undefined,
        lastName: user.lastName ?? undefined,
      }).catch(error => {
        console.error(`Failed to sync Clerk user ${email} to Resend:`, error);
      });
      
      totalSynced++;
    }
    
    return NextResponse.json({ success: true, message: 'Sync complete', totalSynced, totalFoundInClerk: users.length });
  } catch (error: any) {
    console.error('Error syncing Clerk users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
