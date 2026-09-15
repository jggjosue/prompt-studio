import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LandingEditorClient } from './landing-editor-client';

export const metadata: Metadata = {
  title: 'Editor de landing pages | Prompt Studio',
  description:
    'Edita copy de landing pages con análisis de legibilidad en vivo y guarda métricas al publicar.',
};

export default function LandingEditorPage() {
  return (
    <Suspense fallback={null}>
      <LandingEditorClient />
    </Suspense>
  );
}
