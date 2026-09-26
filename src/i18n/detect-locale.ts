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
 * Orden de preferencia: `defaultLocale` → cookie explícita del usuario →
 * idioma del navegador → país detectado en el edge.
 *
 * El `defaultLocale` siempre gana al iniciar, así la app comienza en inglés
 * aunque el usuario haya cambiado a español en una sesión anterior (la cookie
 * se ignora hasta que el usuario selecciona activamente el idioma).
 *
 * Si el usuario quiere español, debe usar el LanguageToggle en el footer,
 * que establece la cookie y recarga la página.
 */
export function detectLocale(headers: Headers): Locale {
  // 1. Default locale: la app siempre inicia en inglés por defecto
  //    A menos que el usuario haya guardado una preferencia en cookie.
  const fromDefault = defaultLocale;

  // 2. Cookie explícita del usuario (solo si ya fue establecido previamente)
  //    Si el usuario cambió de idioma antes, respetamos su elección.
  const fromCookie = localeFromCookieHeader(headers.get('cookie'));

  // 3. Idioma del navegador (accept-language) — solo si no hay cookie
  const acceptLanguage = (headers.get('accept-language') || '').toLowerCase();

  // 4. País detectado en el edge — solo si no hay cookie
  const country = (
    headers.get('x-vercel-ip-country') ||
    headers.get('x-edge-country') ||
    ''
  ).toUpperCase();

  // Si el usuario tenía guardada una preferencia de idioma en cookie, usarla
  if (fromCookie) return fromCookie;

  // Por defecto: inglés (defaultLocale), ignorando el idioma del navegador
  // el usuario puede cambiar a español usando el LanguageToggle en el footer
  return fromDefault;
}
