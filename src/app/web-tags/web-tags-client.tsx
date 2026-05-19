'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { PremiumMembershipButton } from '@/components/web-page-premium-button';
import { WebPagePromptDialog } from '@/components/web-page-prompt-dialog';
import { Badge } from '@/components/ui/badge';
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
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { getRefactoryLoaderUrl } from '@/lib/refactory-online';
import { cn, shouldUnoptimizeImage } from '@/lib/utils';
import { useLocalizedWebPages } from '@/hooks/use-localized-catalog';
import { webTagCategoryDefs, type WebTagCategory } from '@/lib/web-tags-data';
import {
  Building2,
  CheckCircle2,
  Code2,
  Crown,
  ExternalLink,
  Globe,
  LayoutGrid,
  Palette,
  Tag,
  Wand2,
} from 'lucide-react';
import Image from 'next/image';
import { PremiumAccessLink } from '@/components/premium-access-link';
import { useMembershipAccess } from '@/hooks/use-membership-access';
import { membershipRequiresPayment } from '@/lib/membership-access';
import { PromptEditButton } from '@/components/prompt-edit-button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState, type ReactNode } from 'react';

const icons: Record<string, ReactNode> = {
  LayoutGrid: <LayoutGrid className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Building2: <Building2 className="h-6 w-6" />,
  Code2: <Code2 className="h-6 w-6" />,
  Crown: <Crown className="h-6 w-6" />,
  Tag: <Tag className="h-6 w-6" />,
};

const categoryCardStyles = [
  'bg-purple-50/20 dark:bg-purple-950/20 border-purple-200/50 dark:border-purple-800/50',
  'bg-green-50/20 dark:bg-green-950/20 border-green-200/50 dark:border-green-800/50',
  'bg-blue-50/20 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50',
  'bg-red-50/20 dark:bg-red-950/20 border-red-200/50 dark:border-red-800/50',
  'bg-yellow-50/20 dark:bg-yellow-950/20 border-yellow-200/50 dark:border-yellow-800/50',
  'bg-orange-50/20 dark:bg-orange-950/20 border-orange-200/50 dark:border-orange-800/50',
];

const categoryIconStyles = [
  'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
];

const ITEMS_PER_PAGE = 18;

export type WebFilter =
  | { kind: 'tag'; value: string; label: string }
  | { kind: 'stack'; value: string; label: string }
  | { kind: 'membership'; value: string; label: string };

function WebTagsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const webPages = useLocalizedWebPages();
  const { ready, canAccessMembership, requestAccess, runWithAccess } =
    useMembershipAccess();
  const [filter, setFilter] = useState<WebFilter | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const allPages = useMemo(
    () => webPages.filter(page => page.imageUrl),
    [webPages]
  );

  const { webTagsData, totalWebPages, totalUniqueTags } = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    const stackCounts: Record<string, number> = {};
    const membershipCounts: Record<string, number> = {};

    allPages.forEach(page => {
      page.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      page.stack.forEach(stack => {
        stackCounts[stack] = (stackCounts[stack] || 0) + 1;
      });
      if (page.membership) {
        membershipCounts[page.membership] =
          (membershipCounts[page.membership] || 0) + 1;
      }
    });

    const assignedTags = new Set<string>();
    const categories: (WebTagCategory & {
      tags: { name: string; count: number }[];
      count: number;
    })[] = webTagCategoryDefs.map(def => {
      const tagsWithCounts = def.tags
        .map(name => {
          let count = 0;
          if (def.kind === 'tag') {
            count = tagCounts[name] || 0;
            if (count > 0) assignedTags.add(name);
          } else if (def.kind === 'stack') {
            count = stackCounts[name] || 0;
          } else if (def.kind === 'membership') {
            count = membershipCounts[name] || 0;
          }
          return { name, count };
        })
        .filter(tag => tag.count > 0)
        .sort((a, b) => b.count - a.count);

      const categoryCount = tagsWithCounts.reduce(
        (sum, tag) => sum + tag.count,
        0
      );

      return {
        ...def,
        tags: tagsWithCounts,
        count: categoryCount,
      };
    });

    const popularTags = Object.entries(tagCounts)
      .filter(([name, count]) => !assignedTags.has(name) && count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([name, count]) => ({ name, count }));

    if (popularTags.length > 0) {
      categories.push({
        name: 'Popular Tags',
        description: 'Frequently used tags across landing page prompts',
        icon: 'Tag',
        kind: 'tag',
        tags: popularTags,
        count: popularTags.reduce((sum, tag) => sum + tag.count, 0),
      });
    }

    return {
      webTagsData: categories.filter(category => category.tags.length > 0),
      totalWebPages: allPages.length,
      totalUniqueTags: Object.keys(tagCounts).length,
    };
  }, [allPages]);

  useEffect(() => {
    const tag = searchParams.get('tag');
    const stack = searchParams.get('stack');
    const membership = searchParams.get('membership');

    if (tag) {
      setFilter({ kind: 'tag', value: tag, label: tag });
    } else if (stack) {
      setFilter({ kind: 'stack', value: stack, label: stack });
    } else if (membership) {
      setFilter({
        kind: 'membership',
        value: membership,
        label: membership,
      });
    }
  }, [searchParams]);

  const filteredPages = useMemo(() => {
    if (!filter) return [];

    return allPages.filter(page => {
      if (filter.kind === 'tag') {
        return page.tags.some(
          tag => tag.toLowerCase() === filter.value.toLowerCase()
        );
      }
      if (filter.kind === 'stack') {
        return page.stack.some(
          stack => stack.toLowerCase() === filter.value.toLowerCase()
        );
      }
      return page.membership?.toLowerCase() === filter.value.toLowerCase();
    });
  }, [allPages, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (!ready || !filter || filter.kind !== 'membership') return;
    if (!membershipRequiresPayment(filter.value)) return;
    if (!canAccessMembership(filter.value)) {
      requestAccess(filter.value);
    }
  }, [ready, filter, canAccessMembership, requestAccess]);

  const totalResultPages = Math.ceil(filteredPages.length / ITEMS_PER_PAGE);
  const paginatedPages = filteredPages.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalResultPages) {
      setCurrentPage(page);
    }
  };

  const handleSelectFilter = (category: WebTagCategory, tagName: string) => {
    const applyFilter = () => {
      setFilter({
        kind: category.kind,
        value: tagName,
        label: tagName,
      });
      if (category.kind === 'membership') {
        router.push(
          `/web-tags?membership=${encodeURIComponent(tagName)}`,
          { scroll: false }
        );
      } else if (category.kind === 'stack') {
        router.push(`/web-tags?stack=${encodeURIComponent(tagName)}`, {
          scroll: false,
        });
      } else {
        router.push(`/web-tags?tag=${encodeURIComponent(tagName)}`, {
          scroll: false,
        });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (category.kind === 'membership') {
      runWithAccess(tagName, applyFilter);
      return;
    }

    applyFilter();
  };

  const isFilterActive = (category: WebTagCategory, tagName: string) =>
    filter?.kind === category.kind &&
    filter.value.toLowerCase() === tagName.toLowerCase();

  const renderPaginationLinks = () => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    if (totalResultPages <= maxPagesToShow) {
      for (let i = 1; i <= totalResultPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > halfMaxPages + 2) {
        pageNumbers.push('ellipsis-start');
      }

      let startPage = Math.max(2, currentPage - halfMaxPages);
      let endPage = Math.min(totalResultPages - 1, currentPage + halfMaxPages);

      if (currentPage < halfMaxPages + 2) {
        endPage = maxPagesToShow - 1;
      }
      if (currentPage > totalResultPages - (halfMaxPages + 1)) {
        startPage = totalResultPages - (maxPagesToShow - 2);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalResultPages - (halfMaxPages + 1)) {
        pageNumbers.push('ellipsis-end');
      }
      pageNumbers.push(totalResultPages);
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

  const filterHeading =
    filter?.kind === 'stack'
      ? `Stack: ${filter.label}`
      : filter?.kind === 'membership'
        ? `Membership: ${filter.label}`
        : filter?.label;

  return (
    <>
      <div className="flex flex-col items-center space-y-4 text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
          Explore Web Prompts by Tags
        </h1>
        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
          Discover landing page prompts organized by{' '}
          <strong>{totalUniqueTags}</strong> unique tags, tech stacks, and
          membership across <strong>{totalWebPages}</strong> live HTML demos.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/landing-pages">
              <Globe className="mr-2 h-4 w-4" />
              All landing pages
            </Link>
          </Button>
          <PromptEditButton href="/prompt/edit">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate a page
          </PromptEditButton>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 pt-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Live HTML demos</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Copy prompts instantly</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Filter by stack & tags</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {webTagsData.map((category, index) => (
          <Card
            key={category.name}
            className={cn(
              'p-6 md:p-8',
              categoryCardStyles[index % categoryCardStyles.length]
            )}
          >
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 min-w-0">
              <div
                className={cn(
                  'p-2 rounded-full',
                  categoryIconStyles[index % categoryIconStyles.length]
                )}
              >
                {icons[category.icon] ?? icons.Tag}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-headline break-words min-w-0 flex-1">{category.name}</h2>
              <Badge variant="secondary">{category.count}</Badge>
            </div>
            <p className="text-muted-foreground mb-6">{category.description}</p>
            <div className="flex flex-wrap gap-3">
              {category.tags.map(tag => (
                <Button
                  key={tag.name}
                  variant={
                    isFilterActive(category, tag.name) ? 'default' : 'outline'
                  }
                  className="h-auto"
                  onClick={() => handleSelectFilter(category, tag.name)}
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

      {filter && (
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline text-center">
              Pages matching &quot;{filterHeading}&quot;
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setFilter(null)}>
              Clear filter
            </Button>
          </div>
          {filteredPages.length > 0 ? (
            <>
              <p className="text-center text-sm text-muted-foreground mb-6">
                {filteredPages.length} result
                {filteredPages.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                {paginatedPages.map(page => (
                  <Card
                    key={page.id}
                    className="overflow-hidden group h-full flex flex-col bg-card"
                  >
                    <CardHeader>
                      <CardTitle className="font-headline text-xl">
                        {page.title}
                      </CardTitle>
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
                          sizes="(max-width: 640px) 100vw, 50vw"
                          className="object-cover"
                          data-ai-hint={page.imageHint}
                          unoptimized={shouldUnoptimizeImage(page.imageUrl)}
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
              {totalResultPages > 1 && (
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
                          aria-disabled={currentPage === totalResultPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground">
              No landing pages found for this filter.
            </p>
          )}
        </div>
      )}
    </>
  );
}

export default function WebTagsClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Suspense fallback={<div className="w-full h-16 border-b" />}>
        <Header />
      </Suspense>
      <main className="flex-1 py-12 md:py-16">
        <div className="container max-w-7xl">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-64 rounded-lg border bg-muted/30 animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <WebTagsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}