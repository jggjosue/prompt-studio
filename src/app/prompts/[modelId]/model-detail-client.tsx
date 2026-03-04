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
import { ArrowLeft, Sparkles, Wand2, Box, Info, FileText, Copy, Terminal, User, Bot, CheckCircle2, BookOpen, Lightbulb } from 'lucide-react';
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

interface ParsedSection {
  title: string;
  content: string;
  usageInstructions: string;
}

function SectionCard({ section }: { section: ParsedSection }) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(section.content).then(() => {
      toast({
        title: "Section Copied!",
        description: `The "${section.title}" instructions are in your clipboard.`,
      });
    });
  };

  return (
    <Card className="border-primary/10 overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-sm hover:shadow-md transition-all">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 uppercase text-[10px] tracking-widest">
              Core Protocol
            </Badge>
            <CardTitle className="text-xl font-headline flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {section.title}
            </CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy Section Content">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6 flex-grow">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="bg-purple-500/10 p-2 rounded-lg h-fit mt-1">
              <Bot className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">System Instructions</p>
              <div className="bg-muted/20 p-4 rounded-md text-xs font-mono border whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto">
                {section.content}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-dashed">
          <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
            <Lightbulb className="h-4 w-4" />
            <h4 className="text-sm font-bold uppercase tracking-tight">How to apply this</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed italic">
            {section.usageInstructions}
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 p-4 border-t">
        <Button variant="secondary" size="sm" className="w-full" asChild>
          <Link href="/prompt/edit">
            <Wand2 className="h-4 w-4 mr-2" />
            Try in Editor
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ModelDetailClient({ 
  modelName, 
  specialPrompt 
}: { 
  modelName: string;
  specialPrompt?: string;
}) {
  const { toast } = useToast();
  
  const parsedSections: ParsedSection[] = useMemo(() => {
    if (!specialPrompt || modelName.toLowerCase() !== 'amp') return [];

    // Buscamos el bloque de texto del sistema dentro del YAML
    const systemTextMatch = specialPrompt.match(/text: >\+?\s+([\s\S]*?)(?=tools:|$)/);
    const textContent = systemTextMatch ? systemTextMatch[1] : specialPrompt;

    // Dividimos por "# " para separar las secciones
    const rawParts = textContent.split(/\n#\s+/);
    
    return rawParts.filter(part => part.trim().length > 0).map(part => {
      const lines = part.split('\n');
      const title = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();
      
      // Generamos una instrucción de uso basada en el título
      let usage = "Follow these guidelines when prompting the agent to ensure consistent and high-quality outputs.";
      if (title.toLowerCase().includes('agency')) usage = "Use these rules to define how the agent should take initiative and handle your requests without over-explaining.";
      if (title.toLowerCase().includes('oracle')) usage = "Invoke 'The Oracle' when you need architectural advice, complex debugging, or multi-file analysis.";
      if (title.toLowerCase().includes('task')) usage = "Ask the agent to 'plan and execute' to trigger the TODO system for transparent progress tracking.";
      if (title.toLowerCase().includes('conventions')) usage = "Ensure the agent follows specific project styles, security practices, and file handling rules.";
      if (title.toLowerCase().includes('communication')) usage = "Enforce concise, direct, and token-efficient responses from the agent.";

      return { title, content, usageInstructions: usage };
    });
  }, [specialPrompt, modelName]);

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
        description: "Raw YAML content copied to clipboard.",
      });
    });
  };

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
                  <div className="bg-primary p-3 rounded-xl text-white shadow-lg shadow-primary/20">
                    <Box className="h-8 w-8" />
                  </div>
                  <h1 className="text-4xl font-bold font-headline">{modelName}</h1>
                </div>
                <p className="text-muted-foreground text-lg max-w-2xl">
                  Explore the system instructions for the {modelName} agent. 
                  Master the protocol patterns to build better coding assistants.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="px-3 py-1 bg-green-500/10 text-green-600 border-green-500/20">System Protocol</Badge>
                  <Badge variant="secondary" className="px-3 py-1 bg-blue-500/10 text-blue-600 border-blue-500/20">Pattern Library</Badge>
                  <Badge variant="secondary" className="px-3 py-1 bg-purple-500/10 text-purple-600 border-purple-500/20">Sourcegraph Amp</Badge>
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
            {parsedSections.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-headline">Prompt Architecture</h2>
                    <p className="text-muted-foreground">Each section defines a specific behavior of the {modelName} system prompt.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {parsedSections.map((section, idx) => (
                    <SectionCard key={idx} section={section} />
                  ))}
                </div>
              </section>
            )}

            {specialPrompt && (
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-bold font-headline">Source Definition</h2>
                </div>
                <Card className="border-primary/10 bg-muted/20">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Terminal className="h-4 w-4" />
                        amp.yaml
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleCopyRaw(specialPrompt)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Raw
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="prompt-view" className="border-none px-6">
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="text-lg font-semibold">View Full System YAML</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="relative pb-6">
                            <pre className="p-6 rounded-xl bg-black/90 text-white font-mono text-xs leading-relaxed overflow-x-auto max-h-[600px] border shadow-inner">
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
                <h2 className="text-2xl font-bold font-headline">Related Visual Assets</h2>
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
                  <h3 className="text-xl font-semibold">Explore more prompts</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Check out our global gallery for more inspiration across all AI models.
                  </p>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link href="/image-prompts">
                      Go to Gallery
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
                Amp Agent Mastery
              </h2>
              <div className="grid md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
                    Context First
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Amp is designed to search your codebase. Always provide specific file paths or ask it to scan relevant directories before starting.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</div>
                    Reasoning Loop
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For complex logic errors, ask Amp to "think out loud" or consult its internal reasoning model to avoid shallow fixes.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">3</div>
                    Iterative Edits
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Instead of one massive prompt, break tasks into smaller logical steps. Amp handles atomic changes with much higher precision.
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
