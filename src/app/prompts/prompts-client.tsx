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
import { Folder, ChevronRight, Sparkles } from 'lucide-react';
import { PromptEditButton } from '@/components/prompt-edit-button';
import Link from 'next/link';
import { RelatedInternalLinks } from '@/components/related-internal-links';
import { SearchInput } from '@/components/search-input';
import { useSearchField } from '@/hooks/use-search-field';
import { Suspense, useMemo } from 'react';
import { useFuzzyFilter } from '@/hooks/use-fuzzy-filter';
import { promptModels } from '@/lib/models-list';
import { useTranslations } from 'next-intl';

function PromptsContent() {
  const t = useTranslations('prompts');
  const {
    input: searchTerm,
    setInput: setSearchTerm,
    debounced: debouncedSearch,
    isPending: isSearchPending,
  } = useSearchField();

  const filteredModels = useFuzzyFilter(
    promptModels,
    debouncedSearch,
    model => [model],
    model => model
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center space-y-6 text-center">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map((model) => (
          <Link 
            key={model} 
            href={`/prompts/${encodeURIComponent(model.toLowerCase().replace(/\s+/g, '-'))}`}
            className="group"
          >
            <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer overflow-hidden">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Folder className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                    {model}
                  </CardTitle>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
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

      {filteredModels.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">{t('noModels')}</p>
        </div>
      )}

      <RelatedInternalLinks className="max-w-4xl mx-auto" />

      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 text-center space-y-6 max-w-4xl mx-auto border border-primary/5">
        <Sparkles className="h-10 w-10 text-primary mx-auto" />
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
          <Suspense fallback={<div className="flex justify-center py-20">{t('loadingLibrary')}</div>}>
            <PromptsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
