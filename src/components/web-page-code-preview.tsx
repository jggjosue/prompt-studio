import { CodePreviewTabs } from '@/components/code-preview-tabs';
import { getWebPageCodePreview } from '@/lib/web-page-code-preview';
import { getTranslations } from 'next-intl/server';

export async function WebPageCodePreview({ slug }: { slug: string }) {
  const previews = getWebPageCodePreview(slug);
  if (previews.length === 0) return null;
  const t = await getTranslations('landingPages.codePreview');
  return <section aria-labelledby="code-preview-title" className="mt-14 border-t pt-10"><p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{t('eyebrow')}</p><h2 id="code-preview-title" className="mt-2 text-2xl font-bold tracking-tight font-headline">{t('title')}</h2><p className="mb-6 mt-2 max-w-2xl text-muted-foreground">{t('description')}</p><CodePreviewTabs previews={previews} lockedLabel={t.raw('locked')} /></section>;
}
