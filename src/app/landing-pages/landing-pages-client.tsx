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
const PRICE_FACETS = [5, 10, 15, 20, 35, 50] as const;

function numericPrice(price?: string): number {
  const value = Number.parseFloat(price?.replace(/[^\d.]/g, '') ?? '');
  return Number.isFinite(value) ? value : 0;
}

function matchesCommercialFacet(
  page: { membership?: string; price?: string },
  facet: string
): boolean | null {
  const membership = page.membership?.trim().toLowerCase() ?? '';
  const price = numericPrice(page.price);

  if (facet === 'Premium') return membership === 'premium';
  if (facet === 'Free') return membership === 'free' || price === 0;

  const priceMatch = facet.match(/^\$(\d+(?:\.\d+)?) USD$/);
  if (priceMatch) return price === Number(priceMatch[1]);

  return null;
}

function LandingPagesContent() {
  const tFacets = useTranslations('facets');
  const t = useTranslations('landingPages');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const facetTags = searchParams.getAll('tag').map(value => value.trim()).filter(Boolean);
  const facetStacks = searchParams.getAll('stack').map(value => value.trim()).filter(Boolean);
  const facetTag = facetTags[0] ?? null;
  const facetStack = facetStacks[0] ?? null;

  const webPages = useLocalizedWebPages();
  const { isSignedIn } = useUser();
  const { snapshots: readabilityByPageId } = useLandingReadabilityIndex();
  const allPages = useMemo(() => webPages.filter(p => p.imageUrl), [webPages]);

  const { aggregates, facetIndex } = useWebCatalogHashPipeline(allPages);
  const { categories } = aggregates;

  // We can still support fuzzy filter or we can just filter allPages
  // Wait, facetFiltered needs to be computed based on facetTag and facetStack
  const facetFiltered = useMemo(() => {
    if (facetTags.length === 0 && facetStacks.length === 0) return allPages;
    return allPages.filter(page => {
      const matchTag = facetTags.length > 0
        ? facetTags.some(tag => matchesCommercialFacet(page, tag) ?? page.tags.includes(tag))
        : true;
      const matchStack = facetStacks.length > 0
        ? facetStacks.some(stack => page.stack?.includes(stack))
        : true;
      return matchTag && matchStack;
    });
  }, [allPages, facetTags, facetStacks]);

  const customCategories = useMemo(() => {
    const categoryLabels: Record<string, string> = {
      'Page Type': t('facetGroups.pageType'),
      'Style & Theme': t('facetGroups.styleTheme'),
      'Industry & Use Case': t('facetGroups.industryUseCase'),
      'Tech Stack': t('facetGroups.techStack'),
      Membership: t('facetGroups.membership'),
      'Popular Tags': t('facetGroups.popularTags'),
    };

    const membershipEntries = [
      {
        key: 'Premium',
        count: allPages.filter(page => matchesCommercialFacet(page, 'Premium')).length,
      },
      {
        key: 'Free',
        count: allPages.filter(page => matchesCommercialFacet(page, 'Free')).length,
      },
      ...PRICE_FACETS.map(price => {
        const key = `$${price} USD`;
        return {
          key,
          count: allPages.filter(page => matchesCommercialFacet(page, key)).length,
        };
      }),
    ];

    const result = categories
      .filter(category => category.name !== 'Membership')
      .map(category => ({
        label: categoryLabels[category.name] ?? category.name,
        entries: category.tags.map(tag => ({
          key: tag.name,
          count: tag.count,
        })),
      }));

    const popularTagsIndex = categories.findIndex(
      category => category.name === 'Popular Tags'
    );
    const membershipCategory = {
      label: categoryLabels.Membership ?? 'Membership',
      entries: membershipEntries,
    };

    if (popularTagsIndex >= 0) {
      result.splice(Math.min(popularTagsIndex, result.length), 0, membershipCategory);
    } else {
      result.push(membershipCategory);
    }

    return result;
  }, [allPages, categories, t]);

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

  const toggleFacet = (key: 'tag' | 'stack', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = params.getAll(key);
    const exists = current.some(item => item.toLowerCase() === value.toLowerCase());
    params.delete(key);
    for (const item of current) {
      if (item.toLowerCase() !== value.toLowerCase()) params.append(key, item);
    }
    if (!exists) params.append(key, value);
    params.delete('page');
    params.delete('after');
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectFacetTag = (tag: string) => {
    toggleFacet('tag', tag);
  };

  const selectFacetStack = (stack: string) => {
    toggleFacet('stack', stack);
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
            {t('title')}
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            {t('subtitle')}
          </p>

          <SearchInput
            className="max-w-md mt-2"
            placeholder={t('searchPlaceholder')}
            value={searchInput}
            onValueChange={setSearchInput}
            isPending={isSearchPending}
          />

          {(debouncedQuery || facetTag || facetStack) && (
            <p className="text-sm text-muted-foreground">
              {pages.length === 0 ? t('noResults') : t('resultsCount', { count: pages.length })}
              {pages.length > 0 && debouncedQuery ? ` ${t('forQuery', { query: debouncedQuery })}` : ''}
              {pages.length > 0 && facetTags.length > 0 ? ` · ${t('tagLabel')}: ${facetTags.join(', ')}` : ''}
              {pages.length > 0 && facetStacks.length > 0 ? ` · ${t('stackLabel')}: ${facetStacks.join(', ')}` : ''}
            </p>
          )}
        </div>

        <aside className="hidden flex-col gap-4 overflow-y-auto pb-8 pr-2 custom-scrollbar md:col-start-1 md:row-start-2 md:flex md:h-[calc(100vh-8rem)] md:sticky md:top-24">
          <CatalogFacetBar
            customCategories={customCategories}
            activeTag={facetTag}
            activeStack={facetStack}
            activeTags={facetTags}
            activeStacks={facetStacks}
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
              activeTags={facetTags}
              activeStacks={facetStacks}
              onSelectTag={selectFacetTag}
              onSelectStack={selectFacetStack}
              onClearFacets={clearFacets}
              orientation="horizontal"
            />
          </div>

          {paginatedPages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
              <Search className="w-10 h-10 opacity-30" />
              <p className="text-base font-medium">{t('noMatchingPages')}</p>
              <button
                onClick={clearSearch}
                className="text-sm underline underline-offset-4 hover:text-foreground transition-colors"
              >
                {t('clearSearch')}
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
