import type { Metadata } from 'next';
import HeaderComponentsClient from './header-components-client';

export const metadata: Metadata = {
  title: 'Componentes de Header | Prompt Studio',
  description: 'Explora 50 headers responsive, visualiza sus menús y copia prompts profesionales para React y Next.js.',
  alternates: { canonical: '/header-components' },
};

export default function HeaderComponentsPage() {
  return <HeaderComponentsClient />;
}
