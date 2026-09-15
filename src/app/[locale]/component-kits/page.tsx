import type { Metadata } from 'next';
import ComponentKitsClient from './component-kits-client';

export const metadata: Metadata = {
  title: 'Kits completos de componentes | Prompt Studio',
  description: 'Colecciones coherentes de navegación, sidebars, cards, botones, formularios y prompts para productos digitales.',
  alternates: { canonical: '/component-kits' },
};

export default function ComponentKitsPage() { return <ComponentKitsClient />; }
