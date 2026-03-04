'use client';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PlaceHolderVideos } from '@/lib/placeholder-videos';
import { Heart, Sparkles, Tag, Wand2, Image as ImageIcon, Video, LayoutGrid } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, Suspense, useCallback } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useFirebase } from '@/firebase';
import { doc, onSnapshot, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function LikeButton({ item }: { item: any }) {
  const { firestore, user, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [mounted, setMounted] = useState(false);

  const collectionName = item.type === 'video' ? 'placeholderVideos' : 'placeholderImages';

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!firestore || !mounted) return;
    const docRef = doc(firestore, collectionName, item.id);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setLikeCount(data.metadata?.likes ?? data.likes ?? 0);
      } else {
        setLikeCount(0);
      }
    });
  }, [firestore, item.id, collectionName, mounted]);

  useEffect(() => {
    if (!firestore || !user || !mounted) {
      setIsLiked(false);
      return;
    }
    const userLikeRef = doc(firestore, `user-likes/${user.uid}/items/${item.id}`);
    return onSnapshot(userLikeRef, (docSnap) => {
      setIsLiked(docSnap.exists());
    });
  }, [firestore, user, item.id, mounted]);

  const handleLike = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please log in to like prompts.', variant: 'destructive' });
      return;
    }
    if (isLiking) return;
    setIsLiking(true);
    try {
      await runTransaction(firestore!, async (transaction) => {
        const docRef = doc(firestore!, collectionName, item.id);
        const userLikeRef = doc(firestore!, `user-likes/${user.uid}/items/${item.id}`);
        const docSnap = await transaction.get(docRef);
        const userLikeSnap = await transaction.get(userLikeRef);
        const currentLikes = docSnap.exists() ? (docSnap.data().metadata?.likes ?? docSnap.data().likes ?? 0) : 0;
        if (userLikeSnap.exists()) {
          transaction.delete(userLikeRef);
          transaction.set(docRef, { metadata: { likes: Math.max(0, currentLikes - 1) } }, { merge: true });
        } else {
          transaction.set(userLikeRef, { likedAt: serverTimestamp() });
          transaction.set(docRef, { metadata: { likes: currentLikes + 1 } }, { merge: true });
        }
      });
    } finally {
      setIsLiking(false);
    }
  }, [user, item.id, firestore, collectionName, isLiking, toast]);

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-semibold">{likeCount?.toLocaleString() ?? '...'}</span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLike} disabled={isLiking || isUserLoading}>
        <Heart fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-red-500' : ''} />
      </Button>
    </div>
  );
}

function PromptsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Skeleton key={i} className="h-[400px] w-full rounded-xl" />
      ))}
    </div>
  );
}

function PromptsContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const itemsPerPage = 12;

  const allContent = useMemo(() => {
    const combined = [...PlaceHolderImages, ...PlaceHolderVideos];
    return combined.filter(item => {
      if (filter === 'all') return true;
      return item.type === filter;
    });
  }, [filter]);

  const totalPages = Math.ceil(allContent.length / itemsPerPage);
  const paginatedContent = allContent.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [filter]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col items-center space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
          The Prompt Library
        </h1>
        <p className="mx-auto max-w-[800px] text-muted-foreground md:text-xl">
          Discover the ultimate collection of AI generation prompts. Filter by content type, explore styles, and kickstart your creative process.
        </p>
        
        <Tabs defaultValue="all" className="w-full max-w-md" onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all"><LayoutGrid className="mr-2 h-4 w-4" /> All</TabsTrigger>
            <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" /> Images</TabsTrigger>
            <TabsTrigger value="video"><Video className="mr-2 h-4 w-4" /> Videos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedContent.map((item) => (
          <Card key={item.id} className="overflow-hidden group h-full flex flex-col hover:shadow-xl transition-all border-primary/10">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-lg line-clamp-1">{item.title}</CardTitle>
                {item.type === 'video' ? <Video className="h-4 w-4 text-primary" /> : <ImageIcon className="h-4 w-4 text-primary" />}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4 flex-grow">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                {item.type === 'video' ? (
                  <video src={item.imageUrl} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" />
                )}
                <div className="absolute top-2 left-2 flex gap-1 flex-wrap pr-10">
                  {item.tags.slice(0, 2).map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm uppercase font-bold tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 p-4 border-t flex items-center justify-between">
              <Button size="sm" variant="secondary" asChild>
                <Link href={item.type === 'video' ? `/gallery-videos/${item.id}` : `/gallery/${item.id}`}>
                  View Details
                </Link>
              </Button>
              <LikeButton item={item} />
            </CardFooter>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if(currentPage > 1) setCurrentPage(p => p - 1); }} />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink href="#" isActive={currentPage === i + 1} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) setCurrentPage(p => p + 1); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default function PromptsClient() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 md:py-20">
        <div className="container max-w-7xl">
          <Suspense fallback={<PromptsSkeleton />}>
            <PromptsContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
