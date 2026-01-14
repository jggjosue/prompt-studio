import PromptGenerator from '@/components/prompt-generator';
import ContentGrid from '@/components/content-grid';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Clapperboard, Bot } from 'lucide-react';
import Header from '@/components/layout/header';
import Link from 'next/link';
import ModelCarousel from '@/components/model-carousel';
import VideoExamples from '@/components/video-examples';
import ImageExamples from '@/components/image-examples';
import Faq from '@/components/faq';

export default function Home() {
  const examplePrompts = [
    'A majestic lion with a steampunk monocle, portrait, detailed, intricate, sharp focus',
    'Synthwave sunset over a retro-futuristic city, neon lights, 80s aesthetic',
    'An enchanted forest with glowing mushrooms and ethereal creatures, fantasy, magical',
    'A high-speed chase with hovercrafts through a dense asteroid field, sci-fi, action',
  ];

  const aiModels = [
    {
      name: 'Starlight XL',
      description: 'Photorealistic image generation for stunning visuals.',
      icon: <Bot className="h-6 w-6 text-primary" />,
    },
    {
      name: 'Chrono-Animator',
      description: 'Transform static images into dynamic short videos.',
      icon: <Clapperboard className="h-6 w-6 text-primary" />,
    },
    {
      name: 'Dream Weaver 3',
      description: 'Create surreal and abstract art from simple text prompts.',
      icon: <Lightbulb className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-headline">
                Generate Your Next Vision
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Unleash your creativity with our AI-powered prompt generator. Type
                in your ideas and watch them come to life.
              </p>
            </div>
            <div className="mx-auto w-full max-w-2xl pt-12">
              <PromptGenerator />
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-28">
          <div className="container">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                Powerful AI Models at Your Fingertips
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Choose from industry-leading AI models for image and video
                generation. Each model offers unique capabilities to bring your
                creative vision to life.
              </p>
            </div>
            <ModelCarousel />
          </div>
        </section>

        <section id="gallery" className="w-full py-12 md:py-24 lg:py-28">
          <div className="container">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline mb-8 text-center">
              Featured Creations
            </h2>
            <ContentGrid />
          </div>
        </section>

        <section id="video-examples" className="w-full py-12 md:py-24 lg:py-28 bg-muted/30">
          <div className="container">
             <div className="flex flex-col items-center space-y-2 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                    Video Examples
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                    Discover high-quality AI video examples created with expertly crafted AI video prompts.
                </p>
            </div>
            <VideoExamples />
          </div>
        </section>

        <section id="image-examples" className="w-full py-12 md:py-24 lg:py-28">
          <div className="container">
             <div className="flex flex-col items-center space-y-2 text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
                    Image Examples
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                    Explore stunning AI-generated images and the prompts that created them.
                </p>
            </div>
            <ImageExamples />
          </div>
        </section>
        
        <Faq />


        <Separator className="my-8" />

        <section
          id="features"
          className="container grid gap-8 px-4 md:px-6 py-12 md:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold tracking-tighter font-headline mb-4">
              Explore Our Tools
            </h2>
            <p className="text-muted-foreground">
              Discover the models and inspiration behind the creations.
            </p>
          </div>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline">
                <Bot className="h-6 w-6" /> AI Model Showcase
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
              <CardTitle className="flex items-center gap-2 font-headline">
                <Lightbulb className="h-6 w-6" /> Example Prompts
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
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 Visionary Vault. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4"
            href="#"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
