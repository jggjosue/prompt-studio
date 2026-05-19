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
import {
  useVideoTagAggregates,
  useVideoTagFilterIndex,
} from '@/hooks/use-catalog-hash-aggregation';
import { filterItemsByTag } from '@/lib/catalog-tag-aggregation';
import {
  Wand2,
  Banana,
  CheckCircle2,
  Search,
  Tag,
  Settings,
  Palette,
  Store,
} from 'lucide-react';
import { KeysetPagination } from '@/components/keyset-pagination';
import { cn } from '@/lib/utils';
import { useKeysetPagination } from '@/hooks/use-keyset-pagination';
import { useLocalizedPlaceholderVideos } from '@/hooks/use-localized-catalog';
import {
  buildCatalogQueryUrl,
  useCatalogSearchUrl,
} from '@/hooks/use-catalog-search-url';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import type { VideoProp } from '@/lib/placeholder-videos';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';

const icons: Record<string, ReactNode> = {
  Wand2: <Wand2 className="h-6 w-6" />,
  Tag: <Tag className="h-6 w-6" />,
  Settings: <Settings className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Store: <Store className="h-6 w-6" />,
};

const ITEMS_PER_PAGE = 18;

function VideoTagsContent() {
  const tTags = useTranslations('tags');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const placeholderVideos = useLocalizedPlaceholderVideos();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const {
    input: searchInput,
    setInput: setSearchInput,
    debounced: debouncedQuery,
    isPending: isSearchPending,
    clearSearch,
  } = useCatalogSearchUrl();

  const searchActive = debouncedQuery.trim().length > 0;

  const allVideos = useMemo(
    () =>
      placeholderVideos.filter(item => item.type === 'video' && item.imageUrl),
    [placeholderVideos]
  );

  const { categories: videoTagsData, totalUniqueTags } =
    useVideoTagAggregates(allVideos);
  const tagFilterIndex = useVideoTagFilterIndex(allVideos);

  useEffect(() => {
    const tag = searchParams.get('tag')?.trim();
    if (tag) setSelectedTag(tag);
  }, [searchParams]);

  const filteredByTag = useMemo(() => {
    if (!selectedTag) return [];
    return filterItemsByTag(tagFilterIndex, selectedTag);
  }, [selectedTag, tagFilterIndex]);

  const baseForSearch = useMemo(() => {
    if (selectedTag) return filteredByTag;
    if (searchActive) return allVideos;
    return [];
  }, [selectedTag, filteredByTag, allVideos, searchActive]);

  const displayVideos = useFuzzyFilter(
    baseForSearch,
    debouncedQuery,
    (item: VideoProp) => [
      item.title,
      item.description ?? '',
      ...item.tags,
      item.imageHint ?? '',
    ],
    item => item.id
  );

  const showResults = Boolean(selectedTag) || searchActive;

  const {
    items: paginatedVideos,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    rangeStart,
    rangeEnd,
    totalCount,
  } = useKeysetPagination(displayVideos, item => item.id, ITEMS_PER_PAGE, {
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
          Explore Video Prompts by Tags
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Discover AI-generated videos organized by{' '}
          <strong>{totalUniqueTags}</strong> unique tags across visual styles,
          settings, subjects, brands & products, and effects.
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
            {displayVideos.length === 0
              ? tCommon('noResults')
              : tTags('resultsCount', {
                  count: displayVideos.length,
                  query: debouncedQuery.trim(),
                })}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/video-prompts">{tTags('exploreAllVideos')}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/video-prompts?filter=nano-banana">
              <Banana className="mr-2 h-4 w-4" />
              Nano Banana Pro
            </Link>
          </Button>
          <PromptEditButton href="/prompt/edit">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate a Video
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
        {videoTagsData.map((category, index) => (
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
                {icons[category.icon] ?? icons.Tag}
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
                  {tTags('videosTaggedWith')}{' '}
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

          {displayVideos.length > 0 ? (
            <>
              <p className="text-center text-sm text-muted-foreground mb-6">
                {displayVideos.length} result
                {displayVideos.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {paginatedVideos.map(item => (
                  <PromptCatalogCard
                    key={item.id}
                    item={{ ...item, type: 'video' }}
                    galleryHref={`/gallery-videos/${item.id}`}
                    aspectClassName="aspect-[9/16]"
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
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                totalCount={totalCount}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
              <Search className="w-10 h-10 opacity-30" />
              <p>{tTags('noVideosForTag')}</p>
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

export default function VideoTagsClient() {
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
            <VideoTagsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
