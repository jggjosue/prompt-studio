import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ChatLayout } from '@/components/chat/chat-layout';
import { InterestPageView } from '@/components/analytics/interest-page-view';

export const metadata: Metadata = {
  title: 'Crear con IA | Prompt Studio',
  description:
    'Crea imágenes, videos y páginas web con inteligencia artificial. Espacio de trabajo conversacional con múltiples modelos: Gemini, GPT-4, Claude y más.',
  robots: { index: false, follow: false },
};

export default async function GeneratePage() {
  return (
    <Suspense>
      <InterestPageView page="/generate" program="ai_generation" />
      <ChatLayout />
    </Suspense>
  );
}
