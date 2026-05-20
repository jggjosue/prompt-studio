'use client';

import { PromptCatalogCardHeader } from '@/components/prompt-catalog-card-header';
import { LazyVideo } from '@/components/lazy-video';
import { OptimizedImage } from '@/components/optimized-image';
import { Button } from '@/components/ui/button';
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
};

function PromptCatalogCardComponent({
  item,
  galleryHref,
  aspectClassName = 'aspect-[3/4]',
  headerClassName,
  titleClassName,
}: PromptCatalogCardProps) {
  return (
    <Card className="overflow-hidden group h-full flex flex-col bg-card">
      <PromptCatalogCardHeader
        title={item.title}
        membership={item.membership}
        className={headerClassName}
        titleClassName={titleClassName}
      />
      <CardContent className="p-6 pt-0 space-y-4 flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="w-4 h-4 shrink-0" />
          <span className="truncate">{item.tags.join(', ')}</span>
        </div>
        <div className={`relative ${aspectClassName} rounded-md overflow-hidden`}>
          {item.type === 'video' ? (
            <LazyVideo
              src={item.imageUrl}
              controls
              className="w-full h-full object-cover"
            />
          ) : (
            <OptimizedImage
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              data-ai-hint={item.imageHint}
            />
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 border-t flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-2">
        <Button size="sm" asChild>
          <Link href={item.description ? `/prompt/edit?prompt=${encodeURIComponent(JSON.stringify({
            type: item.type,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            tags: item.tags
          }))}` : `/prompt/edit`}>
            <Wand2 className="w-4 h-4 mr-2" />
            Use this prompt
          </Link>
        </Button>
        <Button variant="secondary" size="sm" asChild>
          <Link href={galleryHref}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export const PromptCatalogCard = memo(PromptCatalogCardComponent);
