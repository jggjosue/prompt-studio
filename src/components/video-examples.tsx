'use client';

import { useMemo } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VideoExamples() {

  const videoContent = useMemo(() => {
    return PlaceHolderImages.filter(item => item.type === 'video').slice(0,6);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {videoContent.map(item => (
        <Card key={item.id} className="overflow-hidden group h-full flex flex-col bg-card">
           <CardHeader>
             <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
             <CardDescription className="line-clamp-3 h-[60px]">{item.description}</CardDescription>
           </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4 flex-grow">
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
          <CardFooter className="bg-muted/50 p-4 border-t gap-2">
              <Button variant="outline" size="icon" asChild>
                 <Link href="/login">
                  <Heart className="w-4 h-4" />
                 </Link>
              </Button>
              <Button size="sm" asChild>
                 <Link href="/login">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Use this prompt
                 </Link>
              </Button>
              <Button variant="secondary" size="sm" asChild className="ml-auto">
                 <Link href={`/gallery/${item.id}`}>
                  View
                 </Link>
              </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
