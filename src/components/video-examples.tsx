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
import { useMemo, useState, useEffect } from 'react';

export default function VideoExamples() {
  const videoContent = useMemo(() => {
    return PlaceHolderVideos.slice(0, 9);
  }, []);

  const [likes, setLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({});

  useEffect(() => {
    const initialLikes: Record<string, { count: number; isLiked: boolean }> = {};
    videoContent.forEach(i => {
        if (i.imageUrl) {
          const deterministicCount = (parseInt(i.id.replace(/\D/g, '') || "0", 10) % 2400) + 100;
          initialLikes[i.id] = { count: deterministicCount, isLiked: false };
        }
    });
    setLikes(initialLikes);
  }, [videoContent]);

  const handleLike = (itemId: string) => {
    setLikes(prev => {
        const currentItem = prev[itemId];
        const newIsLiked = !currentItem.isLiked;
        const newCount = newIsLiked ? currentItem.count + 1 : currentItem.count - 1;
        return {
            ...prev,
            [itemId]: { count: newCount, isLiked: newIsLiked }
        };
    });
  };

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
            <CardFooter className="bg-muted/50 p-4 border-t flex items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <div className="flex flex-col items-center">
                  <Button variant="outline" size="icon" onClick={() => handleLike(item.id)}>
                      <Heart className="w-4 h-4" fill={likes[item.id]?.isLiked ? 'currentColor' : 'none'} />
                  </Button>
                  <span className="text-xs text-muted-foreground mt-1">{likes[item.id]?.count}</span>
                </div>
                <Button size="sm" asChild>
                  <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Use this prompt
                  </Link>
                </Button>
              </div>
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
