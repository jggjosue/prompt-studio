'use client';

import { handleImageGeneration, type ImageGenerationFormState } from '@/app/actions';
import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Clapperboard, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

function GenerateButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={true}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      Generate
    </Button>
  );
}

export default function PromptEditorClient() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';
  const [prompt, setPrompt] = useState(initialPrompt);

  const initialState: ImageGenerationFormState = { message: '', imageUrl: '' };
  const [state, formAction] = useActionState(handleImageGeneration, initialState);

  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'success' && state.imageUrl) {
      toast({
        title: 'Image Generated!',
        description: 'Your image has been created.',
      });
    } else if (state.message !== '' && state.message !== 'success') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.issues ? state.issues.join(', ') : state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-5xl">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h1 className="text-2xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline text-balance px-2">
              Create & Discover Stunning AI Videos & Images
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Explore thousands of AI video and image prompts for AI Video
              Generator. Browse curated examples, gather creative inspiration,
              and generate professional-quality content with our AI-powered
              tools and prompt library.
            </p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 w-full max-w-md sm:max-w-none justify-center">
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                    <Link href="/#gallery">
                        View Examples
                    </Link>
                </Button>
                <Button variant="secondary" className="w-full sm:w-auto" asChild>
                  <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                    <Sparkles className="mr-2" />
                    Nano Banana Pro
                  </Link>
                </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-4">
                <Tabs defaultValue="ai-image">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ai-image">
                      <ImageIcon className="mr-2" /> AI Image
                    </TabsTrigger>
                    <TabsTrigger value="ai-video">
                      <Clapperboard className="mr-2" /> AI Video
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="ai-image">
                    <Tabs defaultValue="text-to-image">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="text-to-image" className="text-xs sm:text-sm">
                          Text to Image
                        </TabsTrigger>
                        <TabsTrigger value="image-to-image" className="text-xs sm:text-sm">
                          Image to Image
                        </TabsTrigger>
                      </TabsList>
                      <form action={formAction}>
                        <TabsContent value="text-to-image">
                          <div className="relative mt-4">
                            <Textarea
                              name="prompt"
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              className="h-64 text-base pb-10"
                              placeholder='{"subject":{"description":"Young western woman with long blonde wavy hair..."}, ...}'
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                              {prompt.length} / 10000
                            </div>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-4">
                            <Select defaultValue="nano-banana-pro">
                              <SelectTrigger className="w-full md:w-[200px]">
                                <SelectValue placeholder="Select Model" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nano-banana-pro">
                                  Nano Banana Pro
                                </SelectItem>
                                <SelectItem value="starlight-xl">
                                  Starlight XL
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue="1-1">
                              <SelectTrigger className="w-full md:w-[100px]">
                                <SelectValue placeholder="Aspect Ratio" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1-1">1:1</SelectItem>
                                <SelectItem value="16-9">16:9</SelectItem>
                                <SelectItem value="9-16">9:16</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue="1k">
                              <SelectTrigger className="w-full md:w-[100px]">
                                <SelectValue placeholder="Resolution" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1k">1K</SelectItem>
                                <SelectItem value="2k">2K</SelectItem>
                                <SelectItem value="4k">4K</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue="png">
                              <SelectTrigger className="w-full md:w-[100px]">
                                <SelectValue placeholder="Format" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="png">PNG</SelectItem>
                                <SelectItem value="jpeg">JPEG</SelectItem>
                              </SelectContent>
                            </Select>
                            <div className="w-full md:w-auto md:ml-auto flex justify-end items-center gap-4">
                                <span className="text-sm text-muted-foreground">12 Credits</span>
                                <GenerateButton />
                            </div>
                          </div>
                        </TabsContent>
                      </form>
                      <TabsContent value="image-to-image">
                         <div className="text-center py-12 text-muted-foreground">Image to Image editor coming soon.</div>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                  <TabsContent value="ai-video">
                     <div className="text-center py-12 text-muted-foreground">AI Video editor coming soon.</div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 h-full flex items-center justify-center bg-muted/50 rounded-lg">
                {state.imageUrl ? (
                  <div className="relative w-full aspect-square">
                    <Image
                      src={state.imageUrl}
                      alt="Generated image"
                      fill
                      unoptimized={state.imageUrl?.includes('meta.ai')}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="mx-auto h-12 w-12" />
                    <p className="mt-2">Your generated image will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
