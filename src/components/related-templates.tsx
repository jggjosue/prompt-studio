import { OptimizedImage } from '@/components/optimized-image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { pickLocalized } from '@/lib/localized-string';
import { normalizeDemoFolder } from '@/lib/refactory-online';
import { resolveWebPageImageUrl } from '@/lib/web-page-media';
import { getRawWebPages } from '@/lib/web-pages';
import { Layers3, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

type Props = { currentSlug: string; category: string };
type Template = { slug: string; title: string; imageUrl: string; price: number; text: string; style: string };

const EDITORIAL: Record<string, string[]> = {
  'neonstrike-game-launch': ['arenapulse-esports-platform', 'lootvault-game-marketplace'],
};
const STYLE_TERMS = ['3d', 'cinematic', 'cinematográfico', 'dark', 'oscuro', 'editorial', 'futuristic', 'futurista', 'gaming', 'hud', 'minimal', 'minimalista', 'neon', 'premium', 'retro', 'glitch'];
const INDUSTRIES = [
  ['game', 'gaming', 'esports', 'shooter', 'skins', 'tournament', 'cyberpunk'],
  ['saas', 'software', 'startup', 'developer', 'productivity'],
  ['food', 'restaurant', 'gastronomic', 'café', 'coffee'],
  ['travel', 'hostel', 'hotel', 'tourism', 'outdoor'],
  ['design', 'portfolio', 'agency', 'creative', 'brand'],
  ['marketplace', 'commerce', 'store', 'shop', 'ecommerce'],
];

function price(value?: string) {
  const parsed = Number.parseFloat(value?.replace(/[^\d.]/g, '') ?? '');
  return Number.isFinite(parsed) ? parsed : 0;
}

function styleText(description: unknown) {
  if (!description || typeof description !== 'object') return '';
  return ['es', 'en'].map(locale => (description as Record<string, unknown>)[locale])
    .filter(value => value && typeof value === 'object')
    .map(value => {
      const record = value as Record<string, unknown>;
      return `${String(record.estilo ?? '')} ${String(record.style ?? '')}`;
    }).join(' ').toLowerCase();
}

function sharedTerms(a: string, b: string, terms: string[]) {
  return terms.reduce((score, term) => score + (a.includes(term) && b.includes(term) ? 1 : 0), 0);
}

function industryScore(a: string, b: string) {
  return INDUSTRIES.reduce((score, group) => {
    if (!group.some(term => a.includes(term))) return score;
    return score + group.filter(term => b.includes(term)).length;
  }, 0);
}

function TemplateCard({ template, reason }: { template: Template; reason: string }) {
  return (
    <article className="group overflow-hidden rounded-xl border bg-card transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/landing-pages/${encodeURIComponent(template.slug)}`} className="block">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {template.imageUrl ? <OptimizedImage src={template.imageUrl} alt={template.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-105" /> : null}
        </div>
        <div className="space-y-2 p-4">
          <Badge variant="secondary">{reason}</Badge>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold leading-snug group-hover:text-primary">{template.title}</h3>
            {template.price > 0 ? <span className="shrink-0 text-sm font-bold text-blue-600">${template.price.toFixed(0)}</span> : null}
          </div>
        </div>
      </Link>
    </article>
  );
}

export async function RelatedTemplates({ currentSlug }: Props) {
  const locale = await getLocale();
  const t = await getTranslations('landingPages');
  const templates: Template[] = getRawWebPages().flatMap(page => {
    const slug = normalizeDemoFolder(page.demoUrl ?? '');
    if (!slug) return [];
    const title = pickLocalized(page.title, locale);
    const style = styleText(page.description);
    return [{ slug, title, imageUrl: resolveWebPageImageUrl(page.imageUrl), price: price(page.price), text: `${slug} ${title} ${(page.tags ?? []).join(' ')} ${style}`.toLowerCase(), style }];
  });
  const current = templates.find(item => item.slug === currentSlug);
  if (!current) return null;
  const candidates = templates.filter(item => item.slug !== currentSlug);
  const editorial = EDITORIAL[currentSlug] ?? [];
  const rankedStyle = candidates.map(item => ({ item, score: sharedTerms(current.style, item.style, STYLE_TERMS) })).filter(result => result.score > 0).sort((a, b) => b.score - a.score).map(result => result.item);
  const rankedIndustry = candidates.map(item => ({ item, score: industryScore(current.text, item.text) + (editorial.includes(item.slug) ? 100 : 0) })).filter(result => result.score > 0).sort((a, b) => b.score - a.score).map(result => result.item);
  const used = new Set<string>();
  const take = (items: Template[]) => items.filter(item => !used.has(item.slug) && used.add(item.slug)).slice(0, 3);
  const industry = take(rankedIndustry);
  const style = take(rankedStyle);
  const cheaper = take(candidates.filter(item => item.price > 0 && item.price < current.price).sort((a, b) => b.price - a.price));
  const sections = [
    [t('recommendations.sameStyle'), t('recommendations.styleMatch'), style],
    [t('recommendations.sameIndustry'), t('recommendations.industryMatch'), industry],
    [t('recommendations.cheaper'), t('recommendations.lowerPrice'), cheaper],
  ] as Array<[string, string, Template[]]>;
  const visibleSections = sections.filter(([, , items]) => items.length > 0);
  const bundle = [current, ...rankedIndustry, ...rankedStyle].filter((item, index, all) => all.findIndex(candidate => candidate.slug === item.slug) === index).slice(0, 5);
  if (visibleSections.length === 0) return null;

  return (
    <section aria-labelledby="related-templates-heading" className="mt-14 border-t pt-10">
      <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-muted-foreground"><Sparkles className="size-4" /> {t('relatedTemplates')}</p>
      <h2 id="related-templates-heading" className="mb-8 mt-2 text-2xl font-bold tracking-tight font-headline">{t('recommendations.title', { name: current.title })}</h2>
      <div className="space-y-10">
        {visibleSections.map(([title, reason, items]) => <div key={title}><h3 className="mb-4 text-lg font-bold">{title}</h3><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <TemplateCard key={item.slug} template={item} reason={reason} />)}</div></div>)}
        {bundle.length > 1 ? <div className="flex flex-col gap-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex items-start gap-3"><Layers3 className="mt-1 size-6 shrink-0 text-blue-600" /><div><h3 className="font-bold">{t('recommendations.bundleTitle')}</h3><p className="mt-1 text-sm text-muted-foreground">{t('recommendations.bundleDescription', { count: bundle.length })}</p></div></div><Button asChild className="shrink-0 bg-blue-600 text-white hover:bg-blue-700"><Link href={`/prices?bundle=${encodeURIComponent(bundle.map(item => item.slug).join(','))}`}>{t('recommendations.bundleAction')}</Link></Button></div> : null}
      </div>
    </section>
  );
}
