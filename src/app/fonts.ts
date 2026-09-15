import localFont from 'next/font/local';

/**
 * Fuentes servidas desde `src/fonts/`.
 *
 * Antes se cargaban desde `node_modules/next/dist/next-devtools/server/font/`,
 * una ruta interna de las devtools de Next: no forma parte de su API pública y
 * desaparecería en cualquier actualización, rompiendo el build sin aviso claro.
 * Los .woff2 ahora viven en el repo. Mismas fuentes, misma configuración.
 */

export const firaCode = localFont({
  src: '../fonts/geist-mono-latin.woff2',
  variable: '--font-fira-code',
  display: 'swap',
});

export const firaSans = localFont({
  src: '../fonts/geist-latin.woff2',
  variable: '--font-fira-sans',
  display: 'swap',
});
