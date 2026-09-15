import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { syncAffiliateDashboardStats, type AffiliateDashboardStats } from '@/lib/affiliate-mongo';
import connectToDatabase from '@/lib/mongoose';
import AffiliateApplication from '@/models/AffiliateApplication';
import AffiliatePayoutAccount from '@/models/AffiliatePayoutAccount';
import { getSiteUrl } from '@/lib/site-url';
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
  const premiumJoEmail = process.env.PROMPT_STUDIO_PREMIUM_JO?.trim() ?? '';
  const userEmail = user?.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ?? '';
  const isPremiumJo = Boolean(premiumJoEmail) && userEmail === premiumJoEmail.toLowerCase();
  const emptyAffiliate: AffiliateDashboardStats = {
    clerkUserId: userId,
    referralCode: meta.affiliateReferralCode ?? user?.id ?? '',
    totalRevenueCents: 0,
    paidRevenueCents: 0,
    availablePayoutCents: 0,
    canRequestManualPayout: false,
    clicks: 0,
    salesRegistered: 0,
    conversionRate: 0,
    productClicks: [],
    commissions: [],
    history: [],
  };

  let payoutAccount: { email?: string | null } | null = null;
  let affiliate: AffiliateDashboardStats = emptyAffiliate;
  let hasApprovedAffiliateApplication = false;
  let hasPendingAffiliateApplication = false;
  let pendingAffiliateApplicationsCount = 0;

  try {
    await connectToDatabase();
    payoutAccount = await AffiliatePayoutAccount.findOne({ clerkUserId: userId }).lean<{ email?: string | null }>();
    if (userEmail) {
      const approvedApplication = await AffiliateApplication.findOne({
        email: userEmail,
        status: 'approved',
      }).lean<{ _id: unknown } | null>();
      hasApprovedAffiliateApplication = Boolean(approvedApplication);
      if (!hasApprovedAffiliateApplication) {
        hasPendingAffiliateApplication = Boolean(
          await AffiliateApplication.findOne({
            email: userEmail,
            status: { $in: ['pending', 'reviewed'] },
          }).lean<{ _id: unknown } | null>()
        );
      }
      pendingAffiliateApplicationsCount = await AffiliateApplication.countDocuments({ status: 'pending' });
    }
    affiliate = await syncAffiliateDashboardStats(userId, meta.affiliateReferralCode ?? user?.id ?? '');
  } catch (error) {
    console.error('Profile page Mongo fallback:', error);
  }

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
      isPremiumJo={isPremiumJo}
      hasApprovedAffiliateApplication={hasApprovedAffiliateApplication}
      hasPendingAffiliateApplication={hasPendingAffiliateApplication}
      pendingAffiliateApplicationsCount={pendingAffiliateApplicationsCount}
      affiliate={affiliate}
      affiliatePaypalEmail={payoutAccount?.email ?? meta.affiliatePaypalEmail ?? null}
      siteUrl={getSiteUrl()}
    />
  );
}
