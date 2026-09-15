import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from './config.ts';

/**
 * Resolución del idioma a partir de la petición.
 *
 * Antes vivía en `i18n/request.ts` y se ejecutaba durante el render, llamando a
 * `cookies()` y `headers()`. Eso marcaba las 121 rutas de la app como dinámicas
 * e impedía cachear nada en el edge.
 *
 * Ahora corre una sola vez en el middleware, que reescribe internamente la
 * petición hacia `/{locale}{ruta}`. Las páginas reciben el idioma como
 * parámetro de ruta y pueden prerenderizarse; la URL pública no cambia.
 *
 * Sin dependencias de `next/headers`: recibe una `Headers` normal, así que se
 * puede probar sin levantar un servidor.
 */

/** Países hispanohablantes de Latinoamérica más España. */
const SPANISH_SPEAKING_COUNTRIES = new Set([
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV',
  'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE', 'ES',
]);

/**
 * Lee la cookie de idioma de la cabecera `cookie` sin depender de `next/headers`.
 */
export function localeFromCookieHeader(cookieHeader: string | null): Locale | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === LOCALE_COOKIE) {
      // Una cookie puede llegar truncada o con escapes inválidos. El detector
      // corre dentro del middleware: dejar que `decodeURIComponent` lance aquí
      // convierte una preferencia de idioma rota en un 500 para toda la página.
      try {
        const value = decodeURIComponent(rest.join('='));
        return isLocale(value) ? value : null;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Orden de preferencia: cookie explícita del usuario → idioma del navegador →
 * país detectado en el edge → `defaultLocale`.
 *
 * La cookie manda siempre: si alguien la fijó con el selector de idioma, no se
 * le debe contradecir por su IP o su `accept-language`.
 */
export function detectLocale(headers: Headers): Locale {
  const fromCookie = localeFromCookieHeader(headers.get('cookie'));
  if (fromCookie) return fromCookie;

  const acceptLanguage = (headers.get('accept-language') || '').toLowerCase();
  if (acceptLanguage.includes('es')) return 'es';

  const country = (
    headers.get('x-vercel-ip-country') ||
    headers.get('x-edge-country') ||
    ''
  ).toUpperCase();
  if (SPANISH_SPEAKING_COUNTRIES.has(country)) return 'es';

  return defaultLocale;
}
