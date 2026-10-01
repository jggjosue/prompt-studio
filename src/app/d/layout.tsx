import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitio publicado | Prompt Studio',
  description: 'Versión publicada de un sitio creado con el Website Builder.',
  robots: { index: true, follow: true },
};

/**
 * Root layout de la web pública de un dominio personalizado (example.com).
 *
 * Rama separada de la app principal: sin Clerk ni next-intl; solo pinta el sitio
 * publicado.
 */
export default function CustomDomainLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
