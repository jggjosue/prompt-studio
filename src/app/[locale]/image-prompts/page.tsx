import type { Metadata } from 'next';
import ImagePromptsClient from './image-prompts-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { RelatedInternalLinks } from '@/components/related-internal-links';

export const metadata: Metadata = {
  title: 'Prompts para generar imágenes con IA',
  description: 'Explora prompts de imagen con ejemplos visuales para retratos, producto, moda y escenas creativas; personalízalos y llévalos al generador.',
  alternates: {
    canonical: '/image-prompts',
  },
  keywords: ['prompts para imágenes IA', 'prompts de fotografía de producto', 'prompts para retratos IA', 'ejemplos de imágenes generadas con IA'],
};

export default function ImagePromptsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ImagePromptsClient />
      <RelatedInternalLinks className="mx-auto mb-12 max-w-4xl" />
    </Suspense>
  );
}
