'use server';

import connectToDatabase from '@/lib/mongoose';
import { CookieConsent } from '@/models/CookieConsent';
import { currentUser } from '@clerk/nextjs/server';

export async function saveCookieConsent(privacyVersion: string, termsVersion: string) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, reason: 'Not logged in' };
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
      return { success: false, reason: 'No email found' };
    }

    await connectToDatabase();

    await CookieConsent.findOneAndUpdate(
      { clerkUserId: user.id },
      {
        email,
        clerkUserId: user.id,
        privacyPolicyVersion: privacyVersion,
        termsOfServiceVersion: termsVersion,
        acceptedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return { success: true };
  } catch (error) {
    console.error('Error saving cookie consent:', error);
    return { success: false, reason: 'Internal server error' };
  }
}
