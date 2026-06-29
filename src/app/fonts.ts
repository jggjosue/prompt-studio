import localFont from 'next/font/local';

// Use local font files shipped with Next.js to avoid external font fetches at build time.
export const firaCode = localFont({
  src: '../../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2',
  variable: '--font-fira-code',
  display: 'swap',
});

export const firaSans = localFont({
  src: '../../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2',
  variable: '--font-fira-sans',
  display: 'swap',
});
