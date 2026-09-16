'use client';

import { Button } from '@/components/ui/button';
import { useStripeSubscription } from '@/hooks/use-stripe-subscription';
import {
  Download,
  PencilRuler,
  FileText,
  Headphones,
  Palette,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

type Props = {
  catalogId: string;
  pageId: string;
  slug: string;
  title: string;
};

export function PostPurchaseCustomization({ catalogId, pageId }: Props) {
  const t = useTranslations('landingPages.customization');
  const { plan, purchasedPages, ready } = useStripeSubscription();
  const hasAccess = ready && (
    plan === 'premium' ||
    plan === 'startup' ||
    purchasedPages.includes(pageId) ||
    purchasedPages.includes(catalogId)
  );
  if (!hasAccess) return null;

  const actions = [
    { icon: PencilRuler, title: 'Editar en canvas', description: 'Abre una copia editable de esta landing en el constructor visual.' },
    { icon: Palette, title: t('themeTitle'), description: t('themeDescription') },
    { icon: FileText, title: t('copyTitle'), description: t('copyDescription') },
    { icon: WandSparkles, title: t('aiTitle'), description: t('aiDescription') },
    { icon: Download, title: t('exportTitle'), description: t('exportDescription') },
    { icon: Headphones, title: t('professionalTitle'), description: t('professionalDescription') },
  ];

  return (
    <section aria-labelledby="customization-title" className="mt-14 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-background to-blue-500/5 p-5 sm:p-7">
      <div className="mb-6 flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white"><Sparkles className="size-5" aria-hidden="true" /></span>
        <div><p className="text-sm font-semibold text-violet-600">{t('eyebrow')}</p><h2 id="customization-title" className="text-2xl font-bold tracking-tight font-headline">{t('title')}</h2><p className="mt-1 text-sm text-muted-foreground">{t('description')}</p></div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map(action => {
          const Icon = action.icon;
          return <article key={action.title} className="flex flex-col rounded-xl border bg-background/80 p-4"><Icon className="mb-3 size-5 text-violet-600" aria-hidden="true" /><h3 className="text-sm font-bold">{action.title}</h3><p className="mb-4 mt-1 flex-1 text-xs leading-5 text-muted-foreground">{action.description}</p><Button type="button" disabled variant="outline" size="sm">{t('open')}</Button></article>;
        })}
      </div>
    </section>
  );
}
