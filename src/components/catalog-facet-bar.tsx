'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
  activeTags?: string[];
  activeStacks?: string[];
  onSelectTag?: (tag: string) => void;
  onSelectStack?: (stack: string) => void;
  onClearFacets?: () => void;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  selectionVariant?: 'default' | 'checkbox';
};

export function CatalogFacetBar({
  topTags = [],
  topStacks = [],
  customCategories = [],
  activeTag,
  activeStack,
  activeTags,
  activeStacks,
  onSelectTag,
  onSelectStack,
  onClearFacets,
  className,
  orientation = 'horizontal',
  selectionVariant = 'default',
}: CatalogFacetBarProps) {
  const t = useTranslations('facets');

  const hasFacets = topTags.length > 0 || topStacks.length > 0 || customCategories.length > 0;
  const selectedTags = activeTags ?? (activeTag ? [activeTag] : []);
  const selectedStacks = activeStacks ?? (activeStack ? [activeStack] : []);
  const hasActive = selectedTags.length > 0 || selectedStacks.length > 0;

  const defaultOpen = useMemo(() => {
    const open: string[] = [];
    if (selectedTags.length > 0) {
      if (topTags.some(entry => selectedTags.some(tag => entry.key.toLowerCase() === tag.toLowerCase()))) open.push(t('topTags'));
      customCategories.forEach(c => {
        if (c.entries.some(entry => selectedTags.some(tag => entry.key.toLowerCase() === tag.toLowerCase()))) open.push(c.label);
      });
    }
    if (selectedStacks.length > 0) {
      if (topStacks.some(entry => selectedStacks.some(stack => entry.key.toLowerCase() === stack.toLowerCase()))) open.push(t('topStacks'));
    }
    return open;
  }, [selectedTags, selectedStacks, topTags, topStacks, customCategories, t]);

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
            activeKeys={selectedTags}
            onSelect={onSelectTag}
            orientation={orientation}
            selectionVariant={selectionVariant}
          />
        ) : null}

        {topStacks.length > 0 ? (
          <FacetRow
            icon={<Layers className="h-3.5 w-3.5" />}
            label={t('topStacks')}
            entries={topStacks}
            activeKeys={selectedStacks}
            onSelect={onSelectStack}
            orientation={orientation}
            selectionVariant={selectionVariant}
          />
        ) : null}

        {customCategories.map(category => (
          <FacetRow
            key={category.label}
            icon={category.icon || <Tag className="h-3.5 w-3.5" />}
            label={category.label}
            entries={category.entries}
            activeKeys={selectedTags}
            onSelect={onSelectTag}
            orientation={orientation}
            selectionVariant={selectionVariant}
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
  activeKeys,
  onSelect,
  orientation = 'horizontal',
  selectionVariant = 'default',
}: {
  icon: ReactNode;
  label: string;
  entries: SortedHashEntry[];
  activeKeys?: string[];
  onSelect?: (key: string) => void;
  orientation?: 'horizontal' | 'vertical';
  selectionVariant?: 'default' | 'checkbox';
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
            const isActive = activeKeys?.some(
              key => key.toLowerCase() === entry.key.toLowerCase()
            ) ?? false;
            return (
              <label
                key={entry.key}
                className={cn(
                  "flex cursor-pointer items-center rounded-md py-1.5 px-2.5 text-xs font-normal transition-colors",
                  orientation === 'vertical' && "w-full justify-between hover:bg-muted/50 border border-transparent hover:border-border",
                  isActive &&
                    "border-blue-500/40 bg-blue-500/10 text-blue-400 shadow-sm hover:border-blue-500/50 hover:bg-blue-500/15 hover:text-blue-300"
                )}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => onSelect?.(entry.key)}
                    aria-label={entry.key}
                    className={cn(
                      selectionVariant === 'checkbox' &&
                        'h-5 w-5 rounded-full border-2 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-600'
                    )}
                  />
                  <span className="truncate max-w-[140px] text-left">{entry.key}</span>
                </span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "ml-2 h-5 min-w-[1.25rem] px-1 text-[10px] tabular-nums",
                    isActive &&
                      "bg-blue-500/15 text-blue-300 hover:bg-blue-500/20"
                  )}
                >
                  {entry.count}
                </Badge>
              </label>
            );
          })}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
