import '@/app/globals.css';
import { firaCode, firaSans } from '@/app/fonts';

/**
 * Raíz única del App Router. Las ramas `[locale]`, `p` y `d` añaden sus
 * proveedores o metadatos específicos, pero ninguna página queda sin layout
 * raíz durante el build de Next/Vercel.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${firaSans.variable} ${firaCode.variable} dark`} suppressHydrationWarning>
      <body className={`${firaSans.className} min-h-screen bg-black font-body antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
