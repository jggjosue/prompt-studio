'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Sparkles, Tag, Wand2, Heart } from 'lucide-react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import {
  PlaceHolderImages,
  type ImagePlaceholder,
} from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIsMobile } from '@/hooks/use-mobile';


export default function ImagePromptsClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all');
  const itemsPerPage = 18;
  const isMobile = useIsMobile();

  const imageContent: ImagePlaceholder[] = useMemo(() => {
    return PlaceHolderImages.filter(item => {
      if (item.type !== 'image' || !item.imageUrl) return false;
      if (filter === 'nano-banana') {
        return item.title.toLowerCase().includes('nano banana');
      }
      return true;
    });
  }, [filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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
    const maxPagesToShow = isMobile ? 3 : 5;
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
              Explore AI Image Prompts
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-xl">
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
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button variant="outline">
                <Tag className="mr-2" />
                Browse by Tags
              </Button>
              <Button asChild disabled>
                <Link href="/prompt/edit">
                  <Wand2 className="mr-2" />
                  Generate an Image
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedContent.map(item => (
              <Card
                key={item.id}
                className="overflow-hidden group h-full flex flex-col bg-card"
              >
                <CardHeader>
                  <CardTitle className="font-headline text-xl">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3 md:min-h-0">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 space-y-4 flex-grow">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    <span className="truncate">{item.tags.join(', ')}</span>
                  </div>
                  <div className="relative aspect-[4/5] rounded-md overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.description}
                      fill
                      className="object-cover"
                      data-ai-hint={item.imageHint}
                    />
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 p-4 border-t gap-2 flex-wrap">
                  <Button variant="outline" size="icon" disabled>
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button size="sm" asChild disabled>
                     <Link href={`/prompt/edit?prompt=${encodeURIComponent(item.description)}`}>
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
