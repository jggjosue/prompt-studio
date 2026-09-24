import { requireCronOrAdmin } from '@/lib/api-auth';
import connectToDatabase from '@/lib/mongoose';
import { resend } from '@/lib/resend';
import { NextResponse } from 'next/server';

const DATABASE_NAME = 'prompt-studio';
const COLLECTION_NAME = 'user_profiles';

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function GET(request: Request) {
  const denied = await requireCronOrAdmin(request);
  if (denied) return denied;

  try {
    const configuredAudienceId =
      process.env.RESEND_AUDIENCE_ID?.trim() || undefined;
    let audienceId = configuredAudienceId;
    let usedAudienceFallback = false;

    if (audienceId) {
      const { error } = await resend.audiences.get(audienceId);
      if (error) {
        usedAudienceFallback = true;
        audienceId = undefined;
      }
    }

    const mongoose = await connectToDatabase();
    const database = mongoose.connection.useDb(DATABASE_NAME);
    const registeredUsers = (await database
      .collection(COLLECTION_NAME)
      .find({
        email: { $type: 'string', $ne: '' },
        marketingStatus: 'confirmed',
      })
      .project({ _id: 0, email: 1 })
      .toArray()) as Array<{ email: string }>;

    // Cargar la audiencia completa para no modificar contactos existentes.
    const resendEmails = new Set<string>();
    let after: string | undefined;
    do {
      const { data, error } = await resend.contacts.list({
        limit: 100,
        ...(audienceId ? { audienceId } : {}),
        ...(after ? { after } : {}),
      });
      if (error) throw new Error(error.message);

      const contacts = data?.data ?? [];
      for (const contact of contacts) {
        if (contact.email) resendEmails.add(normalizeEmail(contact.email));
      }

      after =
        data?.has_more && contacts.length > 0
          ? contacts[contacts.length - 1].id
          : undefined;
    } while (after);

    let addedCount = 0;
    let alreadyRegisteredCount = 0;
    let errorCount = 0;

    for (const user of registeredUsers) {
      const email = normalizeEmail(user.email);
      if (!email) continue;

      if (resendEmails.has(email)) {
        alreadyRegisteredCount++;
        continue;
      }

      try {
        const { error } = await resend.contacts.create({
          email,
          unsubscribed: false,
          ...(audienceId ? { audienceId } : {}),
        });

        if (error) {
          // Una ejecución simultánea puede crear el contacto entre el listado
          // y esta operación. En ese caso se conserva y se contabiliza.
          const isDuplicate =
            error.message?.toLowerCase().includes('exist') ||
            error.name === 'validation_error';
          if (isDuplicate) {
            alreadyRegisteredCount++;
          } else {
            errorCount++;
          }
        } else {
          resendEmails.add(email);
          addedCount++;
        }
      } catch {
        errorCount++;
      }
    }

    return NextResponse.json({
      message: 'Additive sync complete (prompt-studio.user_profiles to Resend)',
      database: DATABASE_NAME,
      collection: COLLECTION_NAME,
      destination: audienceId ? 'audience' : 'global_contacts',
      usedAudienceFallback,
      totalFoundInDatabase: registeredUsers.length,
      addedCount,
      alreadyRegisteredCount,
      errorCount,
    });
  } catch {
    console.error('Resend contact synchronization failed');
    return NextResponse.json({ error: 'RESEND_SYNC_FAILED' }, { status: 500 });
  }
}
