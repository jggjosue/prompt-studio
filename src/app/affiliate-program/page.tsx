import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import AffiliateLoader from './affiliate-loader';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('affiliate');
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
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
}

export default async function AffiliateProgramPage() {
  const locale = await getLocale();
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1">
        <AffiliateLoader locale={locale} />
      </main>
      <Footer />
    </div>
  );
}

