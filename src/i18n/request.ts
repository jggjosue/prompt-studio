import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isLocale } from './config';

/**
 * El idioma llega ahora por el segmento de ruta `[locale]`, que el middleware
 * inyecta reescribiendo la petición. Ya no se leen `cookies()` ni `headers()`
 * aquí: hacerlo marcaba cada página como dinámica y bloqueaba el prerender.
 *
 * La detección propiamente dicha vive en `./detect-locale`.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested ?? '') ? requested! : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
