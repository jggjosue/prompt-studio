'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  PlaceHolderVideos,
  type VideoProp,
} from '@/lib/placeholder-videos';
import { Heart, Sparkles, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';

export default function VideoPromptsClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 18;

  const videoContent: VideoProp[] = PlaceHolderVideos;
  const { isAuthenticated } = useKindeBrowserClient();
  const [likes, setLikes] = useState<Record<string, { count: number; isLiked: boolean }>>({});

  useEffect(() => {
      const initialLikes: Record<string, { count: number; isLiked: boolean }> = {};
      PlaceHolderVideos.forEach(i => {
          if (i.imageUrl) {
              initialLikes[i.id] = { count: Math.floor(Math.random() * 2500) + 100, isLiked: false };
          }
      });
      setLikes(initialLikes);
  }, []);

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

  const totalPages = Math.ceil(videoContent.length / itemsPerPage);

  const paginatedContent = videoContent.slice(
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
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <div className="flex flex-col items-center space-y-4 text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
              Explore AI Video Prompts
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Discover thousands of AI video prompts and examples. Get inspired
              and create your own AI generated videos.
            </p>
            <div className="flex gap-4">
              <Button variant="outline">
                <Tag className="mr-2" />
                Browse by Tags
              </Button>
              <Button variant="secondary" disabled>
                <Sparkles className="mr-2" />
                Nano Banana Pro
              </Button>
              <Button disabled={true}>
                    <Wand2 className="mr-2" />
                    Generate a Video
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
                  <div className="relative aspect-[9/16] rounded-md overflow-hidden">
                    <video
                      src={item.imageUrl}
                      playsInline
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 border-t gap-2 flex-wrap items-start">
                   <div className="flex flex-col items-center">
                    <Button variant="outline" size="icon" onClick={() => handleLike(item.id)}>
                        <Heart className="w-4 h-4" fill={likes[item.id]?.isLiked ? 'currentColor' : 'none'} />
                    </Button>
                    <span className="text-xs text-muted-foreground mt-1">{likes[item.id]?.count.toLocaleString()}</span>
                  </div>
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
                    className="ml-auto"
                  >
                    <Link href={`/gallery/${item.id}`}>View Details</Link>
                  </Button>
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
                    onClick={(e) => {
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
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
