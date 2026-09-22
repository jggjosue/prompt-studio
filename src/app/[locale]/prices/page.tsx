import type { Metadata } from 'next';
import { Suspense } from 'react';
import PricesClient from './prices-client';

export const metadata: Metadata = {
  title: 'Prices | Prompt Studio',
  description:
    'Choose how you create with AI. Start free and upgrade when you need more AI credits, advanced models and creative tools.',
  alternates: {
    canonical: '/prices',
  },
  openGraph: {
    title: 'Prices | Prompt Studio',
    description:
      'Choose how you create with AI. Start free and upgrade when you need more AI credits, advanced models and creative tools.',
    url: '/prices',
    siteName: 'Prompt Studio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prices | Prompt Studio',
    description:
      'Choose how you create with AI. Start free and upgrade when you need more AI credits, advanced models and creative tools.',
  },
};

export default function PricesPage() {
  return (
    <Suspense fallback={null}>
      <PricesClient />
    </Suspense>
  );
}
