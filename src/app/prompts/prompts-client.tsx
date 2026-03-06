'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Folder, ChevronRight, Search, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { Input } from '@/components/ui/input';
import { promptModels } from '@/lib/models-list';

function PromptsContent() {
  const [searchTerm, setSearcherTerm] = useState('');

  const filteredModels = promptModels.filter(model => 
    model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
          The Prompt Library
        </h1>
        <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl">
          Explore expertly crafted prompts organized by AI models and development tools. 
          Find the perfect starting point for your next project.
        </p>
        
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search models..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearcherTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map((model) => (
          <Link 
            key={model} 
            href={`/prompts/${encodeURIComponent(model.toLowerCase().replace(/\s+/g, '-'))}`}
            className="group"
          >
            <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer overflow-hidden">
              <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Folder className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                    {model}
                  </CardTitle>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-0">
                <p className="text-xs text-muted-foreground">
                  Browse curated prompts for {model} tools and systems.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No models found matching your search.</p>
        </div>
      )}

      <div className="bg-muted/30 rounded-2xl p-8 md:p-12 text-center space-y-6 max-w-4xl mx-auto border border-primary/5">
        <Sparkles className="h-10 w-10 text-primary mx-auto" />
        <h2 className="text-2xl md:text-3xl font-bold">Need a custom prompt?</h2>
        <p className="text-muted-foreground">
          Use our AI-powered generator to create high-quality prompts for any of these models in seconds.
        </p>
        <Button size="lg" asChild>
          <Link href="/prompt/edit">
            Go to Generator
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function PromptsClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-7xl">
          <Suspense fallback={<div className="flex justify-center py-20">Loading Library...</div>}>
            <PromptsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
