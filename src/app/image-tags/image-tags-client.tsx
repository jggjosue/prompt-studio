'use client';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { imageTagsData } from '@/lib/image-tags-data';
import {
  Palette,
  Image as ImageIcon,
  Wand2,
  Banana,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  Palette: <Palette className="h-6 w-6" />,
  Image: <ImageIcon className="h-6 w-6" />,
};

export default function ImageTagsClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
              Explore Image Prompts by Tags
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover <strong>6959</strong> AI-generated images organized by{' '}
              <strong>87</strong> unique tags across visual styles, subjects,
              compositions, brands & products, and lighting. Find the perfect
              inspiration for your next creation!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button variant="outline" asChild>
                <Link href="/image-prompts">Explore All Images</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/image-prompts?filter=nano-banana">
                  <Banana className="mr-2 h-4 w-4" />
                  Nano Banana Pro
                </Link>
              </Button>
              <Button asChild>
                <Link href="/prompt/edit">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate an Image
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Generate up to 2 videos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Create up to 15 images</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {imageTagsData.map((category, index) => (
              <Card
                key={category.name}
                className={cn(
                  'p-6 md:p-8',
                  index === 0
                    ? 'bg-purple-50/20 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50'
                    : 'bg-green-50/20 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      index === 0
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                    )}
                  >
                    {icons[category.icon as keyof typeof icons]}
                  </div>
                  <h2 className="text-2xl font-bold font-headline">
                    {category.name}
                  </h2>
                  <Badge variant="secondary">{category.count}</Badge>
                </div>
                <p className="text-muted-foreground mb-6">
                  {category.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  {category.tags.map(tag => (
                    <Button
                      key={tag.name}
                      variant="outline"
                      asChild
                      className="h-auto"
                    >
                      <Link
                        href={`/image-prompts?tag=${encodeURIComponent(
                          tag.name
                        )}`}
                      >
                        <span>{tag.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {tag.count}
                        </Badge>
                      </Link>
                    </Button>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
