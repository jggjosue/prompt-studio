import type { Metadata } from 'next';
import ImagePromptsClient from './image-prompts-client';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { RelatedInternalLinks } from '@/components/related-internal-links';
import { getTranslations } from 'next-intl/server';
import { defaultLocale, isLocale } from '@/i18n/config';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const requestedLocale = (await params).locale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const t = await getTranslations({ locale, namespace: 'metadata.imagePrompts' });
  return { title: t('title'), description: t('description'), alternates: { canonical: '/image-prompts' } };
}

export default function ImagePromptsPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ImagePromptsClient />
      <RelatedInternalLinks className="mx-auto mb-12 max-w-4xl" />
    </Suspense>
  );
}
