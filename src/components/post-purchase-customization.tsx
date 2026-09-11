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
import Link from 'next/link';
import { useTranslations } from 'next-intl';

type Props = {
  catalogId: string;
  pageId: string;
  slug: string;
  title: string;
};

export function PostPurchaseCustomization({ catalogId, pageId, slug, title }: Props) {
  const t = useTranslations('landingPages.customization');
  const { plan, purchasedPages, ready } = useStripeSubscription();
  const hasAccess = ready && (
    plan === 'premium' ||
    plan === 'startup' ||
    purchasedPages.includes(pageId) ||
    purchasedPages.includes(catalogId)
  );
  if (!hasAccess) return null;

  const editorBase = `/dashboard/landing-editor?page=${encodeURIComponent(catalogId)}`;
  const professionalSubject = encodeURIComponent(`Personalización profesional: ${title}`);
  const professionalBody = encodeURIComponent(`Hola, quiero solicitar una personalización profesional de la plantilla ${title} (${slug}).`);
  const actions = [
    { icon: PencilRuler, title: 'Editar en canvas', description: 'Abre una copia editable de esta landing en el constructor visual.', href: `/landing-pages/${encodeURIComponent(slug)}/edit` },
    { icon: Palette, title: t('themeTitle'), description: t('themeDescription'), href: `${editorBase}&tool=theme` },
    { icon: FileText, title: t('copyTitle'), description: t('copyDescription'), href: `${editorBase}&tool=copy` },
    { icon: WandSparkles, title: t('aiTitle'), description: t('aiDescription'), href: `/generate-webs?template=${encodeURIComponent(slug)}` },
    { icon: Download, title: t('exportTitle'), description: t('exportDescription'), href: `/api/landing-pages/${encodeURIComponent(pageId)}/download` },
    { icon: Headphones, title: t('professionalTitle'), description: t('professionalDescription'), href: `mailto:support@prompstudio.com?subject=${professionalSubject}&body=${professionalBody}` },
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
          const external = action.href.startsWith('mailto:');
          return <article key={action.title} className="flex flex-col rounded-xl border bg-background/80 p-4"><Icon className="mb-3 size-5 text-violet-600" aria-hidden="true" /><h3 className="text-sm font-bold">{action.title}</h3><p className="mb-4 mt-1 flex-1 text-xs leading-5 text-muted-foreground">{action.description}</p><Button asChild variant="outline" size="sm"><Link href={action.href} target={external ? '_blank' : undefined}>{t('open')}</Link></Button></article>;
        })}
      </div>
    </section>
  );
}
