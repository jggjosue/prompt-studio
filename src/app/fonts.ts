import { Inter, Space_Grotesk } from 'next/font/google';

/** Fuentes auto-hospedadas en el build → servidas desde el POP Anycast de Vercel (sin round-trip a Google Fonts). */
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
  preload: true,
});
