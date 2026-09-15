'use client';

import { useRecentlyViewedLandings } from '@/hooks/use-recently-viewed-landings';
import { Clock3 } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function RecentlyViewedLandings() {
  const items = useRecentlyViewedLandings();
  const locale = useLocale();
  if (items.length === 0) return null;
  return <section className="mb-6 rounded-2xl border bg-muted/30 p-4" aria-labelledby="recent-landings-title"><div className="mb-3 flex items-center gap-2"><Clock3 className="size-4 text-blue-600" /><h2 id="recent-landings-title" className="text-sm font-bold">{locale === 'en' ? 'Recently viewed' : 'Vistos recientemente'}</h2></div><div className="flex gap-2 overflow-x-auto pb-1">{items.slice(0, 5).map(item => <Link key={item.slug} href={`/landing-pages/${item.slug}`} className="min-w-44 rounded-xl border bg-background px-3 py-2 transition hover:border-blue-500/40"><p className="line-clamp-1 text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.visits > 1 ? (locale === 'en' ? `${item.visits} visits` : `${item.visits} visitas`) : (locale === 'en' ? 'Viewed once' : 'Visto una vez')}</p></Link>)}</div></section>;
}
