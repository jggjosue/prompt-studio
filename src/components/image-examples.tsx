'use client';

import { useMemo } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function ImageExamples() {

  const imageContent = useMemo(() => {
    return PlaceHolderImages.filter(item => item.type === 'image').slice(0,3);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {imageContent.map(item => (
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
              <Image
                src={item.imageUrl}
                alt={item.description}
                fill
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={item.imageHint}
              />
            </div>
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
