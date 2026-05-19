import '@/app/globals.css';
import { inter, spaceGrotesk } from '@/app/fonts';
import { ServiceWorkerRegister } from '@/components/service-worker-register';
import { SiteAnalytics } from '@/components/site-analytics';
import { SubscriptionStatusProvider } from '@/components/subscription-status-provider';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkProviderProps } from '@/lib/clerk-config';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Prompt Studio',
  description: 'AI-powered image and video generation platform',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Prompt Studio',
    statusBarStyle: 'black-translucent',
  },
  keywords: [
    'Chatgpt',
    'chatgpt go bbva',
    'how to use chatgpt effectively',
    'chatgpt health',
    'chatgpt search',
    'chatgpt go',
    'AI Prompts',
    'Video Prompts',
    'Image Prompts',
    'AI Video Generator',
    'AI Image Generator',
    'chatgpt 5.2',
    'chatgpt christmas photo',
    'chatgpt 5.1',
    'chatgpt wrapped',
    'chatgpt adult mode',
    'how to cancel chatgpt plus subscription',
    'challenges cloudflare chatgpt',
    'chatgpt news',
    'notebooklm',
    'grok ai',
    'banana pro',
    'nano banana pro',
    'prompts',
    'prompt studio',
    'promptstudio',
    'promt studio',
    'promp studio',
    'prompt studios',
    'promptstudyo',
    'prompt models studio',
    'my prompt studio',
    'prompts studio',
    'prompt studio photo',
    'prompt studio fivem',
    'ai prompt studio',
    'promptoo studio',
    'studio prompt',
    'prompt-studio',
    'for prompt studio',
    'prompay studio',
    'contemplative audiovisual prompt',
    'promt studios',
    'prom studio',
    'prompt model studio',
    'prompt studio ai',
    'sakura prompt',
    'promptmodels studio',
    'the prompt studio',
    '프롬프트 스튜디오',
    'prompt.studio',
    '"contemplative audiovisual prompt"',
    'studio prompt generator',
    'chat gpt prompts for christmas pictures',
    'voice mail prompts',
    'christmas ai photo prompts',
    'darlink ai',
    'voicemail prompts crossword',
    'best grok spicy prompts',
    'grok prompts for images',
    'daily writing prompts',
    'awesome chatgpt prompts',
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google-adsense-account" content="ca-pub-7082864972330769" />
      </head>
      <body className={`${inter.className} font-body antialiased`} suppressHydrationWarning>
        <ClerkProvider {...clerkProviderProps}>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7082864972330769"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <SiteAnalytics />
            <ServiceWorkerRegister />
          </ThemeProvider>
          </SubscriptionStatusProvider>
        </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

    