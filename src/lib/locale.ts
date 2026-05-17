import { LOCALE_COOKIE, type Locale } from '@/i18n/config';

const MAX_AGE = 60 * 60 * 24 * 365;

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${MAX_AGE};SameSite=Lax`;
}
