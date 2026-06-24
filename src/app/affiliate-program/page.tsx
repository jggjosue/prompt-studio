import type { Metadata } from 'next';
import AffiliateClient from './affiliate-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';

export const metadata: Metadata = {
  title: 'Affiliate Program | Prompt Studio',
  description:
    'Join the Prompt Studio Affiliate Program. Earn 30% recurring commissions by referring creators to our premium AI prompt and landing page resources.',
  alternates: {
    canonical: '/affiliate-program',
  },
  keywords: [
    'affiliate program',
    'referral program',
    'prompt studio affiliates',
    'earn commissions',
    'SaaS affiliate',
  ],
};

export default function AffiliateProgramPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <AffiliateClient />
      </Suspense>
      <Footer />
    </>
  );
}
