import sys

content = """'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { WebPageCard } from '@/components/web-page-card';
import { KeysetPagination } from '@/components/keyset-pagination';
import { RelatedInternalLinks } from '@/components/related-internal-links';
import { SearchInput } from '@/components/search-input';
import {
  buildCatalogQueryUrl,
  useCatalogSearchUrl,
} from '@/hooks/use-catalog-search-url';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useLocalizedWebPages } from '@/hooks/use-localized-catalog';
import { useLandingReadabilityIndex } from '@/hooks/use-landing-readability-index';
import { useWebCatalogHashPipeline } from '@/hooks/use-catalog-hash-aggregation';
import {
  filterItemsByMembership,
  filterItemsByStack,
  filterItemsByTag,
} from '@/lib/catalog-tag-aggregation';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { Search, LayoutGrid, Palette, Building2, Code2, Crown, Tag } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { WebTagCategory } from '@/lib/web-tags-data';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { membershipRequiresPayment } from '@/lib/membership-access';

const ITEMS_PER_PAGE = 30;

const icons: Record<string, ReactNode> = {
  LayoutGrid: <LayoutGrid className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Code2: <Code2 className="h-6 w-6" />,
  Crown: <Crown className="h-6 w-6" />,
  Tag: <Tag className="h-6 w-6" />,
};

const categoryCardStyles = [
  'bg-blue-50/20 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
  'bg-green-50/20 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50',
  'bg-blue-50/20 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
  'bg-red-50/20 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50',
  'bg-yellow-50/20 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/50',
  'bg-orange-50/20 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/50',
];

const categoryIconStyles = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
];

export type WebFilter =
  | { kind: 'tag'; value: string; label: string }
  | { kind: 'stack'; value: string; label: string }
  | { kind: 'membership'; value: string; label: string };

function LandingPagesContent() {
  const tFacets = useTranslations('facets');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const webPages = useLocalizedWebPages();
  const { snapshots: readabilityByPageId } = useLandingReadabilityIndex();
  const allPages = useMemo(() => webPages.filter(p => p.imageUrl), [webPages]);

  const { ready, canAccessMembership, requestAccess, runWithAccess } =
    useMembershipAccess();
  const [filter, setFilter] = useState<WebFilter | null>(null);

  const {
    aggregates: { categories: webTagsData, totalUniqueTags, totalWebPages },
    facetIndex: pageFilterIndex,
  } = useWebCatalogHashPipeline(allPages);

  useEffect(() => {
    const tag = searchParams.get('tag');
    const stack = searchParams.get('stack');
    const membership = searchParams.get('membership');

    let nextFilter: WebFilter | null = null;
    if (tag) {
      nextFilter = { kind: 'tag', value: tag, label: tag };
    } else if (stack) {
      nextFilter = { kind: 'stack', value: stack, label: stack };
    } else if (membership) {
      nextFilter = {
        kind: 'membership',
        value: membership,
        label: membership,
      };
    }

    setFilter((prev) => {
      if (!prev && !nextFilter) return null;
      if (
        prev &&
        nextFilter &&
        prev.kind === nextFilter.kind &&
        prev.value === nextFilter.value &&
        prev.label === nextFilter.label
      ) {
        return prev;
      }
      return nextFilter;
    });
  }, [searchParams]);

  const filteredPages = useMemo(() => {
    if (!filter) return [];

    if (filter.kind === 'tag') {
      return filterItemsByTag(pageFilterIndex, filter.value);
    }
    if (filter.kind === 'stack') {
      return filterItemsByStack(pageFilterIndex, filter.value);
    }
    return filterItemsByMembership(pageFilterIndex, filter.value);
  }, [filter, pageFilterIndex]);

  const {
    input: searchInput,
    setInput: setSearchInput,
    debounced: debouncedQuery,
    isPending: isSearchPending,
    clearSearch,
  } = useCatalogSearchUrl();

  const searchActive = debouncedQuery.trim().length > 0;

  const baseForSearch = useMemo(() => {
    if (filter) return filteredPages;
    return allPages;
  }, [filter, filteredPages, allPages]);

  const pages = useFuzzyFilter(
    baseForSearch,
    debouncedQuery,
    page => [page.title, ...page.tags, ...page.stack, page.membership ?? ''],
    page => page.id
  );
  
  useEffect(() => {
    if (!ready || !filter || filter.kind !== 'membership') return;
    if (!membershipRequiresPayment(filter.value)) return;
    if (!canAccessMembership(filter.value)) {
      requestAccess(filter.value);
    }
  }, [ready, filter, canAccessMembership, requestAccess]);

  const {
    visibleItems: paginatedPages,
    hasMore,
    observerTarget,
  } = useInfiniteScroll(pages, ITEMS_PER_PAGE);

  const handleSelectFilter = (category: WebTagCategory, tagName: string) => {
    const applyFilter = () => {
      setFilter({
        kind: category.kind,
        value: tagName,
        label: tagName,
      });
      const updates =
        category.kind === 'membership'
          ? {
              membership: tagName,
              tag: null as string | null,
              stack: null as string | null,
            }
          : category.kind === 'stack'
            ? {
                stack: tagName,
                tag: null as string | null,
                membership: null as string | null,
              }
            : {
                tag: tagName,
                stack: null as string | null,
                membership: null as string | null,
              };
      router.push(buildCatalogQueryUrl(pathname, searchParams, updates), {
        scroll: false,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (category.kind === 'membership') {
      runWithAccess(tagName, applyFilter);
      return;
    }

    applyFilter();
  };

  const isFilterActive = (category: WebTagCategory, tagName: string) =>
    filter?.kind === category.kind &&
    filter.value.toLowerCase() === tagName.toLowerCase();

  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Landing Page Prompts
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Prompts and live HTML demos for SaaS landing pages — dark, light,
          Next.js, and DevTool variants.
        </p>

        <SearchInput
          className="max-w-md mt-2"
          placeholder="Search by title, tag, or stack…"
          value={searchInput}
          onValueChange={setSearchInput}
          isPending={isSearchPending}
        />

        {(debouncedQuery || filter) && (
          <p className="text-sm text-muted-foreground">
            {pages.length === 0
              ? 'No results found'
              : `${pages.length} result${pages.length !== 1 ? 's' : ''}${
                  debouncedQuery ? ` for "${debouncedQuery}"` : ''
                }${filter ? ` · ${filter.kind}: ${filter.label}` : ''}`}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] xl:grid-cols-[400px_1fr] gap-8 items-start">
          <aside className="hidden md:flex flex-col sticky top-24 gap-6 h-[calc(100vh-8rem)] overflow-y-auto pb-8 pr-2 custom-scrollbar">
            {webTagsData.map((category, index) => (
              <Card
                key={category.name}
                className={cn(
                  'p-4 md:p-5',
                  categoryCardStyles[index % categoryCardStyles.length]
                )}
              >
                <div className="flex flex-wrap items-center gap-2 mb-3 min-w-0">
                  <div
                    className={cn(
                      'p-1.5 rounded-full',
                      categoryIconStyles[index % categoryIconStyles.length]
                    )}
                  >
                    {icons[category.icon] ?? icons.Tag}
                  </div>
                  <h2 className="text-base font-bold font-headline break-words min-w-0 flex-1">{category.name}</h2>
                  <Badge variant="secondary" className="text-xs">{category.count}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{category.description}</p>
                <div className="flex flex-wrap gap-2">
                  {category.tags.map(tag => (
                    <Button
                      key={tag.name}
                      variant={
                        isFilterActive(category, tag.name) ? 'default' : 'outline'
                      }
                      size="sm"
                      className="h-auto py-1 px-2.5 text-xs"
                      onClick={() => handleSelectFilter(category, tag.name)}
                    >
                      <span>{tag.name}</span>
                      <Badge variant="secondary" className="ml-1.5 bg-background/50 hover:bg-background/80 text-[10px] px-1 py-0 h-4">
                        {tag.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
          </aside>

          <div className="flex flex-col space-y-6 min-w-0">
            <div className="md:hidden flex flex-col gap-4">
               {/* Mobile specific facet rendering - abbreviated or just standard buttons */}
               <div className="flex flex-wrap gap-2">
                 {webTagsData.flatMap(c => c.tags).slice(0, 15).map(tag => (
                    <Button
                      key={tag.name}
                      variant={filter?.value === tag.name ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleSelectFilter(
                        webTagsData.find(c => c.tags.some(t => t.name === tag.name))!, 
                        tag.name
                      )}
                    >
                      {tag.name}
                    </Button>
                 ))}
               </div>
            </div>

            {paginatedPages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
                <Search className="w-10 h-10 opacity-30" />
                <p className="text-base font-medium">No pages match your search.</p>
                <button
                  onClick={clearSearch}
                  className="text-sm underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 min-w-0">
              {paginatedPages.map((page, index) => (
                <WebPageCard
                  key={page.id}
                  page={page}
                  animationIndex={index}
                  savedReadability={readabilityByPageId[page.id] ?? null}
                />
              ))}
            </div>

            {hasMore && (
              <div ref={observerTarget} className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

      <RelatedInternalLinks className="mt-12 max-w-3xl mx-auto" />
    </>
  );
}

export default function LandingPagesClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-lg border bg-muted/30 animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <LandingPagesContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
"""

with open('src/app/landing-pages/landing-pages-client.tsx', 'w') as f:
    f.write(content)
