'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { CatalogFacetBar } from '@/components/catalog-facet-bar';
import { WebPageCard } from '@/components/web-page-card';
import { KeysetPagination } from '@/components/keyset-pagination';
import { RelatedInternalLinks } from '@/components/related-internal-links';
import { SearchInput } from '@/components/search-input';
import {
  buildCatalogQueryUrl,
  useCatalogSearchUrl,
} from '@/hooks/use-catalog-search-url';
import { useKeysetPaginationUrl } from '@/hooks/use-keyset-pagination';
import { useLocalizedWebPages } from '@/hooks/use-localized-catalog';
import { useLandingReadabilityIndex } from '@/hooks/use-landing-readability-index';
import { useWebCatalogHashBundle } from '@/hooks/use-catalog-hash-bundle';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useMemo } from 'react';

const ITEMS_PER_PAGE = 30;

function LandingPagesContent() {
  const tFacets = useTranslations('facets');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const facetTag = searchParams.get('tag')?.trim() || null;
  const facetStack = searchParams.get('stack')?.trim() || null;

  const webPages = useLocalizedWebPages();
  const { snapshots: readabilityByPageId } = useLandingReadabilityIndex();
  const allPages = useMemo(() => webPages.filter(p => p.imageUrl), [webPages]);

  const { topTags, topStacks, filtered: facetFiltered } = useWebCatalogHashBundle(
    allPages,
    page => page.id,
    page => ({ tags: page.tags, stack: page.stack }),
    { tag: facetTag, stack: facetStack },
    { topN: 14, minCount: 2 }
  );

  const {
    input: searchInput,
    setInput: setSearchInput,
    debounced: debouncedQuery,
    isPending: isSearchPending,
    clearSearch,
  } = useCatalogSearchUrl();

  const pages = useFuzzyFilter(
    facetFiltered,
    debouncedQuery,
    page => [page.title, ...page.tags, ...page.stack],
    page => page.id
  );

  const {
    items: paginatedPages,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    goFirst,
    rangeStart,
    rangeEnd,
    totalCount,
  } = useKeysetPaginationUrl(
    pages,
    page => page.id,
    ITEMS_PER_PAGE,
    {
      searchParams,
      pathname,
      router,
      resetDeps: [debouncedQuery, facetTag, facetStack],
    }
  );

  const selectFacetTag = (tag: string) => {
    router.push(
      buildCatalogQueryUrl(pathname, searchParams, { tag, stack: null }),
      { scroll: false }
    );
  };

  const selectFacetStack = (stack: string) => {
    router.push(
      buildCatalogQueryUrl(pathname, searchParams, { tag: null, stack }),
      { scroll: false }
    );
  };

  const clearFacets = () => {
    router.push(
      buildCatalogQueryUrl(pathname, searchParams, { tag: null, stack: null }),
      { scroll: false }
    );
  };

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

        {(debouncedQuery || facetTag || facetStack) && (
          <p className="text-sm text-muted-foreground">
            {pages.length === 0
              ? 'No results found'
              : `${pages.length} result${pages.length !== 1 ? 's' : ''}${
                  debouncedQuery ? ` for "${debouncedQuery}"` : ''
                }${facetTag ? ` · tag: ${facetTag}` : ''}${
                  facetStack ? ` · stack: ${facetStack}` : ''
                }`}
          </p>
        )}

        <CatalogFacetBar
          topTags={topTags}
          topStacks={topStacks}
          activeTag={facetTag}
          activeStack={facetStack}
          onSelectTag={selectFacetTag}
          onSelectStack={selectFacetStack}
          onClearFacets={clearFacets}
        />

        <p className="text-xs text-muted-foreground">
          {tFacets('fullBrowse')}{' '}
          <Link
            href="/web-tags"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {tFacets('webTagsLink')}
          </Link>
        </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {paginatedPages.map(page => (
          <WebPageCard
            key={page.id}
            page={page}
            savedReadability={readabilityByPageId[page.id] ?? null}
          />
        ))}
      </div>

      <KeysetPagination
        hasPrev={hasPrev}
        hasNext={hasNext}
        onPrev={goPrev}
        onNext={goNext}
        onFirst={goFirst}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalCount={totalCount}
      />

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
