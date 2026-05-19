import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { SortedHashEntry } from '@/lib/hash-aggregation';
import { Layers, Tag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ReactNode } from 'react';

export type CatalogFacetsOverviewProps = {
  landingCount: number;
  imageCount: number;
  videoCount: number;
  topLandingTags: SortedHashEntry[];
  topLandingStacks: SortedHashEntry[];
  topImageTags: SortedHashEntry[];
  topVideoTags: SortedHashEntry[];
};

export async function CatalogFacetsOverview({
  landingCount,
  imageCount,
  videoCount,
  topLandingTags,
  topLandingStacks,
  topImageTags,
  topVideoTags,
}: CatalogFacetsOverviewProps) {
  const t = await getTranslations('facets');

  return (
    <Card className="xl:col-span-3">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{t('dashboardTitle')}</CardTitle>
          <CardDescription>{t('dashboardDesc')}</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/landing-pages">{t('viewLandings')}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <Stat label={t('landings')} value={landingCount} href="/landing-pages" />
          <Stat label={t('images')} value={imageCount} href="/image-prompts" />
          <Stat label={t('videos')} value={videoCount} href="/video-prompts" />
        </div>

        <FacetBlock
          icon={<Tag className="h-4 w-4" />}
          title={t('landingTopTags')}
          entries={topLandingTags}
          hrefPrefix="/landing-pages"
          param="tag"
        />
        <FacetBlock
          icon={<Layers className="h-4 w-4" />}
          title={t('landingTopStacks')}
          entries={topLandingStacks}
          hrefPrefix="/landing-pages"
          param="stack"
        />
        <FacetBlock
          icon={<Tag className="h-4 w-4" />}
          title={t('imageTopTags')}
          entries={topImageTags}
          hrefPrefix="/image-tags"
          param="tag"
        />
        <FacetBlock
          icon={<Tag className="h-4 w-4" />}
          title={t('videoTopTags')}
          entries={topVideoTags}
          hrefPrefix="/video-tags"
          param="tag"
        />
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border bg-muted/40 p-3 hover:bg-muted/70 transition-colors"
    >
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </Link>
  );
}

function FacetBlock({
  icon,
  title,
  entries,
  hrefPrefix,
  param,
}: {
  icon: ReactNode;
  title: string;
  entries: SortedHashEntry[];
  hrefPrefix: string;
  param: 'tag' | 'stack';
}) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium flex items-center gap-2">
        {icon}
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {entries.slice(0, 8).map(entry => (
          <Link
            key={entry.key}
            href={`${hrefPrefix}?${param}=${encodeURIComponent(entry.key)}`}
            className="inline-flex items-center rounded-md border bg-background px-2.5 py-1 text-xs hover:border-primary transition-colors"
          >
            {entry.key}
            <Badge variant="secondary" className="ml-1.5 h-5 px-1 text-[10px]">
              {entry.count}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
