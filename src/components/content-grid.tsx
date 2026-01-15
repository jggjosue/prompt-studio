'use client';

import { useState, useMemo } from 'react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Heart, PlayCircle, Tag, Wand2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';


export default function ContentGrid() {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('popular');
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredContent = useMemo(() => {
    let content = [...PlaceHolderImages];

    if (filter !== 'all') {
      content = content.filter(item => item.type === filter);
    }

    if (sort === 'newest') {
      content.sort((a, b) => parseInt(b.id) - parseInt(a.id));
    } else if (sort === 'oldest') {
      content.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    }

    return content;
  }, [filter, sort]);
  
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);

  const paginatedContent = useMemo(() => {
     return filteredContent.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredContent, currentPage, itemsPerPage]);

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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold font-headline">
          Community Gallery
        </h3>
        <div className="flex gap-4">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Filter by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Per Page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9">9 per page</SelectItem>
              <SelectItem value="18">18 per page</SelectItem>
              <SelectItem value="27">27 per page</SelectItem>
              <SelectItem value="36">36 per page</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedContent.map(item => (
          <Card key={item.id} className="overflow-hidden group h-full flex flex-col">
             <CardHeader>
               <CardTitle className="font-headline text-xl">{item.title}</CardTitle>
               <CardDescription className="line-clamp-2">{item.description}</CardDescription>
             </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 flex-grow">
               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <Tag className="w-4 h-4" />
                 <span>{item.tags.join(', ')}</span>
               </div>
              <div className="relative aspect-video rounded-md overflow-hidden">
                {item.type === 'video' ? (
                  <>
                    <Image
                      src={item.imageUrl}
                      alt={item.description}
                      fill
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={item.imageHint}
                    />
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white/80" />
                    </div>
                  </>
                ) : (
                   <Image
                    src={item.imageUrl}
                    alt={item.description}
                    fill
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={item.imageHint}
                  />
                )}
              </div>
              {item.type === 'video' && <p className="text-sm text-muted-foreground">Duration: 5 seconds</p>}
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t gap-2">
                <Button variant="outline" size="sm" asChild>
                   <Link href="/login">
                    <Heart className="w-4 h-4" />
                   </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link
                    href={`/prompt/edit?prompt=${encodeURIComponent(
                      item.description
                    )}`}
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Use this prompt
                  </Link>
                </Button>
                <Button variant="secondary" size="sm" asChild className="ml-auto">
                   <Link href={`/gallery/${item.id}`}>
                    View
                   </Link>
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
  );
}
