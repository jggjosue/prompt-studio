'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Folder, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { PromptEditButton } from '@/components/prompt-edit-button';
import Link from 'next/link';
import { RelatedInternalLinks } from '@/components/related-internal-links';
import { SearchInput } from '@/components/search-input';
import { buildCatalogQueryUrl, useCatalogSearchUrl } from '@/hooks/use-catalog-search-url';
import { Suspense, useCallback } from 'react';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { promptModels } from '@/lib/models-list';
import { useTranslations } from 'next-intl';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { useMediaCatalogHashBundle } from '@/hooks/use-catalog-hash-bundle';
import { CatalogFacetBar } from '@/components/catalog-facet-bar';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const ITEMS_PER_PAGE = 18;

// Stable functions for filter/bundle
const getModelId = (model: string) => model;
const getModelTags = (model: string) => {
  const firstLetter = model.charAt(0).toUpperCase();
  return [/[A-Z]/.test(firstLetter) ? firstLetter : '#'];
};
const getModelFields = (model: string) => [model];

function PromptsContent() {
  const t = useTranslations('prompts');
  const tFacets = useTranslations('facets');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const facetTag = searchParams.get('tag')?.trim() || null;

  const { topTags, filtered: facetFiltered } = useMediaCatalogHashBundle(
    promptModels,
    getModelId,
    getModelTags,
    { tag: facetTag },
    { topN: 30, minCount: 1 }
  );

  const {
    input: searchTerm,
    setInput: setSearchTerm,
    debounced: debouncedSearch,
    isPending: isSearchPending,
    clearSearch,
  } = useCatalogSearchUrl();

  const filteredModels = useFuzzyFilter(
    facetFiltered,
    debouncedSearch,
    getModelFields,
    getModelId
  );

  const {
    visibleItems: paginatedModels,
    hasMore,
    observerTarget,
  } = useInfiniteScroll(filteredModels, ITEMS_PER_PAGE);

  const selectFacetTag = useCallback(
    (tag: string) => {
      const isRemoving = facetTag?.toLowerCase() === tag.toLowerCase();
      router.push(
        buildCatalogQueryUrl(pathname, searchParams, {
          tag: isRemoving ? null : tag,
        }),
        { scroll: false }
      );
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [facetTag, pathname, router, searchParams]
  );

  const clearFacets = useCallback(() => {
    router.push(buildCatalogQueryUrl(pathname, searchParams, { tag: null }), {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr] gap-8 items-start">
        <aside className="hidden md:flex flex-col sticky top-24 gap-4">
          <CatalogFacetBar
            topTags={topTags}
            activeTag={facetTag}
            onSelectTag={selectFacetTag}
            onClearFacets={clearFacets}
            orientation="vertical"
          />
          <p className="text-xs text-muted-foreground px-4">
            {tFacets('fullBrowse')}
          </p>
        </aside>

        <div className="flex flex-col space-y-6 min-w-0">
          <div className="flex flex-col items-center space-y-6 text-center mb-6">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-balance px-2">
              {t('title')}
            </h1>
            <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl">
              {t('subtitle')}
            </p>
            
            <SearchInput
              className="max-w-md"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onValueChange={setSearchTerm}
              isPending={isSearchPending}
              inputClassName="pl-10"
            />
          </div>

          <div className="md:hidden">
            <CatalogFacetBar
              topTags={topTags}
              activeTag={facetTag}
              onSelectTag={selectFacetTag}
              onClearFacets={clearFacets}
              orientation="horizontal"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 min-w-0">
            {paginatedModels.map((model) => (
              <Link 
                key={model} 
                href={`/prompts/${encodeURIComponent(model.toLowerCase().replace(/\s+/g, '-'))}`}
                className="group"
              >
                <Card className="hover:border-blue-500/50 transition-all hover:shadow-md cursor-pointer overflow-hidden h-full">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                        <Folder className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg font-bold group-hover:text-blue-500 transition-colors">
                        {model}
                      </CardTitle>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-0">
                    <p className="text-xs text-muted-foreground">
                      {t('browseCurated', { model })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {hasMore && (
            <div ref={observerTarget} className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {filteredModels.length === 0 && (
            <div className="text-center py-20 flex flex-col items-center gap-4">
              <p className="text-muted-foreground">{t('noModels')}</p>
              {(debouncedSearch || facetTag) && (
                <Button variant="outline" onClick={() => { clearSearch(); clearFacets(); }}>
                  {tFacets('clearFacets')}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <RelatedInternalLinks className="max-w-4xl mx-auto" />

      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 text-center space-y-6 max-w-4xl mx-auto border border-blue-500/5">
        <Sparkles className="h-10 w-10 text-blue-500 mx-auto" />
        <h2 className="text-2xl md:text-3xl font-bold">{t('customTitle')}</h2>
        <p className="text-muted-foreground">
          {t('customSubtitle')}
        </p>
        <PromptEditButton size="lg" href="/prompt/edit">
          {t('goToGenerator')}
        </PromptEditButton>
      </div>
    </div>
  );
}

export default function PromptsClient() {
  const t = useTranslations('prompts');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-7xl">
          <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-muted-foreground" /></div>}>
            <PromptsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
