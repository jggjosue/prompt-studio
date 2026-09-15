import type { Metadata } from 'next';
import TextComponentsClient from './text-components-client';

export const metadata: Metadata = {
  title: 'Componentes de Texto | Prompt Studio',
  description: 'Explora 50 composiciones tipográficas y copia prompts profesionales para React y Next.js.',
  alternates: { canonical: '/text-components' },
};

export default function TextComponentsPage() {
  return <TextComponentsClient />;
}
