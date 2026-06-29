import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getWebPages } from '@/lib/web-pages';
import { loadAffiliateDashboardStats } from '@/lib/affiliate-mongo';
import { clerkClient } from '@clerk/nextjs/server';
import { CampaignsClient } from './campaigns-client';

export default async function DashboardCampaignsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const products = getWebPages('en').filter(page => page.membership !== 'free');
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = (user.privateMetadata ?? {}) as { affiliateReferralCode?: string };
  const affiliate = await loadAffiliateDashboardStats(userId, meta.affiliateReferralCode ?? userId);

  return <CampaignsClient products={products} affiliate={affiliate} />;
}
