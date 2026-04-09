'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function VideoExamples() {
  const videoContent = useMemo(() => {
    const uniqueByTitle = new Map<string, (typeof PlaceHolderVideos)[number]>();
    for (const item of PlaceHolderVideos) {
      if (!uniqueByTitle.has(item.title.toLowerCase())) {
        uniqueByTitle.set(item.title.toLowerCase(), item);
      }
    }
    return Array.from(uniqueByTitle.values()).slice(0, 9);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {videoContent.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col bg-card"
          >
            <CardHeader className="p-4">
              <CardTitle className="font-headline text-lg">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="truncate">{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                <video
                  src={item.imageUrl}
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">Duration: 5 seconds</p>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t flex items-center justify-between gap-2">
              <Button size="sm" asChild>
                <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
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
