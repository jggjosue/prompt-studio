'use client';

import { PromptCatalogCardHeader } from '@/components/prompt-catalog-card-header';
import { LazyVideo } from '@/components/lazy-video';
import { OptimizedImage } from '@/components/optimized-image';
import { Button } from '@/components/ui/button';
import { AdUnit } from '@/components/ad-unit';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParallaxReveal } from '@/components/ui/parallax-reveal';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

export type PromptCatalogItem = {
  id: string;
  title: string;
  imageUrl: string;
  imageHint?: string;
  membership?: string;
  tags: string[];
  type?: 'image' | 'video';
  description?: string;
};

type PromptCatalogCardProps = {
  item: PromptCatalogItem;
  galleryHref: string;
  aspectClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  animationIndex?: number;
  actionClassName?: string;
};

function PromptCatalogCardComponent({
  item,
  galleryHref,
  aspectClassName = 'aspect-[3/4]',
  headerClassName,
  titleClassName,
  animationIndex = 0,
  actionClassName,
}: PromptCatalogCardProps) {
  const eagerMedia = animationIndex === 0;

  return (
    <ParallaxReveal reverse={animationIndex % 2 === 1}>
      <Card className="overflow-hidden group h-full flex flex-col bg-card">
        <PromptCatalogCardHeader
          title={item.title}
          membership={item.membership}
          className={headerClassName}
          titleClassName={titleClassName}
          saveItem={{
            itemKind: item.type === 'video' ? 'video' : 'image',
            itemId: item.id,
            title: item.title,
            href: galleryHref,
            imageUrl: item.imageUrl,
          }}
        />
        <CardContent className="p-6 pt-0 space-y-4 flex-grow">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Tag className="w-4 h-4 shrink-0" />
            <span className="truncate">{item.tags.join(', ')}</span>
          </div>
          <div
            className={`relative ${aspectClassName} rounded-md overflow-hidden`}
          >
            {item.type === 'video' ? (
              <LazyVideo
                src={item.imageUrl}
                controls
                eager={eagerMedia}
                preload={eagerMedia ? 'auto' : 'metadata'}
                className="w-full h-full object-cover"
              />
            ) : (
              <OptimizedImage
                src={item.imageUrl}
                alt={item.title}
                fill
                priority={eagerMedia}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover"
                data-ai-hint={item.imageHint}
              />
            )}
          </div>
          <AdUnit />
        </CardContent>
        <CardFooter className="bg-muted/50 p-4 border-t flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2">
          <LiquidButton size="sm" className={actionClassName} asChild>
            <Link href={galleryHref}>
              <Wand2 className="w-4 h-4 mr-2" />
              Use this prompt
            </Link>
          </LiquidButton>
          <Button variant="secondary" size="sm" className={actionClassName} asChild>
            <Link href={`/generate?prompt=${encodeURIComponent(item.description || item.title)}`}>
              Personalizar
            </Link>
          </Button>

        </CardFooter>
      </Card>
    </ParallaxReveal>
  );
}

export const PromptCatalogCard = memo(PromptCatalogCardComponent);
