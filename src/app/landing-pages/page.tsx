import type { Metadata } from 'next';
import LandingPagesClient from './landing-pages-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Landing Page Prompts | Prompt Studio',
  description:
    'Prompts and live demos for SaaS landing pages — Magzin Job, Loopline, HTML, Tailwind, and Next.js variants.',
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
    title: 'Landing Page Prompts | Prompt Studio',
    description:
      'Prompts and live demos for SaaS landing pages — Magzin Job, Loopline, HTML, Tailwind, and Next.js variants.',
    url: '/landing-pages',
    siteName: 'Prompt Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Landing Page Prompts | Prompt Studio',
    description:
      'Prompts and live demos for SaaS landing pages — Magzin Job, Loopline, HTML, Tailwind, and Next.js variants.',
  },
};

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
