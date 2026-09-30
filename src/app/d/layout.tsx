import type { Metadata } from 'next';
import '@/app/globals.css';
import { firaSans, firaCode } from '@/app/fonts';

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
  return (
    <html lang="es" className={`${firaSans.variable} ${firaCode.variable} dark`} suppressHydrationWarning>
      <body className={`${firaSans.className} min-h-screen bg-background font-body antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}