'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { PromptCatalogCardHeader } from '@/components/prompt-catalog-card-header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useLocalizedPlaceholderImages,
  useLocalizedPlaceholderVideos,
} from '@/hooks/use-localized-catalog';
import { ArrowLeft, Sparkles, Wand2, Box, Copy, Bot, CheckCircle2, BookOpen, Lightbulb, MessageSquare, ListChecks, Terminal } from 'lucide-react';
import Image from 'next/image';
import { PromptEditButton } from '@/components/prompt-edit-button';
import Link from 'next/link';
import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Example {
  user?: string;
  response?: string;
  step?: number;
  action?: string;
}

interface PromptBlock {
  title: string;
  description: string;
  how_to_use_prompt?: string;
  examples?: Example[];
}

function SectionCard({ section }: { section: PromptBlock }) {
  const { toast } = useToast();

  const handleCopy = () => {
    const contentToCopy = `${section.description}\n\n${section.how_to_use_prompt || ''}`;
    navigator.clipboard.writeText(contentToCopy).then(() => {
      toast({
        title: "Prompt Copied!",
        description: `Protocol for "${section.title}" is ready to use.`,
      });
    });
  };

  return (
    <Card className="border-primary/10 overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-sm hover:shadow-md transition-all group">
      <CardHeader className="bg-muted/30 pb-3 p-4 sm:p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className="mb-1 bg-primary/5 text-primary border-primary/20 uppercase text-[9px] tracking-widest">
              Protocol Block
            </Badge>
            <CardTitle className="text-lg font-bold flex items-center gap-2 line-clamp-1">
              <BookOpen className="h-4 w-4 text-primary" />
              {section.title}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-5 space-y-4 flex-grow">
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
              <Terminal className="h-3 w-3 text-primary" />
              Technical Spec
            </div>
            <div className="relative group/spec">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary/30 rounded-full group-hover/spec:bg-primary transition-colors" />
              <div className="bg-zinc-950 dark:bg-zinc-900/80 p-4 pl-5 rounded-md text-[11px] font-mono text-zinc-300 dark:text-zinc-400 border border-white/5 whitespace-pre-wrap leading-relaxed max-h-[250px] overflow-y-auto shadow-inner scrollbar-thin scrollbar-thumb-white/10">
                {section.description}
              </div>
            </div>
          </div>
        </div>

        {section.examples && section.examples.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Examples</p>
            <div className="space-y-2">
              {section.examples.map((ex, i) => (
                <div key={i} className="text-[10px] bg-primary/5 p-3 rounded border border-primary/10 space-y-1 hover:bg-primary/10 transition-colors">
                  {ex.user && (
                    <p className="text-primary font-bold flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3" /> {ex.user}
                    </p>
                  )}
                  {ex.response && <p className="text-muted-foreground italic leading-relaxed">Agent: {ex.response}</p>}
                  {ex.step && (
                    <p className="text-primary font-bold flex items-center gap-1.5">
                      <ListChecks className="h-3 w-3" /> Step {ex.step}
                    </p>
                  )}
                  {ex.action && <p className="text-muted-foreground leading-relaxed">{ex.action}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {section.how_to_use_prompt && (
          <div className="pt-3 border-t border-dashed">
            <div className="flex items-center gap-1.5 mb-1.5 text-amber-600 dark:text-amber-400">
              <Lightbulb className="h-3.5 w-3.5" />
              <h4 className="text-[11px] font-bold uppercase tracking-tight">Usage Strategy</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-4">
              {section.how_to_use_prompt}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/10 p-3 border-t">
        <PromptEditButton
          variant="secondary"
          size="sm"
          className="w-full text-xs h-8"
          href={`/prompt/edit?prompt=${encodeURIComponent(section.description)}`}
        >
          <Wand2 className="h-3.5 w-3.5 mr-2" />
          Test Prompt
        </PromptEditButton>
      </CardFooter>
    </Card>
  );
}

export default function ModelDetailClient({ 
  modelName, 
  jsonPrompts = []
}: { 
  modelName: string;
  specialPrompt?: string;
  jsonPrompts?: PromptBlock[];
}) {
  const placeholderImages = useLocalizedPlaceholderImages();
  const placeholderVideos = useLocalizedPlaceholderVideos();

  const relatedContent = useMemo(() => {
    const modelSlug = modelName.toLowerCase();
    const images = placeholderImages.filter(item => 
      item.tags.some(tag => tag.toLowerCase() === modelSlug) ||
      item.title.toLowerCase().includes(modelSlug)
    );
    const videos = placeholderVideos.filter(item => 
      item.tags.some(tag => tag.toLowerCase() === modelSlug) ||
      item.title.toLowerCase().includes(modelSlug)
    );
    return [...images, ...videos].slice(0, 6);
  }, [modelName, placeholderImages, placeholderVideos]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-8 md:py-16">
        <div className="container max-w-7xl px-4 sm:px-6">
          <div className="mb-8 md:mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/30 p-6 sm:p-8 rounded-2xl border border-primary/5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-2 sm:p-3 rounded-xl text-white shadow-lg shadow-primary/20">
                    <Box className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-bold">{modelName} Protocol</h1>
                </div>
                <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl">
                  Expertly crafted prompts and instructions extracted from the {modelName} system. 
                  Master the patterns that power professional AI interactions.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500/10 text-green-600 border-green-500/20 text-[10px] sm:text-xs">{jsonPrompts.length} Blocks</Badge>
                  <Badge variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] sm:text-xs">System Protocol</Badge>
                  <Badge variant="secondary" className="px-2 sm:px-3 py-0.5 sm:py-1 bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] sm:text-xs">Optimized</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <PromptEditButton
                  size="lg"
                  className="w-full md:w-auto shadow-md text-sm sm:text-base"
                  href={`/prompt/edit?model=${encodeURIComponent(modelName)}`}
                >
                  <Wand2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                  Open Generator
                </PromptEditButton>
              </div>
            </div>
          </div>

          <div className="grid gap-12 md:gap-16">
            {jsonPrompts.length > 0 && (
              <section className="space-y-6 sm:space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold">Prompt Architecture</h2>
                    <p className="text-xs sm:text-muted-foreground">Browse structured rules and examples for this system.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {jsonPrompts.map((section, idx) => (
                    <SectionCard key={idx} section={section} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-lg sm:text-2xl font-bold">Visual Context Examples</h2>
              </div>
              
              {relatedContent.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {relatedContent.map(item => (
                    <Card key={item.id} className="overflow-hidden group h-full flex flex-col hover:shadow-lg transition-all border-primary/5">
                      <PromptCatalogCardHeader
                        title={item.title}
                        membership={item.membership}
                        className="p-4"
                        titleClassName="text-base sm:text-lg font-bold line-clamp-1"
                      />
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
                              className="object-cover transition-transform group-hover:scale-105 duration-500"
                            />
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 p-3 sm:p-4 border-t flex justify-end">
                        <Button variant="secondary" size="sm" className="text-xs" asChild>
                          <Link href={item.type === 'video' ? `/gallery-videos/${item.id}` : `/gallery/${item.id}`}>
                            View
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 sm:py-20 bg-muted/20 rounded-xl border border-dashed px-4">
                  <Bot className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold">Explore the global gallery</h3>
                  <p className="text-xs sm:text-muted-foreground mt-2 max-w-sm mx-auto">
                    No direct visual matches found for this model yet. Browse our full collection for inspiration.
                  </p>
                  <Button variant="outline" className="mt-6 w-full sm:w-auto" asChild>
                    <Link href="/image-prompts">
                      Browse Gallery
                    </Link>
                  </Button>
                </div>
              )}
            </section>

            <section className="bg-primary/5 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-5 sm:opacity-10 pointer-events-none">
                <Box className="h-24 w-24 sm:h-32 sm:w-32" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                Engineering Masterclass
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0">1</div>
                    Context-Aware Strategy
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The protocols define how an agent should react to ambiguity. Always provide the "Strategy" to set the right technical boundaries.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0">2</div>
                    Iterative Validation
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Don't apply all protocols at once. Start with the "Agency" or "Task Management" blocks and scale up as the task grows in complexity.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] shrink-0">3</div>
                    Actionable Examples
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Each example shows the expected input and output. Use them to train your own models or calibrate existing coding assistants.
                  </p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-12 flex justify-center">
            <Button variant="ghost" asChild size="sm">
              <Link href="/prompts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
