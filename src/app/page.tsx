import Faq from '@/components/faq';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid';
import { CircularTestimonials } from '@/components/ui/circular-testimonials';
import { Scroll3D } from '@/components/ui/scroll-3d';
import { Separator } from '@/components/ui/separator';
import { getPlaceholderImages } from '@/lib/placeholder-images';
import { getPlaceholderVideos } from '@/lib/placeholder-videos';
import { Bot, Clapperboard, Lightbulb } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
export default async function Home() {
  const t = await getTranslations('home');
  const locale = await getLocale();
  const examplePrompts = t.raw('examplePrompts') as string[];

  const rawImages = getPlaceholderImages(locale);
  const rawVideos = getPlaceholderVideos(locale);

  const parsePrompt = (item: any) => {
    try {
      const parsed = JSON.parse(item.description);
      return parsed.description || item.title;
    } catch (e) {
      return item.title;
    }
  };

  const listVideos = rawVideos.slice(0, 3).map((v) => ({
    quote: parsePrompt(v),
    name: v.title,
    designation: `${t('videoPrompt')} • ${v.tags.slice(0, 2).join(', ')}`,
    src: v.imageUrl,
    type: 'video' as const,
  }));

  const listImages = rawImages.slice(0, 3).map((img) => ({
    quote: parsePrompt(img),
    name: img.title,
    designation: `${t('imagePrompt')} • ${img.tags.slice(0, 2).join(', ')}`,
    src: img.imageUrl,
    type: 'image' as const,
  }));

  const testimonials = [];
  const maxLength = Math.max(listVideos.length, listImages.length);
  for (let i = 0; i < maxLength; i++) {
    if (i < listVideos.length) testimonials.push(listVideos[i]);
    if (i < listImages.length) testimonials.push(listImages[i]);
  }

  const aiModels = [
    {
      name: t('models.starlight.name'),
      description: t('models.starlight.description'),
      icon: <Bot className="h-6 w-6 text-blue-500" />,
    },
    {
      name: t('models.chrono.name'),
      description: t('models.chrono.description'),
      icon: <Clapperboard className="h-6 w-6 text-blue-500" />,
    },
    {
      name: t('models.dream.name'),
      description: t('models.dream.description'),
      icon: <Lightbulb className="h-6 w-6 text-blue-500" />,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 overflow-x-hidden">
        <Scroll3D direction="right">
          <section id="testimonials" className="w-full py-16 md:py-24 border-y border-zinc-900 bg-[#060507]">
            <div className="container px-4 md:px-6">
            <div className="flex justify-center items-center relative w-full">
              <CircularTestimonials
                testimonials={testimonials}
                autoplay={true}
                colors={{
                  name: "#ffffff",
                  designation: "#a1a1aa",
                  testimony: "#e4e4e7",
                  arrowBackground: "#18181b",
                  arrowForeground: "#ffffff",
                  arrowHoverBackground: "#2563EB",
                }}
                fontSizes={{
                  name: "24px",
                  designation: "14px",
                  quote: "16px",
                }}
              />
            </div>
          </div>
        </section>
        </Scroll3D>

        <Scroll3D direction="left">
          <section id="features" className="relative isolate w-full overflow-hidden py-8 md:py-16">
            <video
              src="/videos/3-video.mp4"
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-55 pointer-events-none"
            />
            <div className="absolute inset-0 -z-[5] bg-background/55 backdrop-blur-[1px]" />
            <div className="container px-4 md:px-6">
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
                  icon={<Bot className="h-6 w-6 text-blue-500" />}
                  className="md:col-span-1"
                  header={
                    <div className="flex-1 min-h-[6rem] w-full rounded-2xl bg-muted/40 border p-4 flex flex-col justify-center">
                      <ul className="space-y-3">
                        {aiModels.map(model => (
                          <li key={model.name} className="flex items-start gap-2.5">
                            <div className="p-1 bg-blue-500/10 rounded-full shrink-0">
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
                  icon={<Lightbulb className="h-6 w-6 text-blue-500" />}
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
            </div>
          </section>
        </Scroll3D>

        <Separator className="my-8" />

        <Scroll3D direction="right" intensity="soft">
          <Faq />
        </Scroll3D>
      </main>
      <Footer />
    </div>
  );
}
