'use client';

import { Button } from '@/components/ui/button';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ScrollVelocity } from '@/components/ui/scroll-velocity';
import { PromptCatalogCardHeader } from '@/components/prompt-catalog-card-header';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { usePagedPlaceholderImages } from '@/hooks/use-paged-catalog';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { Loader2, Tag, Wand2 } from 'lucide-react';
import { OptimizedImage } from '@/components/optimized-image';
import Link from 'next/link';
import { Suspense, useMemo } from 'react';

function ImageExamplesContent() {
  const placeholderImages = usePagedPlaceholderImages();
  const imageContent = useMemo(() => {
    const uniqueByTitle = new Map<string, ImagePlaceholder>();
    for (const item of placeholderImages.filter(entry => entry.type === 'image' && entry.imageUrl)) {
      if (!uniqueByTitle.has(item.title.toLowerCase())) {
        uniqueByTitle.set(item.title.toLowerCase(), item);
      }
    }
    const list = Array.from(uniqueByTitle.values());
    const productPhotography = list.filter(item => item.tags.includes('Product Photography'));
    const featured = productPhotography.length ? productPhotography : list;
    return [...featured, ...featured].slice(0, 14);
  }, [placeholderImages]);

  return (
    <div className="w-full overflow-hidden">
      <ScrollVelocity velocity={-1.5} className="py-4">
        {imageContent.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 inline-block align-top whitespace-normal"
          >
            <Card className="overflow-hidden group h-full flex flex-col bg-card border border-zinc-800/80">
              <PromptCatalogCardHeader
                title={item.title}
                membership={item.membership}
                className="p-4"
                titleClassName="text-base sm:text-lg"
              />
              <CardContent className="p-4 pt-0 space-y-3 flex-grow">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="truncate">{item.tags.join(', ')}</span>
                </div>
                <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-zinc-950">
                  <OptimizedImage
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    lazyAdaptive
                    sizes="(max-width: 640px) 280px, (max-width: 768px) 320px, 360px"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={item.imageHint}
                  />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 p-4 border-t border-zinc-800/80 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2">
                <LiquidButton size="sm" asChild>
                  <Link href={`/generate?prompt=${encodeURIComponent(item.description)}`}>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Use this prompt
                  </Link>
                </LiquidButton>
                 <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <Link href={`/gallery/${item.id}`}>View</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </ScrollVelocity>
    </div>
  );
}

export default function ImageExamples() {
  return (
    <Suspense fallback={<div className="flex w-full justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
      <ImageExamplesContent />
    </Suspense>
  );
}
