'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardFooter,
} from '@/components/ui/card';
import { PromptCatalogCardHeader } from '@/components/prompt-catalog-card-header';
import { useLocalizedPlaceholderImages } from '@/hooks/use-localized-catalog';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Tag, Wand2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, Suspense } from 'react';
import { useTranslations } from 'next-intl';

function ContentGridContent() {
  const t = useTranslations('home');
  const tCommon = useTranslations('common');
  const placeholderImages = useLocalizedPlaceholderImages();
  const content = useMemo(() => {
    const uniqueByTitle = new Map<string, ImagePlaceholder>();
    for (const item of placeholderImages.filter(entry => entry.imageUrl)) {
      if (!uniqueByTitle.has(item.title.toLowerCase())) {
        uniqueByTitle.set(item.title.toLowerCase(), item);
      }
    }
    return Array.from(uniqueByTitle.values()).slice(0, 9);
  }, [placeholderImages]);

  return (
    <div className="space-y-4 md:space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold font-headline">
          {t('communityGallery')}
        </h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {content.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col"
          >
            <PromptCatalogCardHeader title={item.title} membership={item.membership} />
            <CardContent className="p-4 sm:p-6 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="truncate">{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  unoptimized={item.imageUrl?.includes('meta.ai')}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={item.imageHint}
                />
              </div>
              {item.type === 'video' && (
                <p className="text-sm text-muted-foreground">
                  {tCommon('durationSeconds')}
                </p>
              )}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2">
              <Button size="sm" asChild>
                <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                    <Wand2 className="w-4 h-4 mr-2" />
                    {tCommon('useThisPrompt')}
                </Link>
              </Button>
               <Button
                variant="secondary"
                size="sm"
                asChild
              >
                <Link href={`/gallery/${item.id}`}>{tCommon('view')}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function ContentGrid() {
  return (
    <Suspense fallback={<div className="flex w-full justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ContentGridContent />
    </Suspense>
  );
}
