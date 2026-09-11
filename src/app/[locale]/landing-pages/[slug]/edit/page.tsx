import { LandingPageVisualEditor } from '@/components/landing-page-visual-editor';
import { getCatalogIdByDemoSlug, getRawWebPageByDemoSlug } from '@/lib/web-pages';
import { getServerSubscriptionStatus, hasDownloadPlan } from '@/lib/server-subscription-status';
import { pickLocalized } from '@/lib/localized-string';
import { auth } from '@clerk/nextjs/server';
import { getLocale } from 'next-intl/server';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function LandingPageEdit({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getRawWebPageByDemoSlug(slug);
  const catalogId = getCatalogIdByDemoSlug(slug);
  if (!page || !catalogId) notFound();

  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect_url=${encodeURIComponent(`/landing-pages/${slug}/edit`)}`);
  const status = await getServerSubscriptionStatus();
  const allowed = hasDownloadPlan(status) || status.purchasedPages.includes(catalogId) || Boolean(page.id && status.purchasedPages.includes(page.id));
  if (!allowed) redirect(`/landing-pages/${slug}`);

  const locale = await getLocale();
  return <LandingPageVisualEditor slug={slug} pageId={catalogId} title={pickLocalized(page.title, locale)} description={pickLocalized(page.description, locale)} />;
}
