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
import { useDailyCopyLimit } from '@/hooks/use-daily-copy-limit';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import type { VideoProp } from '@/lib/placeholder-videos';
import { useLocale } from 'next-intl';
import { isRenderableVideoUrl, resolveRenderableMediaUrl } from '@/lib/media-resolver';
import { ArrowLeft, Copy, Wand2 } from 'lucide-react';
import { OptimizedImage } from '@/components/optimized-image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { PromptValidationReport } from '@/lib/prompt-validation';
import type { ManualActionRisk } from '@/lib/gallery-detail';
import { LazyInView } from '@/components/lazy-in-view';
import { FreeEmailGate } from '@/components/free-email-gate';

const LazyVideo = dynamic(() => import('@/components/lazy-video').then(module => module.LazyVideo));
const PromptValidationCard = dynamic(() => import('@/components/prompt-validation-card').then(module => module.PromptValidationCard));
const PromptVersionManager = dynamic(() => import('@/components/prompt-version-manager').then(module => module.PromptVersionManager));

type Props = {
  item: ImagePlaceholder | VideoProp;
  validation: PromptValidationReport;
  relatedItems: Array<ImagePlaceholder | VideoProp>;
  manualActionRisk: ManualActionRisk;
};

export default function GalleryDetailClient({ item, validation, relatedItems, manualActionRisk: _manualActionRisk }: Props) {
  const locale = useLocale();
  
  const { toast } = useToast();
  const { copyWithDailyLimit } = useDailyCopyLimit();
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

  const [accordionValue, setAccordionValue] = useState<string[]>([]);
  const toggleAccordion = (val: string) => {
    setAccordionValue(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
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
                      sizes="(max-width: 1023px) 100vw, 50vw"
                      className="object-cover"
                      data-ai-hint={item.imageHint}
                    />
                    <div className="absolute bottom-4 right-4 flex items-start gap-4 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <Button size="sm" asChild>
                        <Link href={`/generate-images?prompt=${encodeURIComponent(JSON.stringify({
                          type: item.type || 'image',
                          title: item.title,
                          description: item.description,
                          imageUrl: resolveRenderableMediaUrl(item, locale),
                          tags: item.tags
                        }))}`}>
                            <Wand2 className="mr-2" />
                            Use this prompt
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
              <Accordion type="multiple" value={accordionValue} onValueChange={setAccordionValue}>
                <AccordionItem value="item-1">
                  <FreeEmailGate
                    title={locale === 'es' ? 'Accede al Prompt' : 'Access the Prompt'}
                    description={locale === 'es' ? 'Ingresa tu correo para ver los detalles del prompt.' : 'Enter your email to view prompt details.'}
                    submitText={locale === 'es' ? 'Ver Prompt' : 'View Prompt'}
                    onSuccess={() => toggleAccordion('item-1')}
                  >
                    <AccordionTrigger className="text-lg font-semibold font-headline">
                      View Prompt
                    </AccordionTrigger>
                  </FreeEmailGate>
                  <AccordionContent className="relative text-base text-muted-foreground bg-muted/50 p-4 rounded-md">
                      <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto pr-12">
                        {item.description}
                      </pre>
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy prompt</span>
                      </Button>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <FreeEmailGate
                    title={locale === 'es' ? 'Accede a las versiones' : 'Access versions'}
                    description={locale === 'es' ? 'Ingresa tu correo para ver los detalles de las versiones.' : 'Enter your email to view version details.'}
                    submitText={locale === 'es' ? 'Ver Versiones' : 'View Versions'}
                    onSuccess={() => toggleAccordion('item-2')}
                  >
                    <AccordionTrigger className="text-lg font-semibold font-headline">
                      Prompt versions
                    </AccordionTrigger>
                  </FreeEmailGate>
                  <AccordionContent className="pt-4">
                      <LazyInView kind="iframe" rootMargin="240px" className="min-h-48">
                        <PromptVersionManager promptId={item.id} promptKind={item.type === 'video' ? 'video' : 'image'} title={item.title} initialContent={item.description} modelSnapshot={validation.compatibleModels.map(model => `${model.id}:${model.version}`)} locale={locale} />
                      </LazyInView>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <LazyInView kind="iframe" rootMargin="320px" className="min-h-48">
                <PromptValidationCard report={validation} locale={locale} showEstimates={false} />
              </LazyInView>
              <LazyInView kind="iframe" rootMargin="240px" className="min-h-48">
                <PromptVersionManager promptId={item.id} promptKind={item.type === 'video' ? 'video' : 'image'} title={item.title} initialContent={item.description} modelSnapshot={validation.compatibleModels.map(model => `${model.id}:${model.version}`)} locale={locale} />
              </LazyInView>

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
                {relatedItems.map(other => (
                  <Link
                    key={other.id}
                    href={
                      other.type === 'video'
                        ? `/gallery-videos/${other.id}`
                        : `/gallery/${other.id}`
                    }
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
                              sizes="(max-width: 1023px) 100vw, 50vw"
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
