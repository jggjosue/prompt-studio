import type { Metadata } from 'next';
import { Suspense } from 'react';
import GenerateWebsClient from './generate-webs-client';
import { auth } from '@clerk/nextjs/server';
import { getServerSubscriptionStatus, hasDownloadPlan } from '@/lib/server-subscription-status';
import { isPremiumJoAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Generador de landing pages con IA',
  description: 'Convierte requisitos de negocio en una landing page, previsualiza el resultado y obtén el código HTML desde un editor asistido por IA.',
  alternates: {
    canonical: '/generate-webs',
  },
  keywords: ['generador de landing pages con IA', 'crear página web con IA', 'generar HTML con IA', 'editor de landing pages'],
};

export default async function PromptEditorPage() {
  const canGenerateWebs = await isPremiumJoAdmin();
  
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <GenerateWebsClient canGenerateWebs={canGenerateWebs} />
    </Suspense>
  );
}
