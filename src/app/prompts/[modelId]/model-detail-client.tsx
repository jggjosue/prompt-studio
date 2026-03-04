'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { ArrowLeft, Sparkles, Tag, Wand2, Box, Info } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';

export default function ModelDetailClient({ modelName }: { modelName: string }) {
  const relatedContent = useMemo(() => {
    const images = PlaceHolderImages.filter(item => 
      item.tags.some(tag => tag.toLowerCase() === modelName.toLowerCase()) ||
      item.title.toLowerCase().includes(modelName.toLowerCase())
    );
    const videos = PlaceHolderVideos.filter(item => 
      item.tags.some(tag => tag.toLowerCase() === modelName.toLowerCase()) ||
      item.title.toLowerCase().includes(modelName.toLowerCase())
    );
    return [...images, ...videos].slice(0, 12);
  }, [modelName]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <div className="mb-8">
            <Button variant="ghost" asChild size="sm" className="mb-4">
              <Link href="/prompts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/30 p-8 rounded-2xl border border-primary/5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-3 rounded-xl text-white">
                    <Box className="h-8 w-8" />
                  </div>
                  <h1 className="text-4xl font-bold font-headline">{modelName}</h1>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Curated resources, system prompts, and creative examples for {modelName} tools. 
                  Optimize your workflow with our production-ready prompt templates.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="px-3 py-1">AI Model</Badge>
                  <Badge variant="secondary" className="px-3 py-1">System Prompts</Badge>
                  <Badge variant="secondary" className="px-3 py-1">Optimized</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full md:w-auto" asChild>
                  <Link href={`/prompt/edit?model=${encodeURIComponent(modelName)}`}>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Use in Generator
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full md:w-auto" asChild>
                  <Link href={`/image-prompts?tag=${encodeURIComponent(modelName)}`}>
                    Explore All Assets
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-12">
            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold font-headline">Featured {modelName} Examples</h2>
              </div>
              
              {relatedContent.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedContent.map(item => (
                    <Card key={item.id} className="overflow-hidden group h-full flex flex-col">
                      <CardHeader className="p-4">
                        <CardTitle className="font-headline text-lg line-clamp-1">
                          {item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-4 flex-grow">
                        <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted">
                          {item.type === 'video' ? (
                            <video
                              src={item.imageUrl}
                              className="w-full h-full object-cover"
                              muted
                              playsInline
                            />
                          ) : (
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 p-4 border-t">
                        <Button variant="secondary" size="sm" className="w-full" asChild>
                          <Link href={item.type === 'video' ? `/gallery-videos/${item.id}` : `/gallery/${item.id}`}>
                            View Details
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                  <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">No direct examples yet</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    We're still curating the perfect assets for {modelName}. 
                    In the meantime, you can use our generator to create your own!
                  </p>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link href="/prompt/edit">
                      Open Generator
                    </Link>
                  </Button>
                </div>
              )}
            </section>

            <section className="bg-muted/30 p-8 rounded-2xl border">
              <h2 className="text-2xl font-bold font-headline mb-4">About {modelName} Integration</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <h3 className="font-bold mb-2">Capabilities</h3>
                  <p className="text-sm text-muted-foreground">
                    Leverage the full power of {modelName} architecture for complex reasoning, 
                    creative writing, or precise code generation depending on the model's specialty.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Best Practices</h3>
                  <p className="text-sm text-muted-foreground">
                    Always include context and clear instructions. {modelName} performs best when 
                    the persona and output format are explicitly defined in the system prompt.
                  </p>
                </div>
                <div>
                  <h3 className="font-bold mb-2">Resource Links</h3>
                  <div className="flex flex-col gap-2">
                    <Link href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
                      Documentation <ChevronRight className="h-3 w-3" />
                    </Link>
                    <Link href="#" className="text-sm text-primary hover:underline flex items-center gap-1">
                      API Reference <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
