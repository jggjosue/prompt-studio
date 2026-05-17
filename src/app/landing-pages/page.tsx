import type { Metadata } from 'next';
import LandingPagesClient from './landing-pages-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Landing Page Prompts | Prompt Studio',
  description:
    'Prompts and live demos for SaaS landing pages — Magzin Job, Loopline, HTML, Tailwind, and Next.js variants.',
  keywords: [
    'landing page prompts',
    'SaaS landing page',
    'Tailwind landing',
    'Next.js landing',
    'Magzin Job',
    'Loopline',
    'HTML CSS landing',
  ],
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
