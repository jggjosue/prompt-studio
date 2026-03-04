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
import { ArrowLeft, Sparkles, Wand2, Box, Info, FileText, Copy, Terminal, User, Bot, CheckCircle2 } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface AmpExample {
  title: string;
  category: string;
  userQuery: string;
  assistantResponse: string;
  usageInstructions: string;
}

function AmpExampleCard({ example }: { example: AmpExample }) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(example.userQuery).then(() => {
      toast({
        title: "Prompt Copied!",
        description: "The example query is ready to use.",
      });
    });
  };

  return (
    <Card className="border-primary/10 overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-muted/30 pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Badge variant="outline" className="mb-2 bg-primary/5 text-primary border-primary/20 uppercase text-[10px] tracking-widest">
              {example.category}
            </Badge>
            <CardTitle className="text-xl font-headline">{example.title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={handleCopy} title="Copy User Query">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6 flex-grow">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="bg-blue-500/10 p-2 rounded-lg h-fit mt-1">
              <User className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">User Query</p>
              <div className="bg-muted/50 p-3 rounded-md text-sm border italic">
                "{example.userQuery}"
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-purple-500/10 p-2 rounded-lg h-fit mt-1">
              <Bot className="h-4 w-4 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Agent Response Pattern</p>
              <div className="bg-muted/20 p-3 rounded-md text-xs font-mono border whitespace-pre-wrap">
                {example.assistantResponse}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-dashed">
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Terminal className="h-4 w-4" />
            <h4 className="text-sm font-bold uppercase tracking-tight">How to use</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {example.usageInstructions}
          </p>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/10 p-4 border-t">
        <Button variant="secondary" size="sm" className="w-full" asChild>
          <Link href="/prompt/edit">
            <Wand2 className="h-4 w-4 mr-2" />
            Try similar pattern
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

  const ampExamples: AmpExample[] = useMemo(() => {
    if (modelName.toLowerCase() !== 'amp' || !specialPrompt) return [];

    return [
      {
        title: "Development Build",
        category: "Agency & Environment",
        userQuery: "Which command should I run to start the development build?",
        assistantResponse: "[uses list_directory, then reads relevant files and docs]\n\ncargo run",
        usageInstructions: "Use this to understand the environment. Amp first explorers the codebase to find scripts before guessing commands."
      },
      {
        title: "Architecture Analysis",
        category: "Oracle Advisory",
        userQuery: "How are the different services connected?",
        assistantResponse: "[uses codebase_search_agent and Read to analyze architecture]\n\nThe system uses a microservice architecture...\n\n[renders a diagram with mermaid]",
        usageInstructions: "Perfect for high-level technical reviews. Invoke the Oracle when you need a multi-file analysis or diagrams."
      },
      {
        title: "Multi-step Implementation",
        category: "Task Management",
        userQuery: "Run the build and fix any type errors",
        assistantResponse: "[uses todo_write to plan tasks]\n[runs build, finds errors]\n[marks tasks as in_progress/completed]",
        usageInstructions: "Always ask Amp to 'plan and execute'. This forces the agent to use the TODO system for maximum transparency."
      },
      {
        title: "Automated Testing",
        category: "Quality Assurance",
        userQuery: "write tests for new feature",
        assistantResponse: "[uses Grep to find existing test patterns]\n[reads relevant implementation files]\n[uses edit_file to add new tests]",
        usageInstructions: "Ensure you have existing tests. Amp will mimic your current testing suite (Jest, PyTest, GoTest) automatically."
      },
      {
        title: "Precise Debugging",
        category: "Oracle Advisory",
        userQuery: "I'm getting race conditions in this file, can you help?",
        assistantResponse: "[runs test to confirm]\n[consults Oracle with file context]\n[suggests fix based on reasoning]",
        usageInstructions: "When facing complex bugs, specifically mention 'the oracle' to trigger deep reasoning mode (o3-powered analysis)."
      },
      {
        title: "Git Workflow",
        category: "Version Control",
        userQuery: "commit the changes",
        assistantResponse: "[uses Bash to run git status]\n[shows staged/unstaged files]\n[runs git commit -m '...']",
        usageInstructions: "Safely manage commits. Amp will always ask for verification of the staged files before committing."
      }
    ];
  }, [modelName, specialPrompt]);

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
                  Advanced engineering patterns for the {modelName} agent. 
                  Master tools like Oracle, Task and Bash with these curated system interaction examples.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="px-3 py-1 bg-green-500/10 text-green-600 border-green-500/20">Active Agent</Badge>
                  <Badge variant="secondary" className="px-3 py-1 bg-blue-500/10 text-blue-600 border-blue-500/20">o3-Reasoning</Badge>
                  <Badge variant="secondary" className="px-3 py-1 bg-purple-500/10 text-purple-600 border-purple-500/20">Auto-TODO</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full md:w-auto shadow-md" asChild>
                  <Link href={`/prompt/edit?model=${encodeURIComponent(modelName)}`}>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Open Generator
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="w-full md:w-auto" asChild>
                  <Link href={`/image-prompts?tag=${encodeURIComponent(modelName)}`}>
                    Explore Assets
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-16">
            {ampExamples.length > 0 && (
              <section className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold font-headline">Interactive Examples</h2>
                    <p className="text-muted-foreground">Standardized interaction patterns extracted from the system prompt.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ampExamples.map((example, idx) => (
                    <AmpExampleCard key={idx} example={example} />
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
                          <span className="text-lg font-semibold">View Full System Prompt</span>
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
                <h2 className="text-2xl font-bold font-headline">Visual Assets</h2>
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
                  <h3 className="text-xl font-semibold">No visual assets yet</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Amp is a coding-focused agent. Assets here usually represent development environments or UI previews.
                  </p>
                  <Button variant="outline" className="mt-6" asChild>
                    <Link href="/prompt/edit">
                      Generate Asset
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
                Amp Agent Best Practices
              </h2>
              <div className="grid md:grid-cols-3 gap-8 relative z-10">
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">1</div>
                    Context is King
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Amp performs best when you provide file paths or ask it to search. Don't guess; ask Amp to "search the codebase for X".
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">2</div>
                    Iterative Oracle
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    For bugs, first ask Amp to "run tests to confirm". Then ask "what the oracle thinks about the logs".
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs">3</div>
                    Atomic Tasks
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Break large features into small prompts. Amp handles 1-3 file changes perfectly; 10+ changes might require multiple passes.
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
