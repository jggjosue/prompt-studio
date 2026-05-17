import ContentGrid from '@/components/content-grid';
import Faq from '@/components/faq';
import ImageExamples from '@/components/image-examples';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import PromptGenerator from '@/components/prompt-generator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import VideoExamples from '@/components/video-examples';
import { Bot, Clapperboard, Lightbulb, Loader2 } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
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
        <section className="w-full py-8 md:py-16 bg-muted/30">
          <div className="container px-4 md:px-6">
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
                    {t('videoExamplesTitle')}
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
                    {t('imageExamplesTitle')}
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                    {t('imageExamplesSubtitle')}
                </p>
            </div>
            <ImageExamples />
          </div>
        </section>
        
        <Faq />

        <Separator className="my-8" />

        <section
          id="features"
          className="container grid gap-4 md:gap-8 px-4 md:px-6 py-8 md:py-16 md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold tracking-tighter font-headline mb-4">
              {t('exploreToolsTitle')}
            </h2>
            <p className="text-muted-foreground">
              {t('exploreToolsSubtitle')}
            </p>
          </div>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                <Bot className="h-6 w-6" /> {t('modelShowcaseTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {aiModels.map(model => (
                  <li key={model.name} className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {model.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{model.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {model.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl md:text-2xl">
                <Lightbulb className="h-6 w-6" /> {t('examplePromptsTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 list-disc list-inside text-sm text-muted-foreground">
                {examplePrompts.map((prompt, i) => (
                  <li key={i}>{prompt}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}
