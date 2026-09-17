import type { Metadata } from 'next';
import { Suspense } from 'react';
import PromptEditorClient from './prompt-editor-client';
import { isPremiumJoAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Generador de imágenes con IA',
  description: 'Personaliza un prompt, configura estilo, iluminación y formato, previsualiza el resultado y genera imágenes con el proveedor que prefieras.',
  alternates: {
    canonical: '/generate-images',
  },
  keywords: ['generador de imágenes con IA', 'crear imágenes desde texto', 'editor de prompts de imagen', 'generar fotografía de producto con IA'],
};

export default async function PromptEditorPage() {
    const canGenerate = await isPremiumJoAdmin();
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PromptEditorClient canGenerate={canGenerate} />
        </Suspense>
    )
}
