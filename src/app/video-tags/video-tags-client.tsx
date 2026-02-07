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
import {
  videoTagsData,
  type TagCategory,
} from '@/lib/video-tags-data';
import {
  Wand2,
  Banana,
  CheckCircle2,
  Heart,
  Tag,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import {
  PlaceHolderVideos,
  type VideoProp,
} from '@/lib/placeholder-videos';

const icons = {
  Wand2: <Wand2 className="h-6 w-6" />,
  Tag: <Tag className="h-6 w-6" />,
  Settings: <Settings className="h-6 w-6" />,
};

export default function VideoTagsClient() {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredVideos = useMemo(() => {
    if (!selectedTag) return [];
    return PlaceHolderVideos.filter(
      item =>
        item.tags.map(t => t.toLowerCase()).includes(selectedTag.toLowerCase()) &&
        item.type === 'video' &&
        item.imageUrl
    );
  }, [selectedTag]);
  
    const [likes, setLikes] = useState<
    Record<string, { count: number; isLiked: boolean }>
  >({});

  useEffect(() => {
    const initialLikes: Record<string, { count: number; isLiked: boolean }> =
      {};
    PlaceHolderVideos.forEach(i => {
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
              Explore Video Prompts by Tags
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover <strong>42</strong> AI-generated videos organized by{' '}
              <strong>25</strong> unique tags across visual styles, settings, subjects,
              brands & products, and effects & techniques. Find the perfect inspiration for your next creation!
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button variant="outline" asChild>
                <Link href="/video-prompts">Explore All Videos</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/video-prompts?filter=nano-banana">
                  <Banana className="mr-2 h-4 w-4" />
                  Nano Banana Pro
                </Link>
              </Button>
              <Button asChild>
                <Link href="/prompt/edit">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate a Video
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
            {videoTagsData.map((category, index) => (
              <Card
                key={category.name}
                className={cn(
                  'p-6 md:p-8',
                  index === 0 &&
                    'bg-red-50/20 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50',
                  index === 1 &&
                    'bg-green-50/20 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50',
                  index === 2 &&
                    'bg-blue-50/20 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      index === 0 &&
                        'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
                      index === 1 &&
                        'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
                      index === 2 &&
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
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
              </Card>
            ))}
          </div>
          
          {selectedTag && (
            <div className="mt-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline mb-8 text-center">
                Videos tagged with &quot;{selectedTag}&quot;
              </h2>
              {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                  {filteredVideos.map(item => (
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
                        <div className="relative aspect-[9/16] rounded-md overflow-hidden">
                          <video
                            src={item.imageUrl}
                            playsInline
                            controls
                            className="w-full h-full object-cover"
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
                              <Link href={`/gallery-videos/${item.id}`}>View</Link>
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
                <p className="text-center text-muted-foreground">No videos found for this tag.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
