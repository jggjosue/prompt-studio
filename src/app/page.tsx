import Faq from '@/components/faq';
import { HomeLinkHub } from '@/components/home-link-hub';
import ImageExamples from '@/components/image-examples';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import PromptGenerator from '@/components/prompt-generator';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import VideoExamples from '@/components/video-examples';
import { Bot, Clapperboard, Lightbulb, Loader2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Spotlight } from '@/components/ui/spotlight';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
export default async function Home() {
  const t = await getTranslations('home');
  const examplePrompts = t.raw('examplePrompts') as string[];

  const aiModels = [
    {
      name: t('models.starlight.name'),
      description: t('models.starlight.description'),
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
    {
      name: t('models.chrono.name'),
      description: t('models.chrono.description'),
      icon: <Clapperboard className="h-6 w-6 text-primary" />,
    },
    {
      name: t('models.dream.name'),
      description: t('models.dream.description'),
      icon: <Lightbulb className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1">
        <section className="w-full py-8 md:py-16 bg-muted/30 relative overflow-hidden">
          <Spotlight
            className="-top-40 left-0 md:left-60 md:-top-20"
            fill="purple"
          />
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                {t('heroTitle')}
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                {t('heroSubtitle')}
              </p>
            </div>
            <div className="mx-auto w-full max-w-2xl pt-8 md:pt-12">
              <Suspense fallback={<div className="flex w-full justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
                <PromptGenerator />
              </Suspense>
            </div>
          </div>
        </section>

        <section id="video-examples" className="w-full py-8 md:py-16 bg-muted/30">
          <div className="container">
             <div className="flex flex-col items-center space-y-2 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                  <Link href="/video-prompts" className="hover:text-primary transition-colors">
                    {t('videoExamplesTitle')}
                  </Link>
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                    {t('videoExamplesSubtitle')}
                </p>
            </div>
            <Suspense fallback={<div className="flex w-full justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}>
              <VideoExamples />
            </Suspense>
          </div>
        </section>

        <section id="image-examples" className="w-full py-8 md:py-16">
          <div className="container">
             <div className="flex flex-col items-center space-y-2 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                  <Link href="/image-prompts" className="hover:text-primary transition-colors">
                    {t('imageExamplesTitle')}
                  </Link>
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                    {t('imageExamplesSubtitle')}
                </p>
            </div>
            <ImageExamples />
          </div>
        </section>

        <section className="w-full bg-muted/30 border-y">
          <HomeLinkHub />
        </section>
        
        <Faq />

        <Separator className="my-8" />

        <section id="features" className="container py-8 md:py-16 px-4 md:px-6">
          <BentoGrid>
            <div className="flex flex-col justify-center p-6 row-span-1">
              <h2 className="text-3xl font-bold tracking-tighter font-headline mb-4">
                {t('exploreToolsTitle')}
              </h2>
              <p className="text-muted-foreground text-sm">
                {t('exploreToolsSubtitle')}
              </p>
            </div>
            
            <BentoGridItem
              title={t('modelShowcaseTitle')}
              icon={<Bot className="h-6 w-6 text-primary" />}
              className="md:col-span-1"
              header={
                <div className="flex-1 min-h-[6rem] w-full rounded-2xl bg-muted/40 border p-4 flex flex-col justify-center">
                  <ul className="space-y-3">
                    {aiModels.map(model => (
                      <li key={model.name} className="flex items-start gap-2.5">
                        <div className="p-1 bg-primary/10 rounded-full shrink-0">
                          {model.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-foreground leading-none">{model.name}</h4>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                            {model.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              }
            />

            <BentoGridItem
              title={t('examplePromptsTitle')}
              icon={<Lightbulb className="h-6 w-6 text-primary" />}
              className="md:col-span-1"
              header={
                <div className="flex-1 min-h-[6rem] w-full rounded-2xl bg-muted/40 border p-4 flex flex-col justify-center">
                  <ul className="space-y-1.5 list-disc list-inside text-[11px] text-muted-foreground font-medium">
                    {examplePrompts.map((prompt, i) => (
                      <li key={i} className="truncate">{prompt}</li>
                    ))}
                  </ul>
                </div>
              }
            />
          </BentoGrid>
        </section>
      </main>
      <Footer />
    </div>
  );
}
