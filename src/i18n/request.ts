import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isLocale, LOCALE_COOKIE } from './config';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headersList = await headers();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  let locale = cookieLocale;

  if (!locale || !isLocale(locale)) {
    const acceptLanguage = headersList.get('accept-language') || '';
    const country = (
      headersList.get('x-vercel-ip-country') ||
      headersList.get('x-edge-country') ||
      ''
    ).toUpperCase();

    // Latin American countries (ISO codes) + Spain (ES)
    const latamAndSpain = [
      'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV',
      'GT', 'HN', 'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE', 'ES'
    ];

    const hasSpanishLanguage = acceptLanguage.toLowerCase().includes('es');
    const isLatamOrSpain = latamAndSpain.includes(country);

    if (hasSpanishLanguage || isLatamOrSpain) {
      locale = 'es';
    } else {
      locale = 'en';
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
