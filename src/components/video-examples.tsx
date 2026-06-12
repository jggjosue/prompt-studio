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
    // Return enough elements for a continuous loop in the marquee
    const list = Array.from(uniqueByTitle.values());
    return [...list, ...list].slice(0, 14);
  }, [placeholderVideos]);

  return (
    <div className="w-full overflow-hidden">
      <ScrollVelocity velocity={1.5} className="py-4">
        {videoContent.map((item, idx) => (
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
                  <LazyVideo
                    src={item.imageUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {tCommon('durationSeconds')}
                </p>
              </CardContent>
              <CardFooter className="bg-muted/30 p-4 border-t border-zinc-800/80 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2">
                <LiquidButton size="sm" asChild>
                  <Link href={`/prompt/edit?prompt=${encodeURIComponent(item.description)}`}>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Use this prompt
                  </Link>
                </LiquidButton>
                 <Button
                  variant="secondary"
                  size="sm"
                  asChild
                >
                  <Link href={`/gallery-videos/${item.id}`}>View</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </ScrollVelocity>
    </div>
  );
}
