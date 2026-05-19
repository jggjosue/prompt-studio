'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { SearchInput } from '@/components/search-input';
import { WebPageCard } from '@/components/web-page-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { KeysetPagination } from '@/components/keyset-pagination';
import { cn } from '@/lib/utils';
import { useKeysetPagination } from '@/hooks/use-keyset-pagination';
import { useLocalizedWebPages } from '@/hooks/use-localized-catalog';
import { useSearchField } from '@/hooks/use-search-field';
import { DEBOUNCE_MS } from '@/lib/flow-control';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import {
  useWebPageTagFilterIndex,
  useWebTagAggregates,
} from '@/hooks/use-catalog-hash-aggregation';
import { filterItemsByTag } from '@/lib/catalog-tag-aggregation';
import type { WebTagCategory } from '@/lib/web-tags-data';
import {
  Building2,
  CheckCircle2,
  Code2,
  Crown,
  Globe,
  LayoutGrid,
  Palette,
  Search,
  Tag,
  Wand2,
} from 'lucide-react';
import { PremiumAccessLink } from '@/components/premium-access-link';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { membershipRequiresPayment } from '@/lib/membership-access';
import { PromptEditButton } from '@/components/prompt-edit-button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';

const icons: Record<string, ReactNode> = {
  LayoutGrid: <LayoutGrid className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Code2: <Code2 className="h-6 w-6" />,
  Crown: <Crown className="h-6 w-6" />,
  Tag: <Tag className="h-6 w-6" />,
};

const categoryCardStyles = [
  'bg-purple-50/20 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50',
  'bg-green-50/20 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50',
  'bg-blue-50/20 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
  'bg-red-50/20 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50',
  'bg-yellow-50/20 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/50',
  'bg-orange-50/20 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/50',
];

const categoryIconStyles = [
  'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
];

const ITEMS_PER_PAGE = 18;

export type WebFilter =
  | { kind: 'tag'; value: string; label: string }
  | { kind: 'stack'; value: string; label: string }
  | { kind: 'membership'; value: string; label: string };

function WebTagsContent() {
  const tTags = useTranslations('tags');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const searchParams = useSearchParams();
  const webPages = useLocalizedWebPages();
  const { ready, canAccessMembership, requestAccess, runWithAccess } =
    useMembershipAccess();
  const [filter, setFilter] = useState<WebFilter | null>(null);

  const {
    input: searchInput,
    setInput: setSearchInput,
    debounced: debouncedQuery,
    isPending: isSearchPending,
    clear: clearSearch,
  } = useSearchField('', DEBOUNCE_MS.searchFilter);

  const searchActive = debouncedQuery.trim().length > 0;

  const allPages = useMemo(
    () => webPages.filter(page => page.imageUrl),
    [webPages]
  );

  const {
    categories: webTagsData,
    totalWebPages,
    totalUniqueTags,
  } = useWebTagAggregates(allPages);
  const pageFilterIndex = useWebPageTagFilterIndex(allPages);

  useEffect(() => {
    const tag = searchParams.get('tag');
    const stack = searchParams.get('stack');
    const membership = searchParams.get('membership');

    if (tag) {
      setFilter({ kind: 'tag', value: tag, label: tag });
    } else if (stack) {
      setFilter({ kind: 'stack', value: stack, label: stack });
    } else if (membership) {
      setFilter({
        kind: 'membership',
        value: membership,
        label: membership,
      });
    }
  }, [searchParams]);

  const filteredPages = useMemo(() => {
    if (!filter) return [];

    if (filter.kind === 'tag') {
      return filterItemsByTag(pageFilterIndex.byTag, filter.value);
    }
    if (filter.kind === 'stack') {
      return filterItemsByTag(pageFilterIndex.byStack, filter.value);
    }
    return filterItemsByTag(pageFilterIndex.byMembership, filter.value);
  }, [filter, pageFilterIndex]);

  const baseForSearch = useMemo(() => {
    if (filter) return filteredPages;
    if (searchActive) return allPages;
    return [];
  }, [filter, filteredPages, allPages, searchActive]);

  const displayPages = useFuzzyFilter(
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

  const showResults = Boolean(filter) || searchActive;

  const {
    items: paginatedPages,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    rangeStart,
    rangeEnd,
    totalCount,
  } = useKeysetPagination(displayPages, page => page.id, ITEMS_PER_PAGE, {
    resetDeps: [filter, debouncedQuery],
  });

  const handleSelectFilter = (category: WebTagCategory, tagName: string) => {
    const applyFilter = () => {
      setFilter({
        kind: category.kind,
        value: tagName,
        label: tagName,
      });
      if (category.kind === 'membership') {
        router.push(
          `/web-tags?membership=${encodeURIComponent(tagName)}`,
          { scroll: false }
        );
      } else if (category.kind === 'stack') {
        router.push(`/web-tags?stack=${encodeURIComponent(tagName)}`, {
          scroll: false,
        });
      } else {
        router.push(`/web-tags?tag=${encodeURIComponent(tagName)}`, {
          scroll: false,
        });
      }
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

  const filterHeading =
    filter?.kind === 'stack'
      ? `Stack: ${filter.label}`
      : filter?.kind === 'membership'
        ? `Membership: ${filter.label}`
        : filter?.label;

  const resultsTitle = searchActive
    ? filter
      ? `${filterHeading} · "${debouncedQuery.trim()}"`
      : tTags('searchResultsTitle', { query: debouncedQuery.trim() })
    : filterHeading;

  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Explore Web Prompts by Tags
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Discover landing page prompts organized by{' '}
          <strong>{totalUniqueTags}</strong> unique tags, tech stacks, and
          membership across <strong>{totalWebPages}</strong> live HTML demos.
        </p>

        <SearchInput
          className="max-w-md mt-2"
          placeholder={tTags('searchWebPlaceholder')}
          value={searchInput}
          onValueChange={setSearchInput}
          isPending={isSearchPending}
        />

        {searchActive && (
          <p className="text-sm text-muted-foreground">
            {displayPages.length === 0
              ? tCommon('noResults')
              : tTags('resultsCount', {
                  count: displayPages.length,
                  query: debouncedQuery.trim(),
                })}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/landing-pages">
              <Globe className="mr-2 h-4 w-4" />
              All landing pages
            </Link>
          </Button>
          <PromptEditButton href="/prompt/edit">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate a page
          </PromptEditButton>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Live HTML demos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Copy prompts instantly</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Filter by stack & tags</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {webTagsData.map((category, index) => (
          <Card
            key={category.name}
            className={cn(
              'p-6 md:p-8',
              categoryCardStyles[index % categoryCardStyles.length]
            )}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 min-w-0">
              <div
                className={cn(
                  'p-2 rounded-full',
                  categoryIconStyles[index % categoryIconStyles.length]
                )}
              >
                {icons[category.icon] ?? icons.Tag}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-headline break-words min-w-0 flex-1">{category.name}</h2>
              <Badge variant="secondary">{category.count}</Badge>
            </div>
            <p className="text-muted-foreground mb-6">{category.description}</p>
            <div className="flex flex-wrap gap-3">
              {category.tags.map(tag => (
                <Button
                  key={tag.name}
                  variant={
                    isFilterActive(category, tag.name) ? 'default' : 'outline'
                  }
                  className="h-auto"
                  onClick={() => handleSelectFilter(category, tag.name)}
                >
                  <span>{tag.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {tag.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {showResults && (
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline text-center">
              {searchActive && !filter ? (
                <>
                  {tTags('searchResultsHeading')}{' '}
                  <span className="text-primary">
                    &quot;{debouncedQuery.trim()}&quot;
                  </span>
                </>
              ) : (
                <>
                  Pages matching{' '}
                  <span className="text-primary">
                    &quot;{resultsTitle}&quot;
                  </span>
                </>
              )}
            </h2>
            <div className="flex gap-2">
              {filter ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilter(null);
                    router.push('/web-tags', { scroll: false });
                  }}
                >
                  {tTags('clearFilter')}
                </Button>
              ) : null}
              {searchActive ? (
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  {tTags('clearSearch')}
                </Button>
              ) : null}
            </div>
          </div>
          {displayPages.length > 0 ? (
            <>
              <p className="text-center text-sm text-muted-foreground mb-6">
                {displayPages.length} result
                {displayPages.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {paginatedPages.map(page => (
                  <WebPageCard key={page.id} page={page} />
                ))}
              </div>
              <KeysetPagination
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={goPrev}
                onNext={goNext}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalCount={totalCount}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
              <Search className="w-10 h-10 opacity-30" />
              <p>{tTags('noLandingPages')}</p>
              {searchActive ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-sm underline underline-offset-4 hover:text-foreground"
                >
                  {tTags('clearSearch')}
                </button>
              ) : null}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default function WebTagsClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-lg border bg-muted/30 animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <WebTagsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}