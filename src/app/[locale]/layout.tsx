import '@/app/globals.css';
import { firaCode, firaSans } from '@/app/fonts';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { SiteAnalytics } from '@/components/site-analytics';
import { SubscriptionStatusProvider } from '@/components/subscription-status-provider';
import { SavedItemsProvider } from '@/components/saved-items-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { CustomCursorLoader } from '@/components/ui/custom-cursor-loader';
import { Toaster } from '@/components/ui/toaster';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkProviderProps } from '@/lib/clerk-config';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { defaultLocale, isLocale, locales, type Locale } from '@/i18n/config';
import Script from 'next/script';
import { UserSync } from '@/components/user-sync';
import { CookieBanner } from '@/components/cookie-banner';
import { SITE_URL } from '@/lib/site-url';
import { ADSENSE_CLIENT_ID, areAdsEnabled } from '@/lib/ads';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const requestedLocale = (await params).locale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: 'metadata.site' });

  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/' },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      title: 'Prompt Studio',
      statusBarStyle: 'black-translucent',
    },
  };
}

/**
 * Prerenderiza el árbol completo en los dos idiomas. El middleware reescribe
 * `/ruta` → `/{locale}/ruta`, así que estas variantes se sirven desde el edge
 * sin que la URL pública lleve prefijo.
 */
export function generateStaticParams(): Array<{ locale: Locale }> {
  return locales.map(locale => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  // Solo el middleware genera este segmento; una petición directa con un
  // idioma inexistente es un 404, no un fallback silencioso.
  if (!isLocale(locale)) notFound();

  // Habilita el render estático: sin esto, `getMessages()` recurre a las
  // cabeceras de la petición y vuelve a marcar la página como dinámica.
  setRequestLocale(locale);

  const messages = await getMessages();
  const adsEnabled = areAdsEnabled();

  return (
    <html
      lang={locale}
      className={`${firaSans.variable} ${firaCode.variable} dark`}
      suppressHydrationWarning
    >
      {adsEnabled ? (
        <head>
          <meta name="google-adsense-account" content={ADSENSE_CLIENT_ID} />
        </head>
      ) : null}
      <body className={`${firaSans.className} font-body antialiased bg-black`} suppressHydrationWarning>
        <ClerkProvider {...clerkProviderProps}>
          <UserSync />
          {adsEnabled ? (
            <Script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
              crossOrigin="anonymous"
              strategy="afterInteractive"
            />
          ) : null}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-8S22HHJK76"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8S22HHJK76');
          `}
          </Script>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <SubscriptionStatusProvider>
              <SavedItemsProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  forcedTheme="dark"
                  enableSystem={false}
                >
                  {children}
                  <CustomCursorLoader />
                  <Toaster />
                  <SiteAnalytics />
                  <ServiceWorkerRegister />
                  <CookieBanner />
                </ThemeProvider>
              </SavedItemsProvider>
            </SubscriptionStatusProvider>
          </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
