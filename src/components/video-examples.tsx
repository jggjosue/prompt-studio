'use client';

import { useMemo } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Heart, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VideoExamples() {
  const videoContent = useMemo(() => {
    return PlaceHolderImages.filter(item => item.type === 'video').slice(0, 9);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {videoContent.map(item => (
          <Card
            key={item.id}
            className="overflow-hidden group h-full flex flex-col bg-card"
          >
            <CardHeader className="p-4">
              <CardTitle className="font-headline text-lg">
                {item.title}
              </CardTitle>
              <CardDescription className="line-clamp-3">
                {item.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4" />
                <span className="truncate">{item.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-video rounded-md overflow-hidden">
                <video
                  src="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
                  playsInline
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-muted-foreground">Duration: 5 seconds</p>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t gap-2 flex-wrap">
              <Button variant="outline" size="icon" disabled>
                <Heart className="w-4 h-4" />
              </Button>
              <Button size="sm" asChild disabled>
                <Link href={`/prompt/edit?prompt=${encodeURIComponent(item.description)}`}>
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
