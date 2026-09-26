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
 * Orden de preferencia: cookie explícita del usuario → `defaultLocale`.
 *
 * Todos los visitantes empiezan en inglés, sin importar su país o el idioma
 * configurado en el navegador. Solo una elección explícita en el selector del
 * footer puede cambiar la experiencia a español.
 */
export function detectLocale(headers: Headers): Locale {
  const fromCookie = localeFromCookieHeader(headers.get('cookie'));
  return fromCookie ?? defaultLocale;
}
