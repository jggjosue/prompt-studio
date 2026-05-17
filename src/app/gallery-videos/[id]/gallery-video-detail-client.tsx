'use client';

import Footer from '@/components/layout/footer';
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
import { useToast } from '@/hooks/use-toast';
import type { VideoProp } from '@/lib/placeholder-videos';
import { useLocalizedPlaceholderVideos } from '@/hooks/use-localized-catalog';
import { ArrowLeft, Copy, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

export default function GalleryVideoDetailClient({ item }: { item: VideoProp }) {
  const placeholderVideos = useLocalizedPlaceholderVideos();
  const otherItems = useMemo(
    () => placeholderVideos.filter(p => p.id !== item.id).slice(0, 3),
    [item.id, placeholderVideos]
  );
  
  const { toast } = useToast();

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
        <div className="container min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-headline mb-2 text-balance">
                  {item.title}
                </h1>
                <div className="flex flex-wrap gap-2 mt-4">
                  {item.tags?.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden border group">
                <video
                    src={item.imageUrl}
                    playsInline
                    controls
                    className="w-full h-full object-cover"
                  />
                 <div className="absolute bottom-4 right-4 flex items-start gap-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="secondary" asChild>
                      <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
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
                  <AccordionContent className="relative text-base text-muted-foreground bg-muted/50 p-4 pr-12 rounded-md">
                    <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">
                      {item.description}
                    </pre>
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
                    href={`/gallery-videos/${other.id}`}
                    className="group block"
                  >
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-[9/16]">
                           <video
                              src={other.imageUrl}
                              playsInline
                              muted
                              className="object-cover transition-transform group-hover:scale-105 w-full h-full"
                            />
                        </div>
                        <div className="p-4">
                          <p className="font-semibold line-clamp-1">
                            {other.title}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-muted-foreground">
                              By AI Artist
                            </span>
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
              <Link href="/video-prompts">
                <ArrowLeft className="mr-2" />
                Back to Video Gallery
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
