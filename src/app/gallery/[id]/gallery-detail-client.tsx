'use client';

import {
  PlaceHolderImages,
  type ImagePlaceholder,
} from '@/lib/placeholder-images';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlayCircle, Heart, Download, Wand2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/layout/header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function GalleryDetailClient({ item }: { item: ImagePlaceholder }) {
  const otherItems = PlaceHolderImages.filter(
    p => p.id !== item.id && p.imageUrl
  ).slice(0, 3);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-12">
        <div className="container">
          <div className="mb-8">
            <Button variant="ghost" asChild size="sm">
              <Link href="/#gallery">
                <ArrowLeft className="mr-2" />
                Back to Gallery
              </Link>
            </Button>
          </div>
          <div className="grid lg:grid-cols-[1fr_340px] gap-12">
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
              <div className="relative aspect-video rounded-lg overflow-hidden border group">
                {item.type === 'video' ? (
                  <>
                    <Image
                      src={item.imageUrl}
                      alt={item.description}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <PlayCircle className="w-20 h-20 text-white/80" />
                    </div>
                  </>
                ) : (
                  <Image
                    src={item.imageUrl}
                    alt={item.description}
                    fill
                    className="object-cover"
                    data-ai-hint={item.imageHint}
                  />
                )}
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="sm" disabled>
                    <Heart className="mr-2" />
                    Like
                  </Button>
                  <Button size="sm" variant="secondary" asChild disabled>
                    <Link href={`/prompt/edit?prompt=${encodeURIComponent(item.description)}`}>
                        <Wand2 className="mr-2" />
                        Use this prompt
                    </Link>
                  </Button>
                </div>
              </div>

              <Accordion type="single" collapsible defaultValue="item-1">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold font-headline">
                    View Prompt
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground bg-muted/50 p-4 rounded-md">
                    {item.description}
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
                        <div className="relative aspect-video">
                          <Image
                            src={other.imageUrl}
                            alt={other.description}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                          {other.type === 'video' && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <PlayCircle className="w-10 h-10 text-white/80" />
                            </div>
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
                              <Heart className="w-4 h-4" />
                              <span>1.2k</span>
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
        </div>
      </main>
    </div>
  );
}
