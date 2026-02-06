'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Heart, Tag, Wand2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

export default function ImageExamples() {
  const imageContent = useMemo(() => {
    return PlaceHolderImages.filter(
      item => item.type === 'image' && item.imageUrl
    ).slice(0, 9);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {imageContent.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col bg-card"
          >
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                {item.title}
              </CardTitle>
              <CardDescription className="line-clamp-3 h-[60px]">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="truncate">{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-video rounded-md overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.description}
                  fill
                  unoptimized={item.imageUrl?.includes('meta.ai')}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={item.imageHint}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t gap-2">
              <Button variant="outline" size="icon" disabled>
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="sm" disabled>
                <Wand2 className="w-4 h-4 mr-2" />
                Use this prompt
              </Button>
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="ml-auto"
              >
                <Link href={`/gallery/${item.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
