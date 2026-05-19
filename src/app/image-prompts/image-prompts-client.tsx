'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { CatalogFacetBar } from '@/components/catalog-facet-bar';
import { PromptCatalogCard } from '@/components/prompt-catalog-card';
import { SearchInput } from '@/components/search-input';
import { KeysetPagination } from '@/components/keyset-pagination';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  buildCatalogQueryUrl,
  useCatalogSearchUrl,
} from '@/hooks/use-catalog-search-url';
import { useKeysetPaginationUrl } from '@/hooks/use-keyset-pagination';
import { useLocalizedPlaceholderImages } from '@/hooks/use-localized-catalog';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { summarizeTagFacets } from '@/lib/catalog-tag-aggregation';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { Sparkles, Search, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const NANO_BANANA_TAB_ENABLED = false;
const ITEMS_PER_PAGE = 18;

function ImagePromptsSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-64" />
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {Array.from({ length: 9 }).map((_, index) => (
          <Skeleton key={index} className="h-[420px] w-full rounded-lg" />
        ))}
      </div>
    </>
  );
}

function ImagePromptsContent() {
  const tTags = useTranslations('tags');
  const tFacets = useTranslations('facets');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const placeholderImages = useLocalizedPlaceholderImages();
  const [filter, setFilter] = useState('all');

  const facetTag = searchParams.get('tag')?.trim() || null;

  const allImages = useMemo(
    () =>
      placeholderImages.filter(item => item.type === 'image' && item.imageUrl),
    [placeholderImages]
  );

  const imageFacets = useMemo(
    () => summarizeTagFacets(allImages, p => p.tags, { topN: 14, minCount: 2 }),
    [allImages]
  );

  const facetFiltered = useMemo(() => {
    let items = allImages;

    if (NANO_BANANA_TAB_ENABLED && filter === 'nano-banana') {
      items = items.filter(item =>
        item.tags.map(t => t.toLowerCase()).includes('nano banana')
      );
    }

    if (facetTag) {
      items = items.filter(item =>
        item.tags.some(t => t.toLowerCase() === facetTag.toLowerCase())
      );
    }

    return items;
  }, [allImages, filter, facetTag]);

  const {
    input: searchInput,
    setInput: setSearchInput,
    debounced: debouncedQuery,
    isPending: isSearchPending,
    clearSearch,
  } = useCatalogSearchUrl();

  const imageContent = useFuzzyFilter(
    facetFiltered,
    debouncedQuery,
    (item: ImagePlaceholder) => [
      item.title,
      item.description ?? '',
      ...item.tags,
      item.imageHint ?? '',
    ],
    item => item.id
  );

  useEffect(() => {
    if (!NANO_BANANA_TAB_ENABLED && filter === 'nano-banana') {
      setFilter('all');
    }
  }, [filter]);

  const {
    items: paginatedContent,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    rangeStart,
    rangeEnd,
    totalCount,
  } = useKeysetPaginationUrl(
    imageContent,
    item => item.id,
    ITEMS_PER_PAGE,
    {
      searchParams,
      pathname,
      router,
      resetDeps: [filter, facetTag, debouncedQuery],
    }
  );

  const selectFacetTag = (tag: string) => {
    router.push(buildCatalogQueryUrl(pathname, searchParams, { tag }), {
      scroll: false,
    });
  };

  const clearFacets = () => {
    router.push(buildCatalogQueryUrl(pathname, searchParams, { tag: null }), {
      scroll: false,
    });
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Explore AI Image Prompts
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Discover thousands of AI image prompts and examples. Get inspired and
          create your own AI generated images.
        </p>

        <SearchInput
          className="max-w-md mt-2"
          placeholder={tTags('searchPlaceholder')}
          value={searchInput}
          onValueChange={setSearchInput}
          isPending={isSearchPending}
        />

        {(debouncedQuery.trim() || facetTag) && (
          <p className="text-sm text-muted-foreground">
            {imageContent.length === 0
              ? tCommon('noResults')
              : `${imageContent.length} result${imageContent.length !== 1 ? 's' : ''}${
                  debouncedQuery.trim()
                    ? ` for "${debouncedQuery.trim()}"`
                    : ''
                }${facetTag ? ` · tag: ${facetTag}` : ''}`}
          </p>
        )}

        <CatalogFacetBar
          topTags={imageFacets.topTags}
          activeTag={facetTag}
          onSelectTag={selectFacetTag}
          onClearFacets={clearFacets}
        />

        <p className="text-xs text-muted-foreground">
          {tFacets('fullBrowse')}{' '}
          <Link
            href="/image-tags"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {tFacets('imageTagsLink')}
          </Link>
        </p>

        {NANO_BANANA_TAB_ENABLED ? (
          <Tabs
            defaultValue="all"
            className="w-full max-w-md pt-4"
            onValueChange={value => setFilter(value)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Prompts</TabsTrigger>
              <TabsTrigger value="nano-banana">
                <Sparkles className="mr-2 h-4 w-4" />
                Nano Banana Pro
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/image-tags">
              <Tag className="mr-2" />
              {tTags('browseByTags')}
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="https://aistudio.google.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Wand2 className="mr-2" />
              Generate an Image
            </Link>
          </Button>
        </div>
      </div>

      {paginatedContent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground gap-3">
          <Search className="w-10 h-10 opacity-30" />
          <p className="text-base font-medium">{tCommon('noResults')}</p>
          {debouncedQuery.trim() || facetTag ? (
            <div className="flex flex-wrap justify-center gap-3">
              {debouncedQuery.trim() ? (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="text-sm underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  {tTags('clearSearch')}
                </button>
              ) : null}
              {facetTag ? (
                <button
                  type="button"
                  onClick={clearFacets}
                  className="text-sm underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  {tFacets('clearFacets')}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {paginatedContent.map(item => (
            <PromptCatalogCard
              key={item.id}
              item={{ ...item, type: 'image' }}
              galleryHref={`/gallery/${item.id}`}
              headerClassName="p-6 pb-0"
              titleClassName="text-xl"
            />
          ))}
        </div>
      )}

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
  );
}

export default function ImagePromptsClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <Suspense fallback={<ImagePromptsSkeleton />}>
            <ImagePromptsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
