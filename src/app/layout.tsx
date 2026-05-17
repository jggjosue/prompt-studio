import { ClerkProvider } from '@clerk/nextjs';
import { SiteAnalytics } from '@/components/site-analytics';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prompt Studio',
  description: 'AI-powered image and video generation platform',
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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-7082864972330769" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7082864972330769"crossorigin="anonymous"></script>
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <ClerkProvider>
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
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <SiteAnalytics />
          </ThemeProvider>
        </NextIntlClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

    