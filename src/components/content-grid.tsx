'use client';

import { useMemo } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Heart, PlayCircle, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ContentGrid() {
  const content = useMemo(() => {
    return PlaceHolderImages.slice(0, 9);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold font-headline">
          Community Gallery
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col"
          >
            <CardHeader>
              <CardTitle className="font-headline text-xl">
                {item.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span>{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-video rounded-md overflow-hidden">
                {item.type === 'video' ? (
                  <>
                    <Image
                      src={item.imageUrl}
                      alt={item.description}
                      fill
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={item.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white/80" />
                    </div>
                  </>
                ) : (
                  <Image
                    src={item.imageUrl}
                    alt={item.description}
                    fill
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={item.imageHint}
                  />
                )}
              </div>
              {item.type === 'video' && (
                <p className="text-sm text-muted-foreground">
                  Duration: 5 seconds
                </p>
              )}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">
                  <Heart className="w-4 h-4" />
                </Link>
              </Button>
              <Button size="sm" asChild>
                <Link
                  href={`/prompt/edit?prompt=${encodeURIComponent(
                    item.description
                  )}`}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  Use this prompt
                </Link>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                asChild
                className="ml-auto"
              >
                <Link href={`/gallery/${item.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
