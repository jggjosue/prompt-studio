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
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { VideoProp } from '@/lib/placeholder-videos';
import {
  useLocalizedPlaceholderImages,
  useLocalizedPlaceholderVideos,
} from '@/hooks/use-localized-catalog';
import { useLocale } from 'next-intl';
import { evaluatePublisherPolicy } from '@/lib/google-publisher-policy';
import { isRenderableVideoUrl, resolveRenderableMediaUrl } from '@/lib/media-resolver';
import { ArrowLeft, Copy, Wand2 } from 'lucide-react';
import { LazyVideo } from '@/components/lazy-video';
import { OptimizedImage } from '@/components/optimized-image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

export default function GalleryDetailClient({ item }: { item: ImagePlaceholder | VideoProp }) {
  const locale = useLocale();
  const placeholderImages = useLocalizedPlaceholderImages();
  const placeholderVideos = useLocalizedPlaceholderVideos();
  const [otherItems, setOtherItems] = useState<Array<ImagePlaceholder | VideoProp>>([]);
  const [leftRandomImage, setLeftRandomImage] = useState<ImagePlaceholder | null>(null);

  useEffect(() => {
    const pool = [
      ...placeholderImages.filter(p => p.id !== item.id && p.imageUrl),
      ...placeholderVideos.filter(p => p.id !== item.id && p.imageUrl),
    ];
    const mechanicalHeart = pool.find(p => p.title === 'Mechanical Heart');
    const withoutMechanicalHeart = pool.filter(p => p.title !== 'Mechanical Heart');

    // Shuffle to get different "Discover More" results on each page visit.
    for (let i = withoutMechanicalHeart.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [withoutMechanicalHeart[i], withoutMechanicalHeart[j]] = [withoutMechanicalHeart[j], withoutMechanicalHeart[i]];
    }

    // Keep Mechanical Heart visible and fill the rest with random items.
    let nextOtherItems: Array<ImagePlaceholder | VideoProp>;
    if (mechanicalHeart) {
      nextOtherItems = [mechanicalHeart, ...withoutMechanicalHeart.slice(0, 2)];
    } else {
      nextOtherItems = withoutMechanicalHeart.slice(0, 3);
    }
    setOtherItems(nextOtherItems);

    const imagePool = placeholderImages.filter(
      p => p.id !== item.id && p.imageUrl && !isRenderableVideoUrl(p.imageUrl, p.type)
    );
    if (imagePool.length === 0) {
      setLeftRandomImage(null);
      return;
    }
    const idx = Math.floor(Math.random() * imagePool.length);
    setLeftRandomImage(imagePool[idx]);
  }, [item.id, placeholderImages, placeholderVideos]);
  
  const { toast } = useToast();
  const isPaywalled = useMemo(
    () => item.tags.some(tag => ['paywall', 'subscription', 'members only'].includes(tag.toLowerCase())),
    [item.tags]
  );
  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: item.title,
      description: item.description,
      isAccessibleForFree: !isPaywalled,
      hasPart: isPaywalled
        ? {
            '@type': 'WebPageElement',
            isAccessibleForFree: false,
            cssSelector: '.paywall',
          }
        : undefined,
    }),
    [item.title, item.description, isPaywalled]
  );
  const policyReview = useMemo(
    () =>
      evaluatePublisherPolicy({
        title: item.title,
        description: item.description,
        tags: item.tags,
      }),
    [item.title, item.description, item.tags]
  );

  const manualActionRisk = useMemo(() => {
    const allItems = [
      ...placeholderImages.filter(p => p.imageUrl),
      ...placeholderVideos.filter(p => p.imageUrl),
    ];
    const sameTitleCount = allItems.filter(
      p => p.title.trim().toLowerCase() === item.title.trim().toLowerCase()
    ).length;

    const plainText = item.description
      .replace(/[{}[\]":,]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const wordCount = plainText ? plainText.split(' ').length : 0;
    const hasLowValueContent = wordCount < 45;
    const hasDuplicateTitle = sameTitleCount > 1;

    return {
      hasLowValueContent,
      hasDuplicateTitle,
      wordCount,
      duplicateCount: sameTitleCount,
      hasRisk: hasLowValueContent || hasDuplicateTitle,
    };
  }, [item.title, item.description, placeholderImages, placeholderVideos]);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
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
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden border group">
                {isRenderableVideoUrl(item.imageUrl, item.type) ? (
                  <LazyVideo
                    src={item.imageUrl}
                    eager
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <OptimizedImage
                      src={resolveRenderableMediaUrl(item, locale)}
                      alt={item.title}
                      fill
                      priority
                      className="object-cover"
                      data-ai-hint={item.imageHint}
                    />
                    <div className="absolute bottom-4 right-4 flex items-start gap-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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
              {leftRandomImage && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold font-headline">Imagen aleatoria</h3>
                  <Link href={`/gallery/${leftRandomImage.id}`} className="group block">
                    <Card className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="relative aspect-[3/4]">
                          <OptimizedImage
                            src={leftRandomImage.imageUrl}
                            alt={leftRandomImage.title}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <p className="font-semibold line-clamp-1">{leftRandomImage.title}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )}

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
                    <p><strong>Targeted Promotion:</strong> Social media
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
                          {isRenderableVideoUrl(other.imageUrl, other.type) ? (
                            <LazyVideo
                              src={other.imageUrl}
                              muted
                              autoPlay
                              loop
                              preload="none"
                              className="object-cover transition-transform group-hover:scale-105 w-full h-full"
                            />
                          ) : (
                            <OptimizedImage
                              src={resolveRenderableMediaUrl(other, locale)}
                              alt={other.title}
                              fill
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
