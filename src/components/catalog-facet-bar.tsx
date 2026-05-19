'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { SortedHashEntry } from '@/lib/hash-aggregation';
import { cn } from '@/lib/utils';
import { Layers, Tag, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

export type CatalogFacetBarProps = {
  topTags?: SortedHashEntry[];
  topStacks?: SortedHashEntry[];
  activeTag?: string | null;
  activeStack?: string | null;
  onSelectTag?: (tag: string) => void;
  onSelectStack?: (stack: string) => void;
  onClearFacets?: () => void;
  className?: string;
};

export function CatalogFacetBar({
  topTags = [],
  topStacks = [],
  activeTag,
  activeStack,
  onSelectTag,
  onSelectStack,
  onClearFacets,
  className,
}: CatalogFacetBarProps) {
  const t = useTranslations('facets');

  const hasFacets = topTags.length > 0 || topStacks.length > 0;
  const hasActive = Boolean(activeTag || activeStack);

  if (!hasFacets) return null;

  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto rounded-lg border bg-muted/30 px-4 py-3 text-left space-y-3',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('browseByFacet')}
        </p>
        {hasActive && onClearFacets ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={onClearFacets}
          >
            <X className="h-3 w-3 mr-1" />
            {t('clearFacets')}
          </Button>
        ) : null}
      </div>

      {topTags.length > 0 ? (
        <FacetRow
          icon={<Tag className="h-3.5 w-3.5" />}
          label={t('topTags')}
          entries={topTags}
          activeKey={activeTag}
          onSelect={onSelectTag}
        />
      ) : null}

      {topStacks.length > 0 ? (
        <FacetRow
          icon={<Layers className="h-3.5 w-3.5" />}
          label={t('topStacks')}
          entries={topStacks}
          activeKey={activeStack}
          onSelect={onSelectStack}
        />
      ) : null}
    </div>
  );
}

function FacetRow({
  icon,
  label,
  entries,
  activeKey,
  onSelect,
}: {
  icon: ReactNode;
  label: string;
  entries: SortedHashEntry[];
  activeKey?: string | null;
  onSelect?: (key: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        {icon}
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {entries.map(entry => {
          const isActive =
            activeKey?.toLowerCase() === entry.key.toLowerCase();
          return (
            <Button
              key={entry.key}
              type="button"
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              className="h-auto py-1 px-2.5 text-xs font-normal"
              onClick={() => onSelect?.(entry.key)}
            >
              <span>{entry.key}</span>
              <Badge
                variant="secondary"
                className="ml-1.5 h-5 min-w-[1.25rem] px-1 text-[10px]"
              >
                {entry.count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
