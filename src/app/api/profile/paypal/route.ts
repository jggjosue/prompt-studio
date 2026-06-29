import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import AffiliatePayoutAccount from '@/models/AffiliatePayoutAccount';

function isValidEmail(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { paypalEmail?: unknown } | null;
  const paypalEmail = typeof body?.paypalEmail === 'string' ? body.paypalEmail.trim() : '';

  if (!isValidEmail(paypalEmail)) {
    return NextResponse.json({ error: 'Ingresa un correo de PayPal válido.' }, { status: 400 });
  }

  try {
    await connectToDatabase();
    const payoutAccount = await AffiliatePayoutAccount.findOneAndUpdate(
      { clerkUserId: userId },
      {
        $set: {
          clerkUserId: userId,
          email: paypalEmail.toLowerCase(),
          method: 'paypal',
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after', runValidators: true }
    ).lean<{ email: string }>();

    return NextResponse.json({
      ok: true,
      paypalEmail: payoutAccount?.email ?? paypalEmail.toLowerCase(),
    });
  } catch (error) {
    console.error('Failed to store PayPal email in Mongo:', error);
    return NextResponse.json(
      { error: 'No se pudo guardar el correo de PayPal. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
