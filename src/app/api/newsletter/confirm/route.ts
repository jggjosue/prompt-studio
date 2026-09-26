import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import { newsletterTokenHash } from '@/lib/newsletter-confirmation';
import { getSiteUrl } from '@/lib/site-url';
import NewUser from '@/models/NewUser';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = newsletterTokenHash(url.searchParams.get('token') ?? '');
  const locale = url.searchParams.get('locale') === 'en' ? 'en' : 'es';
  const redirect = new URL(`/${locale}?newsletter=invalid`, getSiteUrl());
  if (!tokenHash) return NextResponse.redirect(redirect, 303);

  await connectToDatabase();
  const subscriber = await NewUser.findOneAndUpdate(
    {
      marketingStatus: 'pending',
      marketingConfirmationTokenHash: tokenHash,
      marketingConfirmationExpiresAt: { $gt: new Date() },
    },
    {
      $set: { marketingStatus: 'confirmed', marketingConfirmedAt: new Date() },
      $unset: { marketingConfirmationTokenHash: 1, marketingConfirmationExpiresAt: 1 },
    },
    { returnDocument: 'after' }
  ).lean();

  if (!subscriber) return NextResponse.redirect(redirect, 303);

  redirect.searchParams.set('newsletter', 'confirmed');
  return NextResponse.redirect(redirect, 303);
}
