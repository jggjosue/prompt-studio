'use client';

import { LazyVideo } from '@/components/lazy-video';
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
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useDailyCopyLimit } from '@/hooks/use-daily-copy-limit';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import type { VideoProp } from '@/lib/placeholder-videos';
import { getPlaceholderVideos } from '@/lib/placeholder-videos';
import { ArrowLeft, Copy, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';
import { PromptValidationCard } from '@/components/prompt-validation-card';
import type { PromptValidationReport } from '@/lib/prompt-validation';
import { useLocale } from 'next-intl';
import { PromptVersionManager } from '@/components/prompt-version-manager';
import { PromptGate } from '@/components/prompt-gate';

export default function GalleryVideoDetailClient({
  item,
  validation,
  poster,
}: {
  item: VideoProp;
  validation: PromptValidationReport;
  poster?: string;
}) {
  const locale = useLocale();
  const placeholderVideos = useMemo(() => getPlaceholderVideos(locale), [locale]);
  const otherItems = useMemo(() => {
    const itemTags = new Set((item.tags || []).filter((tag): tag is string => typeof tag === 'string'));
    return placeholderVideos
      .filter(candidate => candidate.id !== item.id)
      .sort((a, b) => b.tags.filter(tag => itemTags.has(tag)).length - a.tags.filter(tag => itemTags.has(tag)).length)
      .slice(0, 3);
  }, [item.id, item.tags, placeholderVideos]);
  
  const { toast } = useToast();
  const { copyWithDailyLimit } = useDailyCopyLimit();

  const handleCopy = async () => {
    const result = await copyWithDailyLimit(() =>
      copyToClipboard(item.description)
    );
    if (result === 'copied') {
        toast({
            title: "Copied!",
            description: "Prompt copied to clipboard.",
        });
    }
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
                  {(item.tags || []).filter((tag): tag is string => typeof tag === 'string' && tag.trim().length > 0).map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden border group bg-muted/40">
                <LazyVideo
                  src={item.imageUrl}
                  poster={poster}
                  preload="metadata"
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                />
                 <div className="absolute bottom-4 right-4 flex items-start gap-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <LiquidButton size="sm" asChild>
                      <Link href={`/generate?prompt=${encodeURIComponent(item.description)}`}>
                        <Wand2 className="mr-2" />
                        Use this prompt
                      </Link>
                    </LiquidButton>
                  </div>
              </div>

              <Accordion type="multiple">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold font-headline">
                    View Prompt
                  </AccordionTrigger>
                  <AccordionContent className="relative text-base text-muted-foreground bg-muted/50 p-4 rounded-md">
                    <PromptGate>
                      <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto pr-12">
                        {item.description}
                      </pre>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy prompt</span>
                      </Button>
                    </PromptGate>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-semibold font-headline">
                    Prompt versions
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <PromptGate>
                      <PromptVersionManager promptId={item.id} promptKind="video" title={item.title} initialContent={item.description} modelSnapshot={validation.compatibleModels.map(model => `${model.id}:${model.version}`)} locale={locale} />
                    </PromptGate>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <PromptValidationCard report={validation} locale={locale} showEstimates={false} />

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
                           <LazyVideo
                             src={other.imageUrl}
                             muted
                             playsInline
                             preload="metadata"
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
