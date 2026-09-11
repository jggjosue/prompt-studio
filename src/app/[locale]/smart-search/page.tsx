import type { Metadata } from 'next';
import { FreeToolCta } from '@/components/free-tool-cta';
import SmartSearchClient from './smart-search-client';

export const metadata: Metadata = {
  title: 'Buscador inteligente de componentes | Prompt Studio',
  description: 'Encuentra páginas y componentes por industria, estilo, objetivo, framework, color, mercado y presupuesto usando lenguaje natural.',
  alternates: { canonical: '/smart-search' },
};

export default function SmartSearchPage() {
  return <><SmartSearchClient /><FreeToolCta variant="landings" /></>;
}
