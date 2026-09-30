import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import PageComposerProject from '@/models/PageComposerProject';
import { SubmissionsDashboard } from './submissions-dashboard';

export const metadata: Metadata = {
  title: 'Envíos de formularios | Prompt Studio',
  description: 'Consulta y exporta los envíos de formularios de tu sitio publicado.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/** Dashboard de envíos del sitio (solo el dueño). */
export default async function SiteSubmissionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ project?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { project } = await searchParams;
  if (!project) return null;

  const { userId } = await auth();
  if (!userId) return null;

  const site = await PageComposerProject.findOne({ _id: project, userId }).select('_id name').lean();
  if (!site) notFound();

  return <SubmissionsDashboard siteId={String(site._id)} siteName={site.name} />;
}