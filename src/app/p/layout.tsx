import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sitio publicado | Prompt Studio',
  description: 'Versión publicada de un sitio creado con el Website Builder.',
  robots: { index: true, follow: true },
};

/**
 * Root layout de la web pública de un tenant (customer.prompstudio.com).
 *
 * Es una rama separada de la app principal: no lleva Clerk ni next-intl; solo
 * pinta el sitio publicado (que trae su propio navbar/footer en el PageSchema).
 */
export default function TenantSiteLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background">{children}</div>;
}
