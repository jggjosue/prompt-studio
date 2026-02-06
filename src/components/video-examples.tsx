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
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { Heart, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function VideoExamples() {
  const videoContent = useMemo(() => {
    return PlaceHolderVideos.slice(0, 9);
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
              <CardDescription className="line-clamp-3 h-auto">
                {item.description}
              </CardDescription>
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
            <CardFooter className="bg-muted/50 p-4 border-t flex-wrap gap-2">
              <Button variant="outline" size="icon" disabled={true}>
                <Heart className="w-4 h-4" />
              </Button>
              <Button asChild size="sm" className='disabled:pointer-events-none disabled:opacity-50'>
                <Link href={`/prompt/edit?prompt=${encodeURIComponent(item.description)}`} aria-disabled={true} tabIndex={-1}>
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
                <Link href={`/gallery/${item.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
