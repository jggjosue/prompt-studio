import { Fira_Code, Fira_Sans } from 'next/font/google';

/** Fuentes auto-hospedadas en el build → servidas desde el POP Anycast de Vercel */
export const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
  preload: true,
});

export const firaSans = Fira_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-sans',
  display: 'swap',
  preload: true,
});
