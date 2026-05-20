'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { CatalogFacetBar } from '@/components/catalog-facet-bar';
import { PromptCatalogCard } from '@/components/prompt-catalog-card';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { KeysetPagination } from '@/components/keyset-pagination';
import {
  buildCatalogQueryUrl,
  useCatalogSearchUrl,
} from '@/hooks/use-catalog-search-url';
import { useKeysetPaginationUrl } from '@/hooks/use-keyset-pagination';
import type { VideoProp } from '@/lib/placeholder-videos';
import { useLocalizedPlaceholderVideos } from '@/hooks/use-localized-catalog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMediaCatalogHashBundle } from '@/hooks/use-catalog-hash-bundle';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { Sparkles, Search, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

const ITEMS_PER_PAGE = 18;

function VideoPromptsSkeleton() {
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
          <Card
            key={index}
            className="overflow-hidden group h-full flex flex-col bg-card"
          >
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 flex-grow">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="aspect-[9/16] w-full rounded-md" />
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t">
              <div className="flex justify-between w-full">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}

function VideoPromptsContent() {
  const tTags = useTranslations('tags');
  const tFacets = useTranslations('facets');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const placeholderVideos = useLocalizedPlaceholderVideos();
  const [filter, setFilter] = useState('all');

  const facetTag = searchParams.get('tag')?.trim() || null;

  const allVideos = useMemo(
    () => placeholderVideos.filter(item => item.imageUrl),
    [placeholderVideos]
  );

  const { topTags, filtered: facetByTag } = useMediaCatalogHashBundle(
    allVideos,
    item => item.id,
    item => item.tags ?? [],
    { tag: facetTag },
    { topN: 14, minCount: 2 }
  );

  const facetFiltered = useMemo(() => {
    if (filter !== 'nano-banana') return facetByTag;
    return facetByTag.filter(item =>
      item.tags.map(t => t.toLowerCase()).includes('nano banana')
    );
  }, [facetByTag, filter]);

  const {
    input: searchInput,
    setInput: setSearchInput,
    debounced: debouncedQuery,
    isPending: isSearchPending,
    clearSearch,
  } = useCatalogSearchUrl();

  const videoContent = useFuzzyFilter(
    facetFiltered,
    debouncedQuery,
    (item: VideoProp) => [
      item.title,
      item.description ?? '',
      ...item.tags,
      item.imageHint ?? '',
    ],
    item => item.id
  );

  const {
    items: paginatedContent,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    goFirst,
    rangeStart,
    rangeEnd,
    totalCount,
  } = useKeysetPaginationUrl(
    videoContent,
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
          Explore AI Video Prompts
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Discover thousands of AI video prompts and examples. Get inspired and
          create your own AI generated videos.
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
            {videoContent.length === 0
              ? tCommon('noResults')
              : `${videoContent.length} result${videoContent.length !== 1 ? 's' : ''}${
                  debouncedQuery.trim()
                    ? ` for "${debouncedQuery.trim()}"`
                    : ''
                }${facetTag ? ` · tag: ${facetTag}` : ''}`}
          </p>
        )}

        <CatalogFacetBar
          topTags={topTags}
          activeTag={facetTag}
          onSelectTag={selectFacetTag}
          onClearFacets={clearFacets}
        />

        <p className="text-xs text-muted-foreground">
          {tFacets('fullBrowse')}{' '}
          <Link
            href="/video-tags"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {tFacets('videoTagsLink')}
          </Link>
        </p>

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

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/video-tags">
              <Tag className="mr-2" />
              {tTags('browseByTags')}
            </Link>
          </Button>
          <Button asChild>
            <Link
              href="/prompt/edit"
            >
              <Wand2 className="mr-2" />
              Generate a Video
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
              item={{ ...item, type: 'video' }}
              galleryHref={`/gallery-videos/${item.id}`}
              aspectClassName="aspect-[9/16]"
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
        onFirst={goFirst}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalCount={totalCount}
      />
    </>
  );
}

export default function VideoPromptsClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <Suspense fallback={<VideoPromptsSkeleton />}>
            <VideoPromptsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
