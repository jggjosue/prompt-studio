import sys

content = """'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { SortedHashEntry } from '@/lib/hash-aggregation';
import { cn } from '@/lib/utils';
import { Layers, Tag, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type ReactNode, useMemo } from 'react';

export type CatalogFacetBarProps = {
  topTags?: SortedHashEntry[];
  topStacks?: SortedHashEntry[];
  customCategories?: { label: string; icon?: ReactNode; entries: SortedHashEntry[] }[];
  activeTag?: string | null;
  activeStack?: string | null;
  onSelectTag?: (tag: string) => void;
  onSelectStack?: (stack: string) => void;
  onClearFacets?: () => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
};

export function CatalogFacetBar({
  topTags = [],
  topStacks = [],
  customCategories = [],
  activeTag,
  activeStack,
  onSelectTag,
  onSelectStack,
  onClearFacets,
  className,
  orientation = 'horizontal',
}: CatalogFacetBarProps) {
  const t = useTranslations('facets');

  const hasFacets = topTags.length > 0 || topStacks.length > 0 || customCategories.length > 0;
  const hasActive = Boolean(activeTag || activeStack);

  const defaultOpen = useMemo(() => {
    const open: string[] = [];
    if (activeTag) {
      if (topTags.some(t => t.key.toLowerCase() === activeTag.toLowerCase())) open.push(t('topTags'));
      customCategories.forEach(c => {
        if (c.entries.some(e => e.key.toLowerCase() === activeTag.toLowerCase())) open.push(c.label);
      });
    }
    if (activeStack) {
      if (topStacks.some(s => s.key.toLowerCase() === activeStack.toLowerCase())) open.push(t('topStacks'));
    }
    return open;
  }, [activeTag, activeStack, topTags, topStacks, customCategories, t]);

  if (!hasFacets) return null;

  return (
    <div
      className={cn(
        'w-full rounded-lg border bg-muted/30 px-4 py-3 text-left space-y-4',
        orientation === 'horizontal' && 'max-w-3xl mx-auto',
        className
      )}
    >
      <div className={cn(
        'flex items-center justify-between gap-2',
        orientation === 'vertical' ? 'flex-col items-start gap-4' : 'flex-wrap'
      )}>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t('browseByFacet')}
        </p>
        {hasActive && onClearFacets ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn("h-7 px-2 text-xs", orientation === 'vertical' && '-ml-2')}
            onClick={onClearFacets}
          >
            <X className="h-3 w-3 mr-1" />
            {t('clearFacets')}
          </Button>
        ) : null}
      </div>

      <Accordion type="multiple" defaultValue={defaultOpen} className="w-full space-y-2">
        {topTags.length > 0 ? (
          <FacetRow
            icon={<Tag className="h-3.5 w-3.5" />}
            label={t('topTags')}
            entries={topTags}
            activeKey={activeTag}
            onSelect={onSelectTag}
            orientation={orientation}
          />
        ) : null}

        {topStacks.length > 0 ? (
          <FacetRow
            icon={<Layers className="h-3.5 w-3.5" />}
            label={t('topStacks')}
            entries={topStacks}
            activeKey={activeStack}
            onSelect={onSelectStack}
            orientation={orientation}
          />
        ) : null}

        {customCategories.map(category => (
          <FacetRow
            key={category.label}
            icon={category.icon || <Tag className="h-3.5 w-3.5" />}
            label={category.label}
            entries={category.entries}
            activeKey={activeTag}
            onSelect={onSelectTag}
            orientation={orientation}
          />
        ))}
      </Accordion>
    </div>
  );
}

function FacetRow({
  icon,
  label,
  entries,
  activeKey,
  onSelect,
  orientation = 'horizontal',
}: {
  icon: ReactNode;
  label: string;
  entries: SortedHashEntry[];
  activeKey?: string | null;
  onSelect?: (key: string) => void;
  orientation?: 'horizontal' | 'vertical';
}) {
  return (
    <AccordionItem value={label} className="border-b-0">
      <AccordionTrigger className="flex items-center gap-1.5 py-2 text-xs font-semibold text-muted-foreground hover:no-underline hover:text-foreground">
        <div className="flex items-center gap-1.5">
          {icon}
          {label}
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className={cn("flex flex-wrap gap-2 pt-1 pb-2", orientation === 'vertical' && "flex-col items-start gap-1.5")}>
          {entries.map(entry => {
            const isActive =
              activeKey?.toLowerCase() === entry.key.toLowerCase();
            return (
              <Button
                key={entry.key}
                type="button"
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "h-auto py-1.5 px-2.5 text-xs font-normal",
                  orientation === 'vertical' && "w-full justify-between hover:bg-muted/50 border border-transparent hover:border-border",
                  isActive && orientation === 'vertical' && "border-border shadow-sm"
                )}
                onClick={() => onSelect?.(entry.key)}
              >
                <span className="truncate max-w-[140px] text-left">{entry.key}</span>
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 min-w-[1.25rem] px-1 text-[10px] tabular-nums"
                >
                  {entry.count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
"""

with open("src/components/catalog-facet-bar.tsx", "w") as f:
    f.write(content)
