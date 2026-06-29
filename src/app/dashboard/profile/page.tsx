import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { syncAffiliateDashboardStats } from '@/lib/affiliate-mongo';
import connectToDatabase from '@/lib/mongoose';
import AffiliatePayoutAccount from '@/models/AffiliatePayoutAccount';
import ProfileClient from './profile-client';

export default async function ProfilePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await currentUser();
  const client = await clerkClient();
  const clerkUser = user?.id ? await client.users.getUser(user.id) : null;
  const meta = (clerkUser?.privateMetadata ?? {}) as {
    affiliateReferralCode?: string;
    affiliatePaypalEmail?: string | null;
  };
  await connectToDatabase();
  const payoutAccount = await AffiliatePayoutAccount.findOne({ clerkUserId: userId }).lean<{ email?: string | null }>();
  const affiliate = await syncAffiliateDashboardStats(userId, meta.affiliateReferralCode ?? user?.id ?? '');

  return (
    <ProfileClient
      user={{
        id: user?.id ?? '',
        email: user?.primaryEmailAddress?.emailAddress ?? '',
        givenName: user?.firstName ?? '',
        familyName: user?.lastName ?? '',
        picture: user?.imageUrl ?? null,
        fullName:
          [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
          user?.primaryEmailAddress?.emailAddress ||
          'Miembro',
      }}
      affiliate={affiliate}
      affiliatePaypalEmail={payoutAccount?.email ?? meta.affiliatePaypalEmail ?? null}
    />
  );
}
