'use client';

import { Button } from '@/components/ui/button';
import { PromptCatalogCardHeader } from '@/components/prompt-catalog-card-header';
import {
  Card,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useLocalizedPlaceholderVideos } from '@/hooks/use-localized-catalog';
import type { VideoProp } from '@/lib/placeholder-videos';
import { LazyVideo } from '@/components/lazy-video';
import { Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

export default function VideoExamples() {
  const tCommon = useTranslations('common');
  const placeholderVideos = useLocalizedPlaceholderVideos();
  const videoContent = useMemo(() => {
    const uniqueByTitle = new Map<string, VideoProp>();
    for (const item of placeholderVideos) {
      if (!uniqueByTitle.has(item.title.toLowerCase())) {
        uniqueByTitle.set(item.title.toLowerCase(), item);
      }
    }
    return Array.from(uniqueByTitle.values()).slice(0, 9);
  }, [placeholderVideos]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {videoContent.map(item => (
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
                <LazyVideo
                  src={item.imageUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {tCommon('durationSeconds')}
              </p>
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
                <Link href={`/gallery-videos/${item.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
