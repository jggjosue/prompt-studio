'use client';

import Header from '@/components/layout/header';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    PlaceHolderImages,
    type ImagePlaceholder,
} from '@/lib/placeholder-images';
import {
    PlaceHolderVideos,
    type VideoProp,
} from '@/lib/placeholder-videos';
import { ArrowLeft, Heart, PlayCircle, Wand2, Copy } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Footer from '@/components/layout/footer';

export default function GalleryDetailClient({ item }: { item: ImagePlaceholder | VideoProp }) {
  const otherItems = [
    ...PlaceHolderImages.filter(p => p.id !== item.id && p.imageUrl),
    ...PlaceHolderVideos.filter(p => p.id !== item.id && p.imageUrl),
  ].slice(0, 3);
  
  const [likes, setLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({});
  const { toast } = useToast();

  useEffect(() => {
      const initialLikes: Record<string, { count: number; isLiked: boolean }> = {};
      [item, ...otherItems].forEach(i => {
          if (i.imageUrl) {
              initialLikes[i.id] = { count: Math.floor(Math.random() * 2500) + 100, isLiked: false };
          }
      });
      setLikes(initialLikes);
  }, [item, otherItems]);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(item.description).then(() => {
        toast({
            title: "Copied!",
            description: "Prompt copied to clipboard.",
        });
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">
                  {item.title}
                </h1>
                <p className="text-muted-foreground">{item.description}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags?.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden border group">
                {item.type === 'video' ? (
                  <video
                    src={item.imageUrl}
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <Image
                      src={item.imageUrl}
                      alt={item.description}
                      fill
                      unoptimized={item.imageUrl?.includes('meta.ai')}
                      className="object-cover"
                      data-ai-hint={item.imageHint}
                    />
                    <div className="absolute bottom-4 right-4 flex items-start gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col items-center gap-1 text-white">
                          <Button size="icon" variant="ghost" className="text-white bg-black/20 hover:text-white hover:bg-black/40" onClick={() => handleLike(item.id)}>
                              <Heart fill={likes[item.id]?.isLiked ? 'currentColor' : 'none'} className={likes[item.id]?.isLiked ? 'text-red-500' : ''} />
                          </Button>
                          <span className="text-xs font-semibold">{likes[item.id]?.count.toLocaleString()}</span>
                      </div>
                      <Button size="sm" variant="secondary" asChild>
                        <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                            <Wand2 className="mr-2" />
                            Use this prompt
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold font-headline">
                    View Prompt
                  </AccordionTrigger>
                  <AccordionContent className="relative text-base text-muted-foreground bg-muted/50 p-4 pr-12 rounded-md">
                    {item.description}
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy prompt</span>
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div>
                <h3 className="text-2xl font-bold font-headline mt-8 mb-4">
                  Optimization Tips
                </h3>
                <div className="space-y-6 text-muted-foreground">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      1. Decode Success Factors
                    </h4>
                    <p>
                      <strong>Engaging Content:</strong> The use of relatable
                      themes resonated with the audience.
                    </p>
                    <p>
                      <strong>High-Quality Visuals:</strong> AI tools enhanced
                      the visual appeal significantly.
                    </p>
                    <p>
                      <strong>Targeted Promotion:</strong> Social media
                      strategies broadened reach effectively.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      2. How to Replicate This Success
                    </h4>
                    <p>
                      <strong>Choose the Right Tool:</strong> Utilize AI video
                      generators like RunwayML or Pictory. I found that these
                      platforms provided intuitive interfaces and impressive
                      output quality.
                    </p>
                    <p>
                      <strong>Develop Scripts Using Prompts:</strong> Create
                      engaging scripts with video generation prompts
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-8">
              <h3 className="text-2xl font-bold font-headline">
                Discover More
              </h3>
              <div className="space-y-6">
                {otherItems.map(other => (
                  <Link
                    key={other.id}
                    href={`/gallery/${other.id}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-[3/4]">
                          {other.type === 'video' ? (
                            <video
                              src={other.imageUrl}
                              playsInline
                              autoPlay
                              muted
                              loop
                              className="object-cover transition-transform group-hover:scale-105 w-full h-full"
                            />
                          ) : (
                            <Image
                              src={other.imageUrl}
                              alt={other.description}
                              fill
                              unoptimized={other.imageUrl?.includes('meta.ai')}
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          )}
                        </div>
                        <div className="p-4">
                          <p className="font-semibold line-clamp-1">
                            {other.title}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">
                              By AI Artist
                            </span>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                               <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLike(other.id); }}>
                                <Heart className="w-4 h-4" fill={likes[other.id]?.isLiked ? 'currentColor' : 'none'} />
                              </Button>
                              <span>{likes[other.id]?.count.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </aside>
          </div>
          <div className="mt-12 flex justify-center">
            <Button variant="ghost" asChild size="sm">
              <Link href="/#gallery">
                <ArrowLeft className="mr-2" />
                Back to Gallery
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
