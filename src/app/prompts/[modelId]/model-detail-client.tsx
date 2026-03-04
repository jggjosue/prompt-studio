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
import { ArrowLeft, Sparkles, Wand2, Box, FileText, Copy, Terminal, Bot, CheckCircle2, BookOpen, Lightbulb, MessageSquare, ListChecks } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
      <CardHeader className="bg-muted/30 pb-3">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className="mb-1 bg-primary/5 text-primary border-primary/20 uppercase text-[9px] tracking-widest">
              Protocol Block
            </Badge>
            <CardTitle className="text-lg font-headline flex items-center gap-2 line-clamp-1">
              <BookOpen className="h-4 w-4 text-primary" />
              {section.title}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
            <Copy className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4 flex-grow">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="bg-purple-500/10 p-1.5 rounded-md h-fit mt-0.5">
              <Bot className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1.5 tracking-tight">Technical Spec</p>
              <div className="bg-muted/20 p-3 rounded-md text-[11px] font-mono border whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/10">
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
                <div key={i} className="text-[10px] bg-primary/5 p-2 rounded border border-primary/10 space-y-1">
                  {ex.user && (
                    <p className="text-primary font-bold flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {ex.user}
                    </p>
                  )}
                  {ex.response && <p className="text-muted-foreground italic">Agent: {ex.response}</p>}
                  {ex.step && (
                    <p className="text-primary font-bold flex items-center gap-1">
                      <ListChecks className="h-3 w-3" /> Step {ex.step}
                    </p>
                  )}
                  {ex.action && <p className="text-muted-foreground">{ex.action}</p>}
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
        <Button variant="secondary" size="sm" className="w-full text-xs h-8" asChild>
          <Link href={`/prompt/edit?prompt=${encodeURIComponent(section.description)}`}>
            <Wand2 className="h-3.5 w-3.5 mr-2" />
            Test Prompt
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ModelDetailClient({ 
  modelName, 
  specialPrompt,
  jsonPrompts = []
}: { 
  modelName: string;
  specialPrompt?: string;
  jsonPrompts?: PromptBlock[];
}) {
  const { toast } = useToast();
  
  const relatedContent = useMemo(() => {
    const images = PlaceHolderImages.filter(item => 
      item.tags.some(tag => tag.toLowerCase() === modelName.toLowerCase()) ||
      item.title.toLowerCase().includes(modelName.toLowerCase())
    );
    const videos = PlaceHolderVideos.filter(item => 
      item.tags.some(tag => tag.toLowerCase() === modelName.toLowerCase()) ||
      item.title.toLowerCase().includes(modelName.toLowerCase())
    );
    return [...images, ...videos].slice(0, 6);
  }, [modelName]);

  const handleCopyRaw = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: "Raw protocol content copied to clipboard.",
      });
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <div className="mb-12">
            <Button variant="ghost" asChild size="sm" className="mb-4">
              <Link href="/prompts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Link>
            </Button>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/30 p-8 rounded-2xl border border-primary/5">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="bg-primary p-3 rounded-xl text-white shadow-lg shadow-primary/20">
                    <Box className="h-8 w-8" />
                  </div>
                  <h1 className="text-4xl font-bold font-headline">{modelName} Protocol</h1>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Expertly crafted prompts and instructions extracted from the {modelName} system. 
                  Master the patterns that power professional AI interactions.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="px-3 py-1 bg-green-500/10 text-green-600 border-green-500/20">{jsonPrompts.length || '30+'} Prompt Blocks</Badge>
                  <Badge variant="secondary" className="px-3 py-1 bg-blue-500/10 text-blue-600 border-blue-500/20">System Protocol</Badge>
                  <Badge variant="secondary" className="px-3 py-1 bg-purple-500/10 text-purple-600 border-purple-500/20">Optimized for Agents</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full md:w-auto shadow-md" asChild>
                  <Link href={`/prompt/edit?model=${encodeURIComponent(modelName)}`}>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Open Generator
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-16">
            {jsonPrompts.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-headline">Prompt Architecture</h2>
                    <p className="text-muted-foreground">Browse the {jsonPrompts.length} structured rules and examples for this system.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {jsonPrompts.map((section, idx) => (
                    <SectionCard key={idx} section={section} />
                  ))}
                </div>
              </section>
            )}

            {specialPrompt && (
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold font-headline">Raw Protocol Definition</h2>
                </div>
                <Card className="border-primary/10 bg-muted/20">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        {modelName.toLowerCase()}.yaml
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyRaw(specialPrompt)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Full Text
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="prompt-view" className="border-none px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="text-lg font-semibold">Inspect Complete System File</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="relative pb-6">
                            <pre className="p-6 rounded-xl bg-black/90 text-white font-mono text-xs leading-relaxed overflow-x-auto max-h-[600px] border shadow-inner scrollbar-thin scrollbar-thumb-white/10">
                              {specialPrompt}
                            </pre>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </section>
            )}

            <section>
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold font-headline">Visual Context Examples</h2>
              </div>
              
              {relatedContent.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedContent.map(item => (
                    <Card key={item.id} className="overflow-hidden group h-full flex flex-col hover:shadow-lg transition-all border-primary/5">
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
                              className="object-cover transition-transform group-hover:scale-105 duration-500"
                            />
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 p-4 border-t">
                        <Button variant="secondary" size="sm" className="w-full" asChild>
                          <Link href={item.type === 'video' ? `/gallery-videos/${item.id}` : `/gallery/${item.id}`}>
                            View Prompt JSON
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                  <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold">Explore the global gallery</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    No direct visual matches found for this model yet. Browse our full collection for inspiration.
                  </p>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link href="/image-prompts">
                      Browse Gallery
                    </Link>
                  </Button>
                </div>
              )}
            </section>

            <section className="bg-primary/5 p-8 rounded-3xl border border-primary/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Box className="h-32 w-32" />
              </div>
              <h2 className="text-2xl font-bold font-headline mb-6 flex items-center gap-2">
                <CheckCircle2 className="text-primary h-6 w-6" />
                Engineering Masterclass
              </h2>
              <div className="grid md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</div>
                    Context-Aware Strategy
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    The protocols define how an agent should react to ambiguity. Always provide the "Strategy" to set the right technical boundaries.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">2</div>
                    Iterative Validation
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Don't apply all protocols at once. Start with the "Agency" or "Task Management" blocks and scale up as the task grows in complexity.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">3</div>
                    Actionable Examples
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Each example shows the expected input and output. Use them to train your own models or calibrate existing coding assistants.
                  </p>
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
