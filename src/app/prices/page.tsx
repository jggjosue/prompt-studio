import type { Metadata } from 'next';
import { Suspense } from 'react';
import PricesClient from './prices-client';

export const metadata: Metadata = {
  title: 'Prices | Prompt Studio',
  description:
    'Compare Free, Premium, and Developer plans. Download free prompts, unlock Premium content, or get full project source code and install guides.',
  alternates: {
    canonical: '/prices',
  },
  openGraph: {
    title: 'Prices | Prompt Studio',
    description:
      'Compare Free, Premium, and Developer plans. Download free prompts, unlock Premium content, or get full project source code and install guides.',
    url: '/prices',
    siteName: 'Prompt Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prices | Prompt Studio',
    description:
      'Compare Free, Premium, and Developer plans. Download free prompts, unlock Premium content, or get full project source code and install guides.',
  },
};

export default function PricesPage() {
  return (
    <Suspense fallback={null}>
      <PricesClient />
    </Suspense>
  );
}
