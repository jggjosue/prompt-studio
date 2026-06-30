import type { Metadata } from 'next';
import LandingPagesClient from './landing-pages-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('landingPages');
  const title = `${t('title')} | Prompt Studio`;
  const description = t('subtitle');

  return {
    title,
    description,
    alternates: {
      canonical: '/landing-pages',
    },
    keywords: [
      'landing page prompts',
      'SaaS landing page',
      'Tailwind landing',
      'Next.js landing',
      'Magzin Job',
      'Loopline',
      'HTML CSS landing',
    ],
    openGraph: {
      title,
      description,
      url: '/landing-pages',
      siteName: 'Prompt Studio',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default function LandingPagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LandingPagesClient />
    </Suspense>
  );
}
