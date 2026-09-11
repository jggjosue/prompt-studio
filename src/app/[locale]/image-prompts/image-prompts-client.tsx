'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { CatalogFacetBar } from '@/components/catalog-facet-bar';
import { PromptCatalogCard } from '@/components/prompt-catalog-card';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  buildCatalogQueryUrl,
  useCatalogSearchUrl,
} from '@/hooks/use-catalog-search-url';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { usePagedPlaceholderImages } from '@/hooks/use-paged-catalog';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { useImageTagsCatalogPipeline } from '@/hooks/use-catalog-hash-aggregation';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { Loader2, Sparkles, Search, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewportRender } from '@/components/viewport-render';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
        {Array.from({ length: 8 }).map((_, index) => (
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
  const placeholderImages = usePagedPlaceholderImages();
  const [filter, setFilter] = useState('all');

  const facetTags = searchParams.getAll('tag').map(tag => tag.trim()).filter(Boolean);
  const facetTag = facetTags[0] ?? null;

  const allImages = useMemo(
    () =>
      placeholderImages.filter(item => item.type === 'image' && item.imageUrl),
    [placeholderImages]
  );

  const { categories } = useImageTagsCatalogPipeline(allImages);

  const facetByTag = useMemo(() => {
    if (facetTags.length === 0) return allImages;
    return allImages.filter(item =>
      facetTags.some(tag => item.tags.includes(tag))
    );
  }, [allImages, facetTags]);

  const customCategories = useMemo(() => {
    return categories.map(cat => ({
      label: cat.name,
      entries: cat.tags.map(t => ({ key: t.name, count: t.count })),
    }));
  }, [categories]);

  const facetFiltered = useMemo(() => {
    if (!NANO_BANANA_TAB_ENABLED || filter !== 'nano-banana') {
      return facetByTag;
    }
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
    visibleItems: paginatedContent,
    hasMore,
    observerTarget,
  } = useInfiniteScroll(imageContent, ITEMS_PER_PAGE);

  const selectFacetTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const selected = params.getAll('tag');
    const exists = selected.some(item => item.toLowerCase() === tag.toLowerCase());
    params.delete('tag');
    selected
      .filter(item => item.toLowerCase() !== tag.toLowerCase())
      .forEach(item => params.append('tag', item));
    if (!exists) params.append('tag', tag);
    router.push(params.size ? `${pathname}?${params}` : pathname, { scroll: false });
  };

  const clearFacets = () => {
    router.push(buildCatalogQueryUrl(pathname, searchParams, { tag: null }), {
      scroll: false,
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[240px_1fr] md:gap-x-8 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center space-y-4 text-center md:col-start-2 md:row-start-1">
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
                  }${facetTags.length ? ` · tags: ${facetTags.join(', ')}` : ''}`}
            </p>
          )}

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

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 pt-4">
            <Button
              variant="outline"
              className="border-blue-500/40 text-blue-400 hover:border-blue-500/60 hover:bg-blue-500/10 hover:text-blue-300"
              asChild
            >
              <Link href="/image-tags">
                <Tag className="mr-2" />
                {tTags('browseByTags')}
              </Link>
            </Button>
            <Button
              className="!bg-blue-600 !text-white shadow-md shadow-blue-950/20 hover:!bg-blue-700"
              asChild
            >
              <Link href="/generate-images">
                <Wand2 className="mr-2" />
                Generate an Image
              </Link>
            </Button>
          </div>
        </div>

        <aside className="hidden flex-col gap-4 md:col-start-1 md:row-start-1 md:row-span-2 md:flex md:self-start md:sticky md:top-24">
          <CatalogFacetBar
            customCategories={customCategories}
            activeTag={facetTag}
            activeTags={facetTags}
            onSelectTag={selectFacetTag}
            onClearFacets={clearFacets}
            orientation="vertical"
            selectionVariant="checkbox"
          />
          <p className="text-xs text-muted-foreground px-4">
            {tFacets('fullBrowse')}{' '}
            <Link
              href="/image-tags"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {tFacets('imageTagsLink')}
            </Link>
          </p>
        </aside>

        <div className="flex min-w-0 flex-col gap-6 md:col-start-2 md:row-start-2 md:gap-0">
          <div className="md:hidden">
            <CatalogFacetBar
              customCategories={customCategories}
              activeTag={facetTag}
              activeTags={facetTags}
              onSelectTag={selectFacetTag}
              onClearFacets={clearFacets}
              orientation="horizontal"
              selectionVariant="checkbox"
            />
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
              <>
                <div
                  data-image-results
                  className="grid min-w-0 grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-1 md:gap-8 lg:grid-cols-2"
                >
                  {paginatedContent.map((item, index) => (
                    <ViewportRender key={item.id} minHeight={570}>
                    <PromptCatalogCard
                      animationIndex={index}
                      item={{ ...item, type: 'image' }}
                      galleryHref={`/gallery/${item.id}`}
                      headerClassName="p-6 pb-0"
                      titleClassName="text-xl"
                      actionClassName="text-blue-400 hover:text-blue-300"
                    /></ViewportRender>
                  ))}
                </div>
                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center p-4 md:mt-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                )}
              </>
            )}
        </div>
      </div>
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
