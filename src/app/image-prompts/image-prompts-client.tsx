'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PlaceHolderImages,
  type ImagePlaceholder,
} from '@/lib/placeholder-images';
import { Heart, Sparkles, Tag, Wand2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

function ImagePromptsSkeleton() {
  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4 pt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {Array.from({ length: 9 }).map((_, index) => (
          <Card key={index} className="overflow-hidden group h-full flex flex-col bg-card">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-4 w-2/3 mt-1" />
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 flex-grow">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="aspect-[3/4] w-full rounded-md" />
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t">
              <div className="flex justify-between w-full">
                 <Skeleton className="h-8 w-24" />
                 <Skeleton className="h-8 w-16" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}

function ImagePromptsContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const itemsPerPage = 18;
  const searchParams = useSearchParams();
  const tagFromUrl = searchParams.get('tag');

  const imageContent: ImagePlaceholder[] = useMemo(() => {
    let filteredImages = PlaceHolderImages.filter(
      item => item.type === 'image' && item.imageUrl
    );

    if (filter === 'nano-banana') {
      filteredImages = filteredImages.filter(item =>
        item.tags.map(t => t.toLowerCase()).includes('nano banana')
      );
    }

    if (tagFromUrl) {
      filteredImages = filteredImages.filter(item =>
        item.tags.map(t => t.toLowerCase()).includes(tagFromUrl.toLowerCase())
      );
    }
    
    return filteredImages;
  }, [filter, tagFromUrl]);

  const [likes, setLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({});

  useEffect(() => {
    const initialLikes: Record<string, { count: number; isLiked: boolean }> = {};
    imageContent.forEach(i => {
        if (i.imageUrl) {
          const deterministicCount = (parseInt(i.id.replace(/\D/g, '') || "0", 10) % 2400) + 100;
          initialLikes[i.id] = { count: deterministicCount, isLiked: false };
        }
    });
    setLikes(initialLikes);
  }, [imageContent]);

  const handleLike = (itemId: string) => {
    setLikes(prev => {
        const currentItem = prev[itemId];
        const newIsLiked = !currentItem.isLiked;
        const newCount = newIsLiked ? currentItem.count + 1 : currentItem.count - 1;
        return {
            ...prev,
            [itemId]: { count: newCount, isLiked: newIsLiked }
        };
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, tagFromUrl]);

  const totalPages = Math.ceil(imageContent.length / itemsPerPage);

  const paginatedContent = imageContent.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationLinks = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > halfMaxPages + 2) {
        pageNumbers.push('ellipsis-start');
      }

      let startPage = Math.max(2, currentPage - halfMaxPages);
      let endPage = Math.min(totalPages - 1, currentPage + halfMaxPages);

      if (currentPage < halfMaxPages + 2) {
        endPage = maxPagesToShow - 1;
      }
      if (currentPage > totalPages - (halfMaxPages + 1)) {
        startPage = totalPages - (maxPagesToShow - 2);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - (halfMaxPages + 1)) {
        pageNumbers.push('ellipsis-end');
      }
      pageNumbers.push(totalPages);
    }

    return pageNumbers.map((page, index) => {
      if (typeof page === 'string') {
        return <PaginationEllipsis key={page + index} />;
      }
      return (
        <PaginationItem key={page}>
          <PaginationLink
            href="#"
            isActive={currentPage === page}
            onClick={e => {
              e.preventDefault();
              handlePageChange(page);
            }}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
      );
    });
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
              Explore AI Image Prompts
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover thousands of AI image prompts and examples. Get inspired
              and create your own AI generated images.
            </p>
            <Tabs
              defaultValue="all"
              className="w-full max-w-md pt-4"
              onValueChange={value => setFilter(value)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="all">All Prompts</TabsTrigger>
                <TabsTrigger value="nano-banana">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Nano Banana Pro
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" asChild>
                <Link href="/image-tags">
                  <Tag className="mr-2" />
                  Browse by Tags
                </Link>
              </Button>
              <Button asChild>
                <Link href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
                    <Wand2 className="mr-2" />
                    Generate an Image
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {paginatedContent.map(item => (
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
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{likes[item.id]?.count.toLocaleString()}</span>
                    <Button variant="outline" size="icon" className="w-8 h-8" onClick={() => handleLike(item.id)}>
                        <Heart className="w-4 h-4" fill={likes[item.id]?.isLiked ? 'currentColor' : 'none'} />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>
                {renderPaginationLinks()}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={e => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
    </>
  );
}

export default function ImagePromptsClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <Suspense fallback={<ImagePromptsSkeleton />}>
            <ImagePromptsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
