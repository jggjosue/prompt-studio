import { NextResponse } from 'next/server';
import { requireCronOrAdmin } from '@/lib/api-auth';
import { clerkClient } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongoose';
import RegisteredUser from '@/models/RegisteredUser';
import UserProfile from '@/models/UserProfile';
import NewUser from '@/models/NewUser';

export async function GET(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  try {
    await connectToDatabase();
    
    // En versiones recientes de @clerk/nextjs, clerkClient() devuelve una promesa con el cliente.
    // Si tienes una versión anterior, puede ser solo clerkClient directamente.
    let client;
    try {
      client = await clerkClient();
    } catch (_e) {
      // Fallback if clerkClient is not an async function in this specific version
      client = (clerkClient as any);
    }
    
    // Obtenemos hasta 500 usuarios (límite de la API para una sola petición)
    const { data: users } = await client.users.getUserList({ limit: 500 });
    
    let usersAdded = 0;
    let usersAlreadyRegistered = 0;
    
    for (const user of users) {
      const email =
        user.emailAddresses?.find(
          (address: { id: string; emailAddress: string }) =>
            address.id === user.primaryEmailAddressId
        )?.emailAddress ??
        user.emailAddresses?.[0]?.emailAddress;
      if (!email) continue;

      const alreadyRegistered = await RegisteredUser.exists({ email });
      if (alreadyRegistered) {
        usersAlreadyRegistered++;
        continue;
      }
      
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
      const registeredUserResult = await RegisteredUser.updateOne(
        { email },
        { $setOnInsert: { email } },
        { upsert: true }
      );
      if (registeredUserResult.upsertedCount === 0) {
        // Otro proceso registró el correo mientras esta sincronización corría.
        usersAlreadyRegistered++;
        continue;
      }
      
      // Solo crear el perfil cuando no exista. Esta sincronización nunca debe
      // sobrescribir ni eliminar información de usuarios ya registrados.
      await UserProfile.updateOne(
        { userId: user.id },
        {
          $setOnInsert: {
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
      }).catch(() => {
        console.error('Failed to sync Clerk user to Resend');
      });
      
      usersAdded++;
    }
    
    return NextResponse.json({
      success: true,
      message: 'Additive sync complete',
      usersAdded,
      usersAlreadyRegistered,
      totalFoundInClerk: users.length,
    });
  } catch (error: any) {
    console.error('Error syncing Clerk users:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
