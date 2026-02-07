'use client';

import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { imageTagsData } from '@/lib/image-tags-data';
import {
  Palette,
  Image as ImageIcon,
  Wand2,
  Banana,
  CheckCircle2,
  Frame,
  Store,
  Lightbulb,
  Heart,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import {
  PlaceHolderImages,
  type ImagePlaceholder,
} from '@/lib/placeholder-images';
import Image from 'next/image';

const icons = {
  Palette: <Palette className="h-6 w-6" />,
  Image: <ImageIcon className="h-6 w-6" />,
  Frame: <Frame className="h-6 w-6" />,
  Store: <Store className="h-6 w-6" />,
  Lightbulb: <Lightbulb className="h-6 w-6" />,
};

export default function ImageTagsClient() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredImages = useMemo(() => {
    if (!selectedTag) return [];
    return PlaceHolderImages.filter(
      item =>
        item.tags.map(t => t.toLowerCase()).includes(selectedTag.toLowerCase()) &&
        item.type === 'image' &&
        item.imageUrl
    );
  }, [selectedTag]);

  const [likes, setLikes] = useState<
    Record<string, { count: number; isLiked: boolean }>
  >({});

  useEffect(() => {
    const initialLikes: Record<string, { count: number; isLiked: boolean }> =
      {};
    PlaceHolderImages.forEach(i => {
      if (i.imageUrl) {
        const deterministicCount =
          (parseInt(i.id.replace(/\D/g, '') || '0', 10) % 2400) + 100;
        initialLikes[i.id] = { count: deterministicCount, isLiked: false };
      }
    });
    setLikes(initialLikes);
  }, []);

  const handleLike = (itemId: string) => {
    setLikes(prev => {
      const currentItem = prev[itemId];
      const newIsLiked = !currentItem.isLiked;
      const newCount = newIsLiked
        ? currentItem.count + 1
        : currentItem.count - 1;
      return {
        ...prev,
        [itemId]: { count: newCount, isLiked: newIsLiked },
      };
    });
  };

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
              <strong>83</strong> unique tags across visual styles, subjects,
              compositions, brands & products, and lighting. Find the perfect
              inspiration for your next creation!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button variant="outline" asChild>
                <Link href="/image-prompts">Explore All Images</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/image-prompts?tag=nano%20banana">
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
                <span>Generate videos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Create images</span>
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
                  index === 0 &&
                    'bg-purple-50/20 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50',
                  index === 1 &&
                    'bg-green-50/20 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50',
                  index === 2 &&
                    'bg-blue-50/20 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
                  index === 3 &&
                    'bg-red-50/20 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50',
                  index === 4 &&
                    'bg-yellow-50/20 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/50'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      index === 0 &&
                        'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
                      index === 1 &&
                        'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                      index === 2 &&
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
                      index === 3 &&
                        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
                      index === 4 &&
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
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
                      className="h-auto"
                      onClick={() => setSelectedTag(tag.name)}
                    >
                      <span>{tag.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {tag.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
                {category.name === 'Composition' && (
                  <div className="text-center mt-6">
                    <Button variant="link">View all 24 composition tags</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
          {selectedTag && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline mb-8 text-center">
                Images tagged with &quot;{selectedTag}&quot;
              </h2>
              {filteredImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredImages.map(item => (
                    <Card
                      key={item.id}
                      className="overflow-hidden group h-full flex flex-col bg-card"
                    >
                      <CardHeader>
                        <CardTitle className="font-headline text-xl">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-3 h-auto">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 pt-0 space-y-4 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Tag className="w-4 h-4" />
                          <span className="truncate">{item.tags.join(', ')}</span>
                        </div>
                          <div className="relative aspect-[3/4] rounded-md overflow-hidden">
                          <Image
                            src={item.imageUrl}
                            alt={item.description}
                            fill
                            unoptimized={item.imageUrl?.includes('meta.ai')}
                            className="object-cover"
                            data-ai-hint={item.imageHint}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 p-4 border-t flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Button size="sm" asChild>
                            <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                                <Wand2 className="w-4 h-4 mr-2" />
                                Use this prompt
                            </Link>
                          </Button>
                           <Button
                            variant="secondary"
                            size="sm"
                            asChild
                          >
                            <Link href={`/gallery/${item.id}`}>View</Link>
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{likes[item.id]?.count.toLocaleString()}</span>
                          <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => handleLike(item.id)}>
                              <Heart className="w-4 h-4" fill={likes[item.id]?.isLiked ? 'currentColor' : 'none'} />
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No images found for this tag.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
