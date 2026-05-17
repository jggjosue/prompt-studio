'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { PremiumMembershipButton } from '@/components/web-page-premium-button';
import { WebPagePromptDialog } from '@/components/web-page-prompt-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getRefactoryLoaderUrl } from '@/lib/refactory-online';
import type { WebPageEntry } from '@/lib/web-pages';
import { useLocalizedWebPages } from '@/hooks/use-localized-catalog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Check, Copy, ExternalLink, FileText, Globe, Tag } from 'lucide-react';
import Image from 'next/image';
import { PremiumAccessLink } from '@/components/premium-access-link';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo } from 'react';

const ITEMS_PER_PAGE = 30;

function LandingPagesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const webPages = useLocalizedWebPages();
  const pages = useMemo(() => webPages.filter(p => p.imageUrl), [webPages]);

  const totalPages = Math.max(1, Math.ceil(pages.length / ITEMS_PER_PAGE));
  const pageParam = parseInt(searchParams.get('page') ?? '1', 10);
  const currentPage = Number.isFinite(pageParam)
    ? Math.min(Math.max(1, pageParam), totalPages)
    : 1;

  const paginatedPages = pages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const rangeStart = pages.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, pages.length);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Landing Page Prompts
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Prompts and live HTML demos for SaaS landing pages — dark, light,
          Next.js, and DevTool variants.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {paginatedPages.map(page => (
          <Card
            key={page.id}
            className="overflow-hidden group h-full flex flex-col bg-card"
          >
            <CardHeader>
              <CardTitle className="font-headline text-xl">{page.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {page.stack.join(' · ')}
              </p>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 flex-grow">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Tag className="w-4 h-4 shrink-0" />
                <span className="truncate">{page.tags.join(', ')}</span>
              </div>
              <div className="relative aspect-video rounded-md overflow-hidden border">
                <Image
                  src={page.imageUrl}
                  alt={page.title}
                  fill
                  className="object-cover"
                  data-ai-hint={page.imageHint}
                />
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 border-t flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <WebPagePromptDialog page={page} />
                <PremiumMembershipButton membership={page.membership} />
              </div>
              {page.demoUrl ? (
                <Button size="sm" asChild>
                  <PremiumAccessLink
                    membership={page.membership}
                    href={getRefactoryLoaderUrl(page.demoUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open demo
                  </PremiumAccessLink>
                </Button>
              ) : (
                <Button size="sm" variant="secondary" disabled>
                  <Globe className="w-4 h-4 mr-2" />
                  Prompt only
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {pages.length > ITEMS_PER_PAGE && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {rangeStart}–{rangeEnd} de {pages.length} · Página {currentPage} de{' '}
            {totalPages}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  className={cn(
                    currentPage <= 1 && 'pointer-events-none opacity-50'
                  )}
                  onClick={e => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  aria-disabled={currentPage <= 1}
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  className={cn(
                    currentPage >= totalPages && 'pointer-events-none opacity-50'
                  )}
                  onClick={e => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  aria-disabled={currentPage >= totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </>
  );
}

export default function LandingPagesClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-80 rounded-lg border bg-muted/30 animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <LandingPagesContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
