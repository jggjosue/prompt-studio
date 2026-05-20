'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { PromptCatalogCard } from '@/components/prompt-catalog-card';
import { SearchInput } from '@/components/search-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PromptEditButton } from '@/components/prompt-edit-button';
import Link from 'next/link';
import { useImageTagsCatalogPipeline } from '@/hooks/use-catalog-hash-aggregation';
import { filterItemsByTag } from '@/lib/catalog-tag-aggregation';
import {
  Palette,
  Image as ImageIcon,
  Wand2,
  Banana,
  CheckCircle2,
  Frame,
  Store,
  Lightbulb,
  Search,
  Tag,
} from 'lucide-react';
import { KeysetPagination } from '@/components/keyset-pagination';
import { cn } from '@/lib/utils';
import { useKeysetPaginationUrl } from '@/hooks/use-keyset-pagination';
import { useLocalizedPlaceholderImages } from '@/hooks/use-localized-catalog';
import {
  buildCatalogQueryUrl,
  useCatalogSearchUrl,
} from '@/hooks/use-catalog-search-url';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';

const icons: Record<string, ReactNode> = {
  Palette: <Palette className="h-6 w-6" />,
  Image: <ImageIcon className="h-6 w-6" />,
  Frame: <Frame className="h-6 w-6" />,
  Store: <Store className="h-6 w-6" />,
  Lightbulb: <Lightbulb className="h-6 w-6" />,
};

const ITEMS_PER_PAGE = 18;

function ImageTagsContent() {
  const tTags = useTranslations('tags');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const placeholderImages = useLocalizedPlaceholderImages();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const {
    input: searchInput,
    setInput: setSearchInput,
    debounced: debouncedQuery,
    isPending: isSearchPending,
    clearSearch,
  } = useCatalogSearchUrl();

  const searchActive = debouncedQuery.trim().length > 0;

  const allImages = useMemo(
    () =>
      placeholderImages.filter(item => item.type === 'image' && item.imageUrl),
    [placeholderImages]
  );

  const {
    categories: imageTagsData,
    totalUniqueTags,
    facetIndex: tagFilterIndex,
  } = useImageTagsCatalogPipeline(allImages);

  useEffect(() => {
    const tag = searchParams.get('tag')?.trim() || null;
    setSelectedTag(prev => prev === tag ? prev : tag);
  }, [searchParams]);

  const filteredByTag = useMemo(() => {
    if (!selectedTag) return [];
    return filterItemsByTag(tagFilterIndex, selectedTag);
  }, [selectedTag, tagFilterIndex]);

  const baseForSearch = useMemo(() => {
    if (selectedTag) return filteredByTag;
    if (searchActive) return allImages;
    return [];
  }, [selectedTag, filteredByTag, allImages, searchActive]);

  const displayImages = useFuzzyFilter(
    baseForSearch,
    debouncedQuery,
    (item: ImagePlaceholder) => [
      item.title,
      item.description ?? '',
      ...item.tags,
      item.imageHint ?? '',
    ],
    item => item.id
  );

  const showResults = Boolean(selectedTag) || searchActive;

  const {
    items: paginatedImages,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    goFirst,
    rangeStart,
    rangeEnd,
    totalCount,
  } = useKeysetPaginationUrl(displayImages, item => item.id, ITEMS_PER_PAGE, {
    searchParams,
    pathname,
    router,
    resetDeps: [selectedTag, debouncedQuery],
  });

  const selectTag = (tagName: string) => {
    setSelectedTag(tagName);
    router.push(
      buildCatalogQueryUrl(pathname, searchParams, { tag: tagName }),
      { scroll: false }
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearTag = () => {
    setSelectedTag(null);
    router.push(buildCatalogQueryUrl(pathname, searchParams, { tag: null }), {
      scroll: false,
    });
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Explore Image Prompts by Tags
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Discover AI-generated images organized by{' '}
          <strong>{totalUniqueTags}</strong> unique tags across visual styles,
          subjects, compositions, brands & products, and lighting.
        </p>

        <SearchInput
          className="max-w-md mt-2"
          placeholder={tTags('searchPlaceholder')}
          value={searchInput}
          onValueChange={setSearchInput}
          isPending={isSearchPending}
        />

        {searchActive && (
          <p className="text-sm text-muted-foreground">
            {displayImages.length === 0
              ? tCommon('noResults')
              : tTags('resultsCount', {
                  count: displayImages.length,
                  query: debouncedQuery.trim(),
                })}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/image-prompts">{tTags('exploreAllImages')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/image-prompts?tag=nano%20banana">
              <Banana className="mr-2 h-4 w-4" />
              Nano Banana Pro
            </Link>
          </Button>
          <PromptEditButton href="/prompt/edit">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate an Image
          </PromptEditButton>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{tTags('copyInstantly')}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {imageTagsData.map((category, index) => (
          <Card
            key={category.name}
            className={cn(
              'p-6 md:p-8',
              index === 0 &&
                'bg-purple-50/20 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50',
              index === 1 &&
                'bg-green-50/20 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50',
              index === 2 &&
                'bg-blue-50/20 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
              index === 3 &&
                'bg-red-50/20 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50',
              index === 4 &&
                'bg-yellow-50/20 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/50'
            )}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 min-w-0">
              <div
                className={cn(
                  'p-2 rounded-full',
                  index === 0 &&
                    'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
                  index === 1 &&
                    'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                  index === 2 &&
                    'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                  index === 3 &&
                    'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
                  index === 4 &&
                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
                )}
              >
                {icons[category.icon] ?? icons.Palette}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-headline break-words min-w-0 flex-1">
                {category.name}
              </h2>
              <Badge variant="secondary">{category.count}</Badge>
            </div>
            <p className="text-muted-foreground mb-6">{category.description}</p>
            <div className="flex flex-wrap gap-3">
              {category.tags.map(tag => (
                <Button
                  key={tag.name}
                  variant={
                    selectedTag?.toLowerCase() === tag.name.toLowerCase()
                      ? 'default'
                      : 'outline'
                  }
                  className="h-auto"
                  onClick={() => selectTag(tag.name)}
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
              {searchActive && !selectedTag ? (
                <>
                  {tTags('searchResultsHeading')}{' '}
                  <span className="text-primary">
                    &quot;{debouncedQuery.trim()}&quot;
                  </span>
                </>
              ) : (
                <>
                  {tTags('imagesTaggedWith')}{' '}
                  <span className="text-primary">
                    &quot;{selectedTag}
                    {searchActive ? ` · ${debouncedQuery.trim()}` : ''}&quot;
                  </span>
                </>
              )}
            </h2>
            <div className="flex gap-2">
              {selectedTag ? (
                <Button variant="ghost" size="sm" onClick={clearTag}>
                  {tTags('clearTag')}
                </Button>
              ) : null}
              {searchActive ? (
                <Button variant="ghost" size="sm" onClick={clearSearch}>
                  {tTags('clearSearch')}
                </Button>
              ) : null}
            </div>
          </div>

          {displayImages.length > 0 ? (
            <>
              <p className="text-center text-sm text-muted-foreground mb-6">
                {displayImages.length} result
                {displayImages.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {paginatedImages.map(item => (
                  <PromptCatalogCard
                    key={item.id}
                    item={{ ...item, type: 'image' }}
                    galleryHref={`/gallery/${item.id}`}
                    headerClassName="p-4"
                    titleClassName="text-xl"
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
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
              <Search className="w-10 h-10 opacity-30" />
              <p>{tTags('noImagesForTag')}</p>
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

export default function ImageTagsClient() {
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
            <ImageTagsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
