'use client';

import { Button } from '@/components/ui/button';
import { PromptCatalogCardHeader } from '@/components/prompt-catalog-card-header';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useLocalizedPlaceholderImages } from '@/hooks/use-localized-catalog';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Loader2, Tag, Wand2 } from 'lucide-react';
import { OptimizedImage } from '@/components/optimized-image';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';

function ImageExamplesContent() {
  const placeholderImages = useLocalizedPlaceholderImages();
  const imageContent = useMemo(() => {
    const uniqueByTitle = new Map<string, ImagePlaceholder>();
    for (const item of placeholderImages.filter(entry => entry.type === 'image' && entry.imageUrl)) {
      if (!uniqueByTitle.has(item.title.toLowerCase())) {
        uniqueByTitle.set(item.title.toLowerCase(), item);
      }
    }
    return Array.from(uniqueByTitle.values()).slice(0, 9);
  }, [placeholderImages]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {imageContent.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col bg-card"
          >
            <PromptCatalogCardHeader
              title={item.title}
              membership={item.membership}
              className="p-4"
              titleClassName="text-lg"
            />
            <CardContent className="p-4 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="truncate">{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <OptimizedImage
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={item.imageHint}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2">
              <Button size="sm" asChild>
                <Link href={`/prompt/edit?prompt=${encodeURIComponent(item.description)}`}>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Use this prompt
                </Link>
              </Button>
               <Button
                variant="secondary"
                size="sm"
                asChild
              >
                <Link href={`/gallery/${item.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function ImageExamples() {
  return (
    <Suspense fallback={<div className="flex w-full justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ImageExamplesContent />
    </Suspense>
  );
}
