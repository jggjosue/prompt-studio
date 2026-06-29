'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { CatalogFacetBar } from '@/components/catalog-facet-bar';
import { WebPageCard } from '@/components/web-page-card';
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
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  AFFILIATE_FIRST_REF_STORAGE_KEY,
  AFFILIATE_LAST_TOUCH_STORAGE_KEY,
  AFFILIATE_OWNER_STORAGE_KEY,
  AFFILIATE_REF_STORAGE_KEY,
} from '@/lib/affiliate';

const ITEMS_PER_PAGE = 30;

function LandingPagesContent() {
  const tFacets = useTranslations('facets');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const facetTag = searchParams.get('tag')?.trim() || null;
  const facetStack = searchParams.get('stack')?.trim() || null;

  const webPages = useLocalizedWebPages();
  const { isSignedIn } = useUser();
  const { snapshots: readabilityByPageId } = useLandingReadabilityIndex();
  const allPages = useMemo(() => webPages.filter(p => p.imageUrl), [webPages]);

  const { aggregates, facetIndex } = useWebCatalogHashPipeline(allPages);
  const { categories } = aggregates;

  // We can still support fuzzy filter or we can just filter allPages
  // Wait, facetFiltered needs to be computed based on facetTag and facetStack
  const facetFiltered = useMemo(() => {
    if (!facetTag && !facetStack) return allPages;
    return allPages.filter(page => {
      const matchTag = facetTag ? page.tags.includes(facetTag) : true;
      const matchStack = facetStack ? page.stack?.includes(facetStack) : true;
      return matchTag && matchStack;
    });
  }, [allPages, facetTag, facetStack]);

  const customCategories = useMemo(() => {
    return categories.map(cat => ({
      label: cat.name,
      entries: cat.tags.map(t => ({ key: t.name, count: t.count })),
    }));
  }, [categories]);

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

  useEffect(() => {
    void fetch('/api/activity/ping', { method: 'POST' }).catch(() => {});
  }, []);

  useEffect(() => {
    const ref = searchParams.get('ref')?.trim();
    if (!ref) return;
    window.localStorage.setItem(AFFILIATE_REF_STORAGE_KEY, ref);
    window.localStorage.setItem(AFFILIATE_OWNER_STORAGE_KEY, ref);
    if (!window.localStorage.getItem(AFFILIATE_FIRST_REF_STORAGE_KEY)) {
      window.localStorage.setItem(AFFILIATE_FIRST_REF_STORAGE_KEY, ref);
    }
    window.localStorage.setItem(AFFILIATE_LAST_TOUCH_STORAGE_KEY, ref);
  }, [searchParams]);

  useEffect(() => {
    if (!isSignedIn) return;
    void fetch('/api/interests/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interest: 'landing-pages' }),
    }).catch(() => {});
  }, [isSignedIn]);

  const {
    visibleItems: paginatedPages,
    hasMore,
    observerTarget,
  } = useInfiniteScroll(pages, ITEMS_PER_PAGE);

  const selectFacetTag = (tag: string) => {
    router.push(
      buildCatalogQueryUrl(pathname, searchParams, { tag, stack: null }),
      { scroll: false }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectFacetStack = (stack: string) => {
    router.push(
      buildCatalogQueryUrl(pathname, searchParams, { tag: null, stack }),
      { scroll: false }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFacets = () => {
    router.push(
      buildCatalogQueryUrl(pathname, searchParams, { tag: null, stack: null }),
      { scroll: false }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[240px_1fr] md:gap-x-8 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center space-y-4 text-center md:col-span-2">
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
        </div>

        <aside className="hidden flex-col gap-4 overflow-y-auto pb-8 pr-2 custom-scrollbar md:col-start-1 md:row-start-2 md:flex md:h-[calc(100vh-8rem)] md:sticky md:top-24">
          <CatalogFacetBar
            customCategories={customCategories}
            activeTag={facetTag}
            activeStack={facetStack}
            onSelectTag={selectFacetTag}
            onSelectStack={selectFacetStack}
            onClearFacets={clearFacets}
            orientation="vertical"
          />
          <p className="text-xs text-muted-foreground px-4">
            {tFacets('fullBrowse')}{' '}
            <Link
              href="/web-tags"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {tFacets('webTagsLink')}
            </Link>
          </p>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 md:col-start-2 md:row-start-2 md:gap-0">
          <div className="md:hidden">
            <CatalogFacetBar
              customCategories={customCategories}
              activeTag={facetTag}
              activeStack={facetStack}
              onSelectTag={selectFacetTag}
              onSelectStack={selectFacetStack}
              onClearFacets={clearFacets}
              orientation="horizontal"
            />
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

          <div
            data-landing-results
            className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-1 md:gap-8 lg:grid-cols-2 xl:grid-cols-2"
          >
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
            <div ref={observerTarget} className="flex justify-center p-4 md:mt-6">
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
