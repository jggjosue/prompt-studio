import type { Metadata } from 'next';
import { Suspense } from 'react';
import GenerateVideosClient from './generate-videos-client';
import { isPremiumJoAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Generador y editor de videos con IA',
  description: 'Define escena, cámara, movimiento, duración y estilo para generar videos con IA desde un espacio de trabajo visual.',
  alternates: {
    canonical: '/generate-videos',
  },
  keywords: ['generador de videos con IA', 'crear video desde texto', 'editor de prompts de video', 'video cinematográfico con IA'],
};

export default async function PromptEditorPage() {
  const canGenerate = await isPremiumJoAdmin();
  return (
    <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <GenerateVideosClient canGenerate={canGenerate} />
    </Suspense>
  );
}
